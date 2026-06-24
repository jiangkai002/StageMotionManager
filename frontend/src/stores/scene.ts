import { defineStore } from 'pinia'
import { computed, markRaw, shallowRef } from 'vue'
import type { Engine, Scene } from '@babylonjs/core'
import type { SceneContext } from '@/scenes/ModelScene'
import { director } from '@/scenes/SceneDirector'
import type {
  StageCommandBatch,
  StageControlCommand,
  StageMotionTrack,
} from '@/models/StageMotionTrack'

/**
 * Babylon 场景 Store
 * 管理引擎和场景实例的状态（如 isReady）
 * 注意：engine/scene 不做持久化，仅存内存
 * 运动命令通过 SceneDirector → bus → Babylon 执行，不直接操作 Babylon 对象
 */
export const useSceneStore = defineStore('scene', () => {
  // ─── state ────────────────────────────────
  const engine = shallowRef<Engine | null>(null)
  const scene = shallowRef<Scene | null>(null)
  /** 完整上下文（含 dispose） */
  let ctx: SceneContext | null = null

  // ─── getters ──────────────────────────────
  const isReady = computed(() => !!engine.value && !!scene.value)

  // ─── actions ──────────────────────────────
  /** 设置场景上下文（由 ModelViewer 在 onMounted 时调用） */
  function setContext(context: SceneContext) {
    ctx = markRaw(context)
    engine.value = markRaw(context.engine)
    scene.value = markRaw(context.scene)
  }

  /** 获取完整上下文 */
  function getContext(): SceneContext | null {
    return ctx
  }

  /** 设置网格位置（通过 director → bus → Babylon） */
  function setPosition(name: string, x: number, y: number, z: number) {
    director.setPosition(name, x, y, z)
  }

  /** 执行批量运动命令（通过 director → bus → Babylon） */
  function executeBatch(batch: StageCommandBatch) {
    director.executeBatch(batch)
  }

  /** 执行控制命令（通过 director → bus → Babylon） */
  function executeControl(cmd: StageControlCommand) {
    director.executeControl(cmd)
  }

  /** 执行单个运动轨道（通过 director → bus → Babylon） */
  function executeTrack(track: StageMotionTrack) {
    director.executeTrack(track)
  }

  /** 销毁场景，清空状态 */
  function dispose() {
    ctx?.dispose()
    ctx = null
    engine.value = null
    scene.value = null
  }

  return {
    engine,
    scene,
    isReady,
    setContext,
    getContext,
    setPosition,
    executeBatch,
    executeControl,
    executeTrack,
    dispose,
  }
})
