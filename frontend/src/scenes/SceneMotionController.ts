import {
  Scene,
  Mesh,
  Vector3,
  Quaternion,
  Animation,
  EasingFunction,
  CubicEase,
} from '@babylonjs/core'
import { bus } from './SceneDirector'
import { DirectorCommand, DirectorEvent } from './director-types'
import type { Handler } from 'mitt'
import type {
  StageMotionTrack,
  StageCommandBatch,
  StageControlCommand,
} from '@/models/StageMotionTrack'

/**
 * 单个动画轨道的运行时状态
 */
interface TrackRuntime {
  track: StageMotionTrack
  mesh: Mesh
  animations: Animation[]
  /** 原始位置（用于 relative 模式） */
  originPosition: Vector3
  /** 原始旋转（用于 relative 模式） */
  originRotationQuaternion: Quaternion
  /** 暂停标记 */
  paused: boolean
  /** 同步组 */
  syncGroup: string
}

/**
 * 场景运动控制器
 * 负责将 StageMotionTrack 转换为 Babylon.js 动画并执行
 * 支持批量、延迟、循环、乒乓、同步组等高级控制
 */
export class SceneMotionController {
  private scene: Scene
  /** 所有正在运行的轨道 */
  private runtimes = new Map<string, TrackRuntime>()
  /** 暂停的同步组 */
  private pausedGroups = new Set<string>()
  /** 序列队列（按顺序执行） */
  private sequenceQueue: StageMotionTrack[][] = []
  private isProcessingSequence = false
  /** bus 事件取消订阅函数列表 */
  private unsubs: (() => void)[] = []

  constructor(scene: Scene) {
    this.scene = scene
    this.subscribeBus()
  }

  // ─── 消息总线订阅 ─────────────────────────

  /**
   * 订阅 Vue 端通过 bus 发来的命令
   * 这是消息驱动架构的核心：Babylon 端监听消息，不直接被 Vue 调用
   */
  private subscribeBus(): void {
    // ExecuteTrack
    const onTrack: Handler<{ track: StageMotionTrack }> = ({ track }) => {
      this.executeTrack(track)
      bus.emit(DirectorEvent.CommandFinished, {
        commandType: DirectorCommand.ExecuteTrack,
      })
    }
    bus.on(DirectorCommand.ExecuteTrack, onTrack)
    this.unsubs.push(() => bus.off(DirectorCommand.ExecuteTrack, onTrack))

    // ExecuteBatch
    const onBatch: Handler<{ batch: StageCommandBatch }> = ({ batch }) => {
      this.executeBatch(batch)
      bus.emit(DirectorEvent.CommandFinished, {
        commandType: DirectorCommand.ExecuteBatch,
      })
    }
    bus.on(DirectorCommand.ExecuteBatch, onBatch)
    this.unsubs.push(() => bus.off(DirectorCommand.ExecuteBatch, onBatch))

    // ExecuteControl
    const onControl: Handler<{ cmd: StageControlCommand }> = ({ cmd }) => {
      this.executeControl(cmd)
      bus.emit(DirectorEvent.CommandFinished, {
        commandType: DirectorCommand.ExecuteControl,
      })
    }
    bus.on(DirectorCommand.ExecuteControl, onControl)
    this.unsubs.push(() => bus.off(DirectorCommand.ExecuteControl, onControl))

    // SetPosition
    const onSetPos: Handler<{ name: string; x: number; y: number; z: number }> = ({
      name,
      x,
      y,
      z,
    }) => {
      const mesh = this.scene.getMeshByName(name)
      if (mesh) {
        mesh.position = new Vector3(x, y, z)
      }
      bus.emit(DirectorEvent.CommandFinished, {
        commandType: DirectorCommand.SetPosition,
      })
    }
    bus.on(DirectorCommand.SetPosition, onSetPos)
    this.unsubs.push(() => bus.off(DirectorCommand.SetPosition, onSetPos))

    // GetMeshNames
    const onGetNames: Handler<undefined> = () => {
      const names = this.scene.meshes
        .filter((m) => m.name && !m.name.startsWith('__'))
        .map((m) => m.name)
      bus.emit(DirectorEvent.CommandFinished, {
        commandType: DirectorCommand.GetMeshNames,
        result: names,
      })
    }
    bus.on(DirectorCommand.GetMeshNames, onGetNames)
    this.unsubs.push(() => bus.off(DirectorCommand.GetMeshNames, onGetNames))

    // GetFps
    const onGetFps: Handler<undefined> = () => {
      const fps = this.scene.getEngine().getFps()
      bus.emit(DirectorEvent.CommandFinished, {
        commandType: DirectorCommand.GetFps,
        result: Math.round(fps),
      })
    }
    bus.on(DirectorCommand.GetFps, onGetFps)
    this.unsubs.push(() => bus.off(DirectorCommand.GetFps, onGetFps))
  }

