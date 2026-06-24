import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  HemisphericLight,
  SceneLoader,
  PointerEventTypes,
  HighlightLayer,
  Mesh,
} from '@babylonjs/core'
import '@babylonjs/core/Loading/sceneLoader'
import '@babylonjs/loaders'
import { SceneMotionController } from './SceneMotionController'
import { bus } from './SceneDirector'
import { DirectorEvent } from './director-types'
import type {
  StageCommandBatch,
  StageControlCommand,
  StageMotionTrack,
} from '@/models/StageMotionTrack'
import type { AbstractMesh, Node } from '@babylonjs/core'

/** createScene 返回值，包含引擎、场景和销毁方法 */
export interface SceneContext {
  engine: Engine
  scene: Scene
  /** 运动控制器 */
  motionController: SceneMotionController
  /** 设置网格位置 */
  setPosition: (name: string, x: number, y: number, z: number) => void
  /** 执行批量运动命令 */
  executeBatch: (batch: StageCommandBatch) => void
  /** 执行控制命令 */
  executeControl: (cmd: StageControlCommand) => void
  /** 执行单个运动轨道 */
  executeTrack: (track: StageMotionTrack) => void
  /** 销毁引擎、停止渲染循环、移除事件监听 */
  dispose: () => void
}

export interface SceneCreateOptions {
  performanceMode?: boolean
  maxDevicePixelRatio?: number
  renderFps?: number
  debugLogs?: boolean
}

/**
 * 从 mesh 中提取 Revit ElementId / GUID
 * Revit 导出的 GLB 可能将标识信息存储在多个位置：
 * 1. mesh.name 本身就是 elementId
 * 2. mesh.metadata.gltf.extras 中包含 elementId / guid / uniqueId
 * 3. mesh._metadata 中
 */
function getGltfExtras(node: Node | null): Record<string, unknown> | undefined {
  const source = node as unknown as {
    metadata?: { gltf?: { extras?: Record<string, unknown> }; extras?: Record<string, unknown> }
    _metadata?: { gltf?: { extras?: Record<string, unknown> } }
  }

  return (
    source?.metadata?.gltf?.extras || source?.metadata?.extras || source?._metadata?.gltf?.extras
  )
}

function readFirst(
  source: Record<string, unknown> | undefined,
  keys: string[],
): string | undefined {
  if (!source) return undefined
  for (const key of keys) {
    if (source[key] != null) return String(source[key])
  }
  return undefined
}

function extractRevitIds(mesh: AbstractMesh): {
  elementId: string
  uniqueId?: string
  guid?: string
  sourceName: string
} {
  const elementIdKeys = [
    'ElementID',
    'ElementId',
    'elementId',
    'elementID',
    'element_id',
    'id',
    'ID',
  ]
  const uniqueIdKeys = ['UniqueId', 'UniqueID', 'uniqueId', 'uniqueID', 'unique_id']
  const guidKeys = ['Guid', 'GUID', 'guid', 'IfcGuid', 'ifcGuid', 'externalId', 'ExternalId']

  let node: Node | null = mesh
  while (node) {
    const extras = getGltfExtras(node)
    const metadata = node.metadata as Record<string, unknown> | undefined
    const elementId = readFirst(extras, elementIdKeys) || readFirst(metadata, elementIdKeys)
    const uniqueId = readFirst(extras, uniqueIdKeys) || readFirst(metadata, uniqueIdKeys)
    const explicitGuid = readFirst(extras, guidKeys) || readFirst(metadata, guidKeys)

    if (elementId || uniqueId || explicitGuid) {
      return {
        elementId: elementId || uniqueId || explicitGuid || mesh.name,
        uniqueId,
        guid:
          explicitGuid || (uniqueId && uniqueId.length >= 36 ? uniqueId.slice(0, 36) : undefined),
        sourceName: node.name,
      }
    }

    node = node.parent
  }

  return { elementId: mesh.name, sourceName: mesh.name }
}

function extractElementId(mesh: AbstractMesh): string {
  return extractRevitIds(mesh).elementId
}


