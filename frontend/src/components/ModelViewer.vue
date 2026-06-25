<template>
  <div class="model-viewer">
    <canvas ref="bjsCanvas" class="model-viewer__canvas" />
    <div v-if="props.showFps" class="model-viewer__fps">FPS: {{ fps }}</div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createScene } from '../scenes/ModelScene'
import { director } from '@/scenes/SceneDirector'
import { DirectorEvent } from '@/scenes/director-types'
import { useSceneStore } from '@/stores/scene'
import type { SceneContext } from '../scenes/ModelScene'
import type {
  StageCommandBatch,
  StageControlCommand,
  StageMotionTrack,
} from '@/models/StageMotionTrack'

const sceneStore = useSceneStore()

const bjsCanvas = ref<HTMLCanvasElement | null>(null)
const fps = ref(0)
let fpsTimer: ReturnType<typeof setInterval> | null = null
let unsubs: (() => void)[] = []
let sceneContext: SceneContext | null = null

const emit = defineEmits<{
  (e: 'fps', value: number): void
  (e: 'trackComplete', elementId: string): void
  (e: 'sequenceComplete'): void
  (e: 'meshSelected', elementId: string, meshName: string): void
  (e: 'sceneReady'): void
}>()

defineExpose({
  getFps: () => director.getFps(),
  executeBatch: (batch: StageCommandBatch) => director.executeBatch(batch),
  executeControl: (cmd: StageControlCommand) => director.executeControl(cmd),
  executeTrack: (track: StageMotionTrack) => director.executeTrack(track),
  getElements: () => sceneContext?.getElements() ?? [],
  focusElement: (elementId: string) => sceneContext?.focusElement(elementId) ?? false,
  setSelectionEnabled: (enabled: boolean) => sceneContext?.setSelectionEnabled(enabled),
})

const props = withDefaults(
  defineProps<{
    modelUrl?: string
    modelUrls?: string[]
    performanceMode?: boolean
    maxDevicePixelRatio?: number
    renderFps?: number
    debugLogs?: boolean
    showControls?: boolean
    showFps?: boolean
    selectionEnabled?: boolean
  }>(),
  {
    modelUrl: '',
    modelUrls: () => [],
    performanceMode: false,
    maxDevicePixelRatio: undefined,
    renderFps: undefined,
    debugLogs: false,
    showControls: true,
    showFps: true,
    selectionEnabled: true,
  },
)

watch(
  () => props.selectionEnabled,
  (enabled) => {
    sceneContext?.setSelectionEnabled(enabled)
  },
)

onMounted(() => {
  if (!bjsCanvas.value) return

  const ctx = createScene(
    bjsCanvas.value,
    props.modelUrls.length > 0 ? props.modelUrls : props.modelUrl,
    {
      performanceMode: props.performanceMode,
      maxDevicePixelRatio: props.maxDevicePixelRatio,
      renderFps: props.renderFps,
      debugLogs: props.debugLogs,
      selectionEnabled: props.selectionEnabled,
    },
  )

  sceneContext = ctx
  sceneStore.setContext(ctx)

  unsubs.push(
    director.on(DirectorEvent.SceneReady, () => {
      if (props.debugLogs) console.log('[ModelViewer] scene ready')
      emit('sceneReady')
    }),
  )

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
      if (props.debugLogs) console.log('[ModelViewer] selected mesh', elementId, meshName)
      emit('meshSelected', elementId, meshName)
    }),
  )

  if (props.showFps) {
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
  sceneContext = null
})
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