  // ─── 核心方法 ─────────────────────────────

  /**
   * 执行批量运动命令
   * @param batch 包含 tracks/sequence/commands 的批量命令
   */
  executeBatch(batch: StageCommandBatch): void {
    // 1. 处理 tracks（并行执行）
    if (batch.tracks && batch.tracks.length > 0) {
      this.executeTracks(batch.tracks)
    }

    // 2. 处理 sequence（顺序执行）
    if (batch.sequence && batch.sequence.length > 0) {
      this.enqueueSequence(batch.sequence)
    }

    // 3. 处理 commands（暂不处理，由 executeControl 处理）
  }

  /**
   * 执行控制命令（停止、暂停、恢复等）
   */
  executeControl(cmd: StageControlCommand): void {
    switch (cmd.op) {
      case 'stopAll':
        this.stopAll()
        break
      case 'pauseAll':
        this.pauseAll()
        break
      case 'resumeAll':
        this.resumeAll()
        break
      case 'pauseSequence':
        this.isProcessingSequence = false
        break
      case 'resumeSequence':
        this.processNextSequence()
        break
      case 'pauseTrack':
      case 'pauseGroup':
      case 'pauseSyncGroup':
        if (cmd.syncGroup) this.pauseGroup(cmd.syncGroup)
        if (cmd.elementId) this.pauseTrack(cmd.elementId)
        break
      case 'resumeTrack':
      case 'resumeGroup':
      case 'resumeSyncGroup':
        if (cmd.syncGroup) this.resumeGroup(cmd.syncGroup)
        if (cmd.elementId) this.resumeTrack(cmd.elementId)
        break
      case 'clearSequence':
        this.sequenceQueue = []
        this.isProcessingSequence = false
        break
      case 'clearTimeline':
        this.stopAll()
        this.sequenceQueue = []
        break
      default:
        console.warn('[MotionController] 未知的控制命令:', cmd.op)
    }
  }

  // ─── 执行轨道动画 ─────────────────────────

  /**
   * 并行执行多个轨道
   */
  private executeTracks(tracks: StageMotionTrack[]): void {
    for (const track of tracks) {
      this.executeTrack(track)
    }
  }