function isSharedOrInstancedMesh(mesh: AbstractMesh, scene: Scene): boolean {
  const maybeInstanced = mesh as AbstractMesh & { sourceMesh?: Mesh }
  if (maybeInstanced.sourceMesh) return true

  if (!(mesh instanceof Mesh)) return true
  if (mesh.instances.length > 0) return true

  const geometry = mesh.geometry
  if (!geometry) return false

  return scene.meshes.some((otherMesh) => otherMesh !== mesh && otherMesh instanceof Mesh && otherMesh.geometry === geometry)
}

function updateSelectionBox(selectionBox: Mesh, mesh: AbstractMesh): void {
  mesh.computeWorldMatrix(true)
  const boundingBox = mesh.getBoundingInfo().boundingBox
  const min = boundingBox.minimumWorld
  const max = boundingBox.maximumWorld
  const size = max.subtract(min).scale(1.02)
  const center = min.add(max).scale(0.5)

  selectionBox.position.copyFrom(center)
  selectionBox.scaling.copyFrom(size)
  selectionBox.rotationQuaternion = null
  selectionBox.rotation.set(0, 0, 0)
  selectionBox.setEnabled(true)
}

function focusCameraOnMeshes(camera: ArcRotateCamera, meshes: AbstractMesh[]): void {
  const renderableMeshes = meshes.filter((mesh) => mesh.getTotalVertices() > 0)
  if (renderableMeshes.length === 0) return

  let min: Vector3 | undefined
  let max: Vector3 | undefined

  for (const mesh of renderableMeshes) {
    mesh.computeWorldMatrix(true)
    const boundingBox = mesh.getBoundingInfo().boundingBox
    const meshMin = boundingBox.minimumWorld
    const meshMax = boundingBox.maximumWorld

    min = min ? Vector3.Minimize(min, meshMin) : meshMin.clone()
    max = max ? Vector3.Maximize(max, meshMax) : meshMax.clone()
  }

  if (!min || !max) return

  const center = min.add(max).scale(0.5)
  const size = max.subtract(min).scale(1.02)
  const radius = Math.max(size.length() * 0.8, 1)

  camera.setTarget(center)
  camera.radius = radius
  camera.maxZ = Math.max(radius * 10, 1000)
}

/**
 * 创建 Babylon.js 场景
 * @param canvas 渲染目标 canvas 元素
 * @param modelUrl GLB 模型 URL，为空则创建测试方块
 * @returns 场景上下文，包含 dispose 方法供组件卸载时调用
 */
