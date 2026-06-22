<template>
  <div class="model-viewer">
    <canvas ref="bjsCanvas" class="model-viewer__canvas" />
    <div class="model-viewer__fps">FPS: {{ fps }}</div>
    <div class="model-viewer__controls">
      <button class="model-viewer__btn" @click="moveBox">移动方块</button>
      <button class="model-viewer__btn" @click="testBatch">测试批量动画</button>
      <button class="model-viewer__btn" @click="testSequence">测试序列动画</button>
      <button class="model-viewer__btn model-viewer__btn--danger" @click="stopAll">停止全部</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { createScene } from '../scenes/ModelScene'
import { director } from '@/scenes/SceneDirector'
import { DirectorEvent } from '@/scenes/director-types'
import { useSceneStore } from '@/stores/scene'
import type {
  StageCommandBatch,
  StageControlCommand,
  StageMotionTrack,
} from '@/models/StageMotionTrack'

const sceneStore = useSceneStore()

const bjsCanvas = ref<HTMLCanvasElement | null>(null)
const fps = ref(0)
let fpsTimer: ReturnType<typeof setInterval> | null = null
/** director 事件取消监听函数列表 */
let unsubs: (() => void)[] = []

// ─── 对外暴露 ──────────────────────────────
const emit = defineEmits<{
  (e: 'fps', value: number): void
  (e: 'trackComplete', elementId: string): void
  (e: 'sequenceComplete'): void
  (e: 'meshSelected', elementId: string, meshName: string): void
}>()

// 暴露给父组件通过 ref 调用（内部走 director → bus → Babylon）
defineExpose({
  getFps: () => director.getFps(),
  executeBatch: (batch: StageCommandBatch) => director.executeBatch(batch),
  executeControl: (cmd: StageControlCommand) => director.executeControl(cmd),
  executeTrack: (track: StageMotionTrack) => director.executeTrack(track),
})

const props = withDefaults(defineProps<{ modelUrl?: string; modelUrls?: string[] }>(), {
  modelUrl: '',
  modelUrls: () => [],
})

onMounted(() => {
  if (bjsCanvas.value) {
    // 创建场景，SceneMotionController 在内部自动订阅 bus
    const ctx = createScene(
      bjsCanvas.value,
      props.modelUrls.length > 0 ? props.modelUrls : props.modelUrl,
    )
    sceneStore.setContext(ctx)

    // 通知场景就绪
    director.on(DirectorEvent.SceneReady, () => {
      console.log('[ModelViewer] 场景就绪')
    })

    // 监听 Babylon 端回传的事件
    unsubs.push(
      director.on(DirectorEvent.Fps, ({ value }) => {
        fps.value = value
        emit('fps', value)
      }),
    )

    unsubs.push(
      director.on(DirectorEvent.TrackComplete, ({ elementId }) => {
        emit('trackComplete', elementId)
      }),
    )

    unsubs.push(
      director.on(DirectorEvent.SequenceComplete, () => {
        emit('sequenceComplete')
      }),
    )

    unsubs.push(
      director.on(DirectorEvent.MeshSelected, ({ elementId, meshName }) => {
        console.log('[ModelViewer] 选中构件', elementId, meshName)
        emit('meshSelected', elementId, meshName)
      }),
    )

    // FPS 定时上报：Vue → bus → Babylon 处理 → bus 回传 → Vue 更新
    fpsTimer = setInterval(() => {
      director.getFps()
    }, 1000)
  }
})

onBeforeUnmount(() => {
  if (fpsTimer) {
    clearInterval(fpsTimer)
    fpsTimer = null
  }
  for (const unsub of unsubs) {
    unsub()
  }
  unsubs = []
  sceneStore.dispose()
})

// ─── 移动方块 ──────────────────────────────
function moveBox() {
  const x = Math.random() * 6 - 3
  const y = Math.random() * 3
  const z = Math.random() * 6 - 3
  director.setPosition('box-red', x, y, z)
}

// ─── 测试批量动画 ──────────────────────────
function testBatch() {
  const batch: StageCommandBatch = {
    tracks: [
      {
        elementId: 'box-red',
        translation: { x: 3, y: 2, z: 0 },
        duration: 2,
        relative: true,
        syncGroup: 'group1',
      },
      {
        elementId: 'box-yellow',
        translation: { x: 0, y: 2, z: 3 },
        duration: 2,
        relative: true,
        syncGroup: 'group1',
      },
      {
        elementId: 'box-green',
        rotation: { pitch: 0, yaw: 90, roll: 0 },
        duration: 2,
        relative: true,
        syncGroup: 'group1',
      },
    ],
  }
  director.executeBatch(batch)
}

// ─── 测试序列动画 ──────────────────────────
function testSequence() {}

// ─── 停止全部 ──────────────────────────────
function stopAll() {
  director.executeControl({ op: 'stopAll' })
}
</script>

<style scoped>
.model-viewer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.model-viewer__canvas {
  display: block;
  width: 100%;
  height: 100%;
  outline: none;
  touch-action: none;
}

.model-viewer__fps {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.75rem;
  color: #4ade80;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  pointer-events: none;
  user-select: none;
}

.model-viewer__controls {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  gap: 8px;
}

.model-viewer__btn {
  padding: 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}

.model-viewer__btn:hover {
  background: rgba(74, 222, 128, 0.3);
}

.model-viewer__btn--danger:hover {
  background: rgba(248, 113, 113, 0.3);
}
</style>