  /**
   * 执行单个轨道动画
   */
  executeTrack(track: StageMotionTrack): void {
    const mesh = this.findMesh(track.elementId)
    if (!mesh) {
      console.warn(`[MotionController] 找不到构件: ${track.elementId}`)
      return
    }

    // 停止该 mesh 上已有的动画
    this.stopTrack(track.elementId)

    const duration = track.duration ?? 1
    const fps = 60
    const totalFrames = Math.max(1, Math.round(duration * fps))

    const animations: Animation[] = []
    const originPosition = mesh.position.clone()
    const originRotationQuaternion =
      mesh.rotationQuaternion?.clone() ??
      Quaternion.RotationYawPitchRoll(mesh.rotation.y, mesh.rotation.x, mesh.rotation.z)

    // 确保有 rotationQuaternion（动画需要）
    if (!mesh.rotationQuaternion) {
      mesh.rotationQuaternion = originRotationQuaternion.clone()
    }

    // ─── 位移动画 ───────────────────────────
    if (track.translation || track.location) {
      const target = track.translation ?? track.location!
      const startPos = track.relative
        ? originPosition.clone()
        : new Vector3(target.x, target.y, target.z)
      const endPos = track.relative
        ? originPosition.add(new Vector3(target.x, target.y, target.z))
        : new Vector3(target.x, target.y, target.z)

      const anim = new Animation(
        `pos_${track.elementId}_${Date.now()}`,
        'position',
        fps,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
      )

      anim.setKeys([
        { frame: 0, value: startPos },
        { frame: totalFrames, value: endPos },
      ])

      this.applyEasing(anim, track)
      animations.push(anim)
    }

    // ─── 旋转动画 ───────────────────────────
    if (track.rotation || track.rotator) {
      const rot = track.rotation ?? track.rotator!
      const startQuat = mesh.rotationQuaternion!.clone()
      const deltaQuat = Quaternion.RotationYawPitchRoll(
        (rot.yaw * Math.PI) / 180,
        (rot.pitch * Math.PI) / 180,
        (rot.roll * Math.PI) / 180,
      )
      const endQuat = track.relative ? startQuat.multiply(deltaQuat) : deltaQuat

      const anim = new Animation(
        `rot_${track.elementId}_${Date.now()}`,
        'rotationQuaternion',
        fps,
        Animation.ANIMATIONTYPE_QUATERNION,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
      )

      anim.setKeys([
        { frame: 0, value: startQuat },
        { frame: totalFrames, value: endQuat },
      ])

      this.applyEasing(anim, track)
      animations.push(anim)
    }

    // ─── 循环模式 ───────────────────────────
    const loop = track.loop ?? track.loopCount ?? 1
    const pingPong = track.pingPong ?? track.reverseOnLoop ?? false

    if (loop === 0 || loop > 1) {
      for (const anim of animations) {
        anim.loopMode = pingPong
          ? Animation.ANIMATIONLOOPMODE_YOYO
          : Animation.ANIMATIONLOOPMODE_CYCLE
      }
    }

    // ─── 注册运行时 ─────────────────────────
    const runtime: TrackRuntime = {
      track,
      mesh,
      animations,
      originPosition,
      originRotationQuaternion,
      paused: false,
      syncGroup: track.syncGroup ?? '',
    }
    this.runtimes.set(track.elementId, runtime)

    // ─── 启动动画 ───────────────────────────
    mesh.animations = animations
    this.scene.beginAnimation(mesh, 0, totalFrames, loop === 0, 1, () => {
      // 动画结束回调
      if (track.snapToEnd !== false) {
        this.snapToEnd(runtime)
      }
      this.runtimes.delete(track.elementId)
      // 通过 bus 通知 Vue 端该轨道动画完成
      bus.emit(DirectorEvent.TrackComplete, { elementId: track.elementId })
    })
  }

  // ─── 序列执行 ─────────────────────────────

  /**
   * 将轨道加入序列队列
   */
  private enqueueSequence(tracks: StageMotionTrack[]): void {
    this.sequenceQueue.push(tracks)
    if (!this.isProcessingSequence) {
      this.processNextSequence()
    }
  }

  /**
   * 处理序列中的下一批
   */
  private processNextSequence(): void {
    if (this.sequenceQueue.length === 0) {
      this.isProcessingSequence = false
      return
    }

    this.isProcessingSequence = true
    const tracks = this.sequenceQueue.shift()!

    // 找到这批中最长的动画时间
    const maxDuration = Math.max(...tracks.map((t) => (t.duration ?? 1) + (t.delay ?? 0)))

    this.executeTracks(tracks)

    // 等这批动画结束后再执行下一批
    setTimeout(() => {
      // 检查是否还有后续序列
      if (this.sequenceQueue.length === 0) {
        this.isProcessingSequence = false
        // 通过 bus 通知 Vue 端序列全部完成
        bus.emit(DirectorEvent.SequenceComplete, undefined)
      } else {
        this.processNextSequence()
      }
    }, maxDuration * 1000)
  }

  // ─── 控制方法 ─────────────────────────────

  /** 停止所有动画 */
  stopAll(): void {
    for (const [, runtime] of this.runtimes) {
      this.scene.stopAnimation(runtime.mesh)
    }
    this.runtimes.clear()
  }