const createScene = (
  canvas: HTMLCanvasElement,
  modelUrls?: string | string[],
  options: SceneCreateOptions = {},
): SceneContext => {
  const performanceMode = options.performanceMode ?? false
  const debugLogs = options.debugLogs ?? false
  const maxDevicePixelRatio = options.maxDevicePixelRatio ?? (performanceMode ? 1 : 1.5)
  const renderFps = options.renderFps ?? (performanceMode ? 24 : 60)

  const engine = new Engine(canvas, !performanceMode, {
    preserveDrawingBuffer: false,
    stencil: !performanceMode,
  })
  engine.setHardwareScalingLevel(Math.max(1, window.devicePixelRatio / maxDevicePixelRatio))
  const scene = new Scene(engine)
  scene.clearColor.set(0.94, 0.97, 1, 1)
  scene.skipPointerMovePicking = true

  // ─── 相机 ─────────────────────────────────
  // ArcRotateCamera 支持：左键旋转、右键平移、滚轮缩放
  const camera = new ArcRotateCamera(
    'camera1',
    -Math.PI / 2,
    Math.PI / 3,
    15,
    Vector3.Zero(),
    scene,
  )
  camera.attachControl(canvas, true)

  // ─── 灯光 ─────────────────────────────────
  new HemisphericLight('light', Vector3.Up(), scene)

  // ??? ?? ?????????????????????????????????
  const urls = (Array.isArray(modelUrls) ? modelUrls : modelUrls ? [modelUrls] : []).filter(Boolean)
  if (urls.length > 0) {
    const loadedMeshes: AbstractMesh[] = []
    let remainingLoads = urls.length

    const handleModelLoaded = (
      url: string,
      meshes: AbstractMesh[],
      animationGroups?: import('@babylonjs/core').AnimationGroup[],
    ) => {
      if (debugLogs) {
        console.log('[ModelScene] GLB loaded', {
          url,
          meshCount: meshes.length,
          animationGroups: animationGroups?.map((group) => group.name),
        })
      }

      for (const mesh of meshes) {
        const revitIds = extractRevitIds(mesh)
        mesh.metadata = {
          ...(mesh.metadata || {}),
          elementId: revitIds.elementId,
          uniqueId: revitIds.uniqueId,
          guid: revitIds.guid,
          meshName: mesh.name,
          modelUrl: url,
          revitMetadataSource: revitIds.sourceName,
        }
      }

      const revitMeshes = meshes.filter((mesh) => mesh.metadata?.uniqueId || mesh.metadata?.guid)
      if (debugLogs) {
        console.log('[ModelScene] Revit metadata extracted', {
          url,
          count: revitMeshes.length,
          samples: revitMeshes.slice(0, 5).map((mesh) => ({
            name: mesh.name,
            parent: mesh.parent?.name,
            metadata: mesh.metadata,
          })),
        })
      }

      loadedMeshes.push(...meshes)
      remainingLoads -= 1
      if (remainingLoads === 0) {
        focusCameraOnMeshes(camera, loadedMeshes)
      }
    }

    for (const url of urls) {
      SceneLoader.ImportMesh('', '', url, scene, (meshes, particleSystems, skeletons, animationGroups) => {
        handleModelLoaded(url, meshes, animationGroups)
      })
    }
  } else {
    // ??????????
    const boxRed = MeshBuilder.CreateBox('box-red', { size: 1 }, scene)
    const materialRed = new StandardMaterial('box-red-material', scene)
    materialRed.diffuseColor = Color3.Red()
    boxRed.material = materialRed
    boxRed.position.x = -2
    boxRed.metadata = { elementId: 'box-red' }

    const boxBlue = MeshBuilder.CreateBox('box-yellow', { size: 1 }, scene)
    const materialYellow = new StandardMaterial('box-blue-material', scene)
    materialYellow.diffuseColor = Color3.Yellow()
    boxBlue.material = materialYellow
    boxBlue.metadata = { elementId: 'box-yellow' }

    const boxGreen = MeshBuilder.CreateBox('box-green', { size: 1 }, scene)
    const materialGreen = new StandardMaterial('box-green-material', scene)
    materialGreen.diffuseColor = Color3.Green()
    boxGreen.material = materialGreen
    boxGreen.position.x = 2
    boxGreen.metadata = { elementId: 'box-green' }
  }

  // ─── 运动控制器 ───────────────────────────
  const motionController = new SceneMotionController(scene)

  // ─── 点击拾取 ─────────────────────────────
  // 左键点击选中 GLB 构件，高亮 + 通过 bus 通知 Vue 端
  const highlightLayer = new HighlightLayer('highlight', scene, {
    blurHorizontalSize: 1,
    blurVerticalSize: 1,
  })
  let selectedMesh: AbstractMesh | null = null
  let selectedHighlightMesh: Mesh | null = null
  const selectionBox = MeshBuilder.CreateBox('selection-box', { size: 1 }, scene)
  const selectionBoxMaterial = new StandardMaterial('selection-box-material', scene)
  selectionBoxMaterial.diffuseColor = Color3.Yellow()
  selectionBoxMaterial.emissiveColor = Color3.Yellow()
  selectionBoxMaterial.wireframe = true
  selectionBox.material = selectionBoxMaterial
  selectionBox.isPickable = false
  selectionBox.renderingGroupId = 1
  selectionBox.setEnabled(false)

  let isDragging = false
  let pointerDownPos = { x: 0, y: 0 }
  scene.onPointerObservable.add((pi) => {
    if (pi.type === PointerEventTypes.POINTERDOWN) {
      isDragging = false
      pointerDownPos = { x: pi.event.clientX, y: pi.event.clientY }
    } else if (pi.type === PointerEventTypes.POINTERMOVE) {
      if (pi.event.buttons > 0) {
        const dx = Math.abs(pi.event.clientX - pointerDownPos.x)
        const dy = Math.abs(pi.event.clientY - pointerDownPos.y)
        if (dx > 3 || dy > 3) isDragging = true
      }
    } else if (pi.type === PointerEventTypes.POINTERUP) {
      // 拖拽结束不触发拾取
      if (isDragging) return
      const pickInfo = scene.pick(scene.pointerX, scene.pointerY)
      if (debugLogs) console.log(pickInfo)
      if (pickInfo?.hit && pickInfo.pickedMesh) {
        const mesh = pickInfo.pickedMesh
        selectionBox.setEnabled(false)
        if (selectedHighlightMesh) {
          highlightLayer.removeMesh(selectedHighlightMesh)
          selectedHighlightMesh = null
        }

        if (mesh instanceof Mesh && !isSharedOrInstancedMesh(mesh, scene)) {
          highlightLayer.addMesh(mesh, Color3.Yellow())
          selectedHighlightMesh = mesh
        } else {
          updateSelectionBox(selectionBox, mesh)
        }
        selectedMesh = mesh

        const revitIds = extractRevitIds(mesh)
        mesh.metadata = {
          ...(mesh.metadata || {}),
          elementId: revitIds.elementId,
          uniqueId: revitIds.uniqueId,
          guid: revitIds.guid,
          meshName: mesh.name,
          revitMetadataSource: revitIds.sourceName,
        }

        if (debugLogs) console.log('selected mesh metadata', selectedMesh.metadata)

        const elementId = revitIds.elementId
        if (debugLogs) {
          console.log('[ModelScene] 选中构件:', {
            name: mesh.name,
            id: mesh.id,
            metadata: mesh.metadata,
            material: mesh.material?.name,
            position: mesh.position,
          })
        }
        bus.emit(DirectorEvent.MeshSelected, { elementId, meshName: mesh.name })
      }
    }
  })

  // ─── 渲染循环 ─────────────────────────────
  const minFrameGap = renderFps > 0 ? 1000 / renderFps : 0
  let lastRenderAt = 0
  engine.runRenderLoop(() => {
    const now = performance.now()
    if (minFrameGap > 0 && now - lastRenderAt < minFrameGap) return

    lastRenderAt = now
    scene.render()
  })

  // ─── 窗口 resize 自适应 ────────────────────
  const handleResize = () => {
    engine.setHardwareScalingLevel(Math.max(1, window.devicePixelRatio / maxDevicePixelRatio))
    engine.resize()
  }
  window.addEventListener('resize', handleResize)

  // ─── 销毁方法 ─────────────────────────────
  const dispose = () => {
    motionController.dispose()
    window.removeEventListener('resize', handleResize)
    engine.stopRenderLoop()
    scene.dispose()
    engine.dispose()
  }

  // ─── 设置网格位置 ─────────────────────────
  const setPosition = (name: string, x: number, y: number, z: number) => {
    const mesh = scene.getMeshByName(name)
    if (mesh) {
      mesh.position = new Vector3(x, y, z)
    }
  }

  // ─── 执行批量运动命令 ─────────────────────
  const executeBatch = (batch: StageCommandBatch) => {
    motionController.executeBatch(batch)
  }

  // ─── 执行控制命令 ─────────────────────────
  const executeControl = (cmd: StageControlCommand) => {
    motionController.executeControl(cmd)
  }

  // ─── 执行单个运动轨道 ─────────────────────
  const executeTrack = (track: StageMotionTrack) => {
    motionController.executeTrack(track)
  }

  return {
    engine,
    scene,
    motionController,
    setPosition,
    executeBatch,
    executeControl,
    executeTrack,
    dispose,
  }
}

export { createScene }