  /** 停止单个轨道 */
  stopTrack(elementId: string): void {
    const runtime = this.runtimes.get(elementId)
    if (runtime) {
      this.scene.stopAnimation(runtime.mesh)
      this.runtimes.delete(elementId)
    }
  }

  /** 暂停所有动画 */
  pauseAll(): void {
    for (const [, runtime] of this.runtimes) {
      if (!runtime.paused) {
        this.scene.stopAnimation(runtime.mesh)
        runtime.paused = true
      }
    }
  }

  /** 恢复所有动画 */
  resumeAll(): void {
    for (const [, runtime] of this.runtimes) {
      if (runtime.paused) {
        const animatable = this.scene.beginAnimation(runtime.mesh, 0, 100, false)
        runtime.paused = false
      }
    }
  }

  /** 暂停单个轨道 */
  pauseTrack(elementId: string): void {
    const runtime = this.runtimes.get(elementId)
    if (runtime && !runtime.paused) {
      this.scene.stopAnimation(runtime.mesh)
      runtime.paused = true
    }
  }

  /** 恢复单个轨道 */
  resumeTrack(elementId: string): void {
    const runtime = this.runtimes.get(elementId)
    if (runtime && runtime.paused) {
      this.scene.beginAnimation(runtime.mesh, 0, 100, false)
      runtime.paused = false
    }
  }

  /** 暂停同步组 */
  pauseGroup(group: string): void {
    this.pausedGroups.add(group)
    for (const [, runtime] of this.runtimes) {
      if (runtime.syncGroup === group && !runtime.paused) {
        this.scene.stopAnimation(runtime.mesh)
        runtime.paused = true
      }
    }
  }

  /** 恢复同步组 */
  resumeGroup(group: string): void {
    this.pausedGroups.delete(group)
    for (const [, runtime] of this.runtimes) {
      if (runtime.syncGroup === group && runtime.paused) {
        this.scene.beginAnimation(runtime.mesh, 0, 100, false)
        runtime.paused = false
      }
    }
  }

  // ─── 工具方法 ─────────────────────────────

  /**
   * 查找 mesh，支持按名称或元数据中的 elementId 查找
   */
  private findMesh(elementId: string): Mesh | null {
    // 先按名称查找
    let mesh = this.scene.getMeshByName(elementId)

    // 再按元数据查找（mesh.metadata.elementId）
    if (!mesh) {
      mesh = this.scene.meshes.find((m) => m.metadata?.elementId === elementId) as Mesh | null
    }

    return (mesh as Mesh) ?? null
  }

  /**
   * 应用缓动函数
   */
  private applyEasing(anim: Animation, track: StageMotionTrack): void {
    // 可根据 track.easing 扩展
    const easing = new CubicEase()
    easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)
    anim.setEasingFunction(easing)
  }

  /**
   * 动画结束时强制对齐目标
   */
  private snapToEnd(runtime: TrackRuntime): void {
    const { track, mesh } = runtime

    if (track.translation || track.location) {
      const target = track.translation ?? track.location!
      if (track.relative) {
        const endPos = runtime.originPosition.add(new Vector3(target.x, target.y, target.z))
        mesh.position = endPos
      } else {
        mesh.position = new Vector3(target.x, target.y, target.z)
      }
    }

    if (track.rotation || track.rotator) {
      const rot = track.rotation ?? track.rotator!
      const deltaQuat = Quaternion.RotationYawPitchRoll(
        (rot.yaw * Math.PI) / 180,
        (rot.pitch * Math.PI) / 180,
        (rot.roll * Math.PI) / 180,
      )
      mesh.rotationQuaternion = track.relative
        ? runtime.originRotationQuaternion.multiply(deltaQuat)
        : deltaQuat
    }
  }

  /**
   * 获取当前运行中的轨道数量
   */
  get activeTrackCount(): number {
    return this.runtimes.size
  }

  /**
   * 销毁，停止所有动画并取消 bus 订阅
   */
  dispose(): void {
    this.stopAll()
    this.sequenceQueue = []
    for (const unsub of this.unsubs) {
      unsub()
    }
    this.unsubs = []
  }
}
