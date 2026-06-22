<script setup lang="ts">
import { ref, computed } from 'vue'
import type {
  StageMotionTrack,
  StageCommandBatch,
  StageControlCommand,
  FVector,
  FRotator,
} from '@/models/StageMotionTrack'

// ─── 工具函数 ───────────────────────────────────────────
function createFVector(): FVector {
  return { x: 0, y: 0, z: 0 }
}
function createFRotator(): FRotator {
  return { pitch: 0, yaw: 0, roll: 0 }
}
function createTrack(): StageMotionTrack {
  return {
    elementId: '',
    op: 'transform',
    translation: createFVector(),
    rotation: createFRotator(),
    space: 'world',
    relative: false,
    duration: 1,
    delay: 0,
    snapToEnd: true,
    loop: 1,
    pingPong: false,
    syncGroup: '',
  }
}

// ─── 状态 ───────────────────────────────────────────────
const tracks = ref<StageMotionTrack[]>([createTrack()])
const editingIndex = ref<number>(0)
const showJsonPreview = ref(true)
const showControlPanel = ref(false)

// 控制命令
const controlOp = ref<StageControlCommand['op']>('stopAll')
const controlElementId = ref('')
const controlSyncGroup = ref('')

// ─── 计算属性 ───────────────────────────────────────────
const currentTrack = computed(() => tracks.value[editingIndex.value])

const jsonPreview = computed(() => {
  const batch: StageCommandBatch = {
    tracks: tracks.value.filter((t) => t.elementId.trim() !== ''),
  }
  return JSON.stringify(batch, null, 2)
})

const controlJsonPreview = computed(() => {
  const cmd: StageControlCommand = {
    op: controlOp.value,
  }
  if (controlElementId.value.trim()) cmd.elementId = controlElementId.value.trim()
  if (controlSyncGroup.value.trim()) cmd.syncGroup = controlSyncGroup.value.trim()
  return JSON.stringify(cmd, null, 2)
})

// ─── 操作 ───────────────────────────────────────────────
function addTrack() {
  tracks.value.push(createTrack())
  editingIndex.value = tracks.value.length - 1
}

function removeTrack(index: number) {
  if (tracks.value.length <= 1) return
  tracks.value.splice(index, 1)
  if (editingIndex.value >= tracks.value.length) {
    editingIndex.value = tracks.value.length - 1
  }
}

function duplicateTrack(index: number) {
  const copy = JSON.parse(JSON.stringify(tracks.value[index])) as StageMotionTrack
  tracks.value.splice(index + 1, 0, copy)
  editingIndex.value = index + 1
}

function selectTrack(index: number) {
  editingIndex.value = index
}

function copyJson() {
  navigator.clipboard.writeText(jsonPreview.value)
}

function copyControlJson() {
  navigator.clipboard.writeText(controlJsonPreview.value)
}

function sendMotionCommand() {
  const ue = (window as any).ue
  if (!ue) {
    console.log('ue未初始化')
    console.log('指令', jsonPreview.value)
    return
  }
  ue.interface.broadcast('setMotionCommand', jsonPreview.value)
}

// ─── 吊杆正弦测试 ───────────────────────────────────────
const boomElementIds = [
  4204087, 4204266, 4204279, 4204282, 4204285, 4204288, 4204291, 4133432, 4133433, 4204294, 4204297,
  4133435, 4204300, 4133434, 4204303, 4204306, 4204309, 4204312, 4204315, 4204318, 4204321, 4204324,
  4204327, 4204330, 4204333, 4204336, 4204339, 4204342, 4204345, 4204348, 4204351, 4204354, 4204357,
  4204360, 4204363, 4204366, 4204369, 4204372, 4204375, 4204378, 4204381, 4204384, 4204387, 4204390,
  4204393, 4204396, 4204399, 4204402, 4204405, 4204408, 4204411, 4204414, 4204417, 4204420, 4204423,
  4204426, 4204429, 4204432, 4204435, 4204438, 4204441, 4204444, 4204447, 4204450, 4204453, 4204456,
  4204459, 4204462, 4204465, 4204468, 4204471, 4204474, 4204477, 4204480, 4204483, 4204486, 4204489,
  4204492, 4204495, 4204498, 4204501, 4204504, 4204507, 4204510, 4212873,
]

function sendSinWaveTest() {
  const amplitude = 100 // Z方向振幅
  const period = 4 // 单杆运动周期（秒）
  const duration = period / 2 // 半周期 = 一次上/下运动时间
  const staggerDelay = 0.1 // 每根杆子之间的延迟（秒），形成波浪传播效果
  const travelDistance = amplitude * 2 // 从 -100 到 +100 的完整上下行程

  const testTracks: StageMotionTrack[] = boomElementIds.flatMap((id, index) => {
    const delay = index * staggerDelay
    const elementId = String(id)

    return [
      {
        elementId,
        op: 'relative' as const,
        translation: { x: 0, y: 0, z: -amplitude },
        rotation: { pitch: 0, yaw: 0, roll: 0 },
        space: 'world' as const,
        relative: true,
        duration,
        delay,
        snapToEnd: true,
        loop: 1,
        pingPong: false,
        syncGroup: '',
      },
      {
        elementId,
        op: 'relative' as const,
        translation: { x: 0, y: 0, z: travelDistance },
        rotation: { pitch: 0, yaw: 0, roll: 0 },
        space: 'world' as const,
        relative: true,
        duration,
        delay: delay + duration,
        snapToEnd: true,
        loop: 0, // 0 = 无限循环
        pingPong: true, // 在 -100 和 +100 之间无限往返
        syncGroup: '',
      },
    ]
  })

  const batch: StageCommandBatch = { tracks: testTracks }
  const json = JSON.stringify(batch, null, 2)
  console.log('吊杆正弦测试指令:', json)

  const ue = (window as any).ue
  if (!ue) {
    console.log('ue未初始化，指令未发送')
    return
  }
  ue.interface.broadcast('setMotionCommand', json)
}

// ─── 选项数据 ───────────────────────────────────────────
const opOptions: { value: StageMotionTrack['op']; label: string }[] = [
  { value: 'transform', label: '变换 (transform)' },
  { value: 'translate', label: '平移 (translate)' },
  { value: 'rotate', label: '旋转 (rotate)' },
  { value: 'relative', label: '相对 (relative)' },
]

const spaceOptions: { value: StageMotionTrack['space']; label: string }[] = [
  { value: 'world', label: '世界坐标' },
  { value: 'local', label: '局部坐标' },
]

const controlOpOptions: { value: StageControlCommand['op']; label: string; group: string }[] = [
  { value: 'stopAll', label: '停止全部', group: '停止' },
  { value: 'pauseAll', label: '暂停全部', group: '暂停' },
  { value: 'pauseSequence', label: '暂停序列', group: '暂停' },
  { value: 'pauseTrack', label: '暂停轨道', group: '暂停' },
  { value: 'pauseSyncGroup', label: '暂停同步组', group: '暂停' },
  { value: 'resumeAll', label: '恢复全部', group: '恢复' },
  { value: 'resumeSequence', label: '恢复序列', group: '恢复' },
  { value: 'resumeTrack', label: '恢复轨道', group: '恢复' },
  { value: 'resumeSyncGroup', label: '恢复同步组', group: '恢复' },
  { value: 'clearSequence', label: '清除序列', group: '清除' },
  { value: 'clearTimeline', label: '清除时间线', group: '清除' },
  { value: 'wait', label: '等待', group: '等待' },
  { value: 'waitGroup', label: '等待组', group: '等待' },
  { value: 'waitSyncGroup', label: '等待同步组', group: '等待' },
  { value: 'setParent', label: '设置父级', group: '层级' },
  { value: 'attach', label: '附加', group: '层级' },
  { value: 'clearParent', label: '清除父级', group: '层级' },
  { value: 'detach', label: '脱离', group: '层级' },
]
</script>

<template>
  <div class="stage-motion">
    <!-- ─── 顶部标题栏 ─── -->
    <header class="sm-header">
      <h1 class="sm-title">🎬 舞台运动轨道管理</h1>
      <div class="sm-header-actions">
        <button class="sm-btn sm-btn--outline" @click="showControlPanel = !showControlPanel">
          {{ showControlPanel ? '隐藏控制面板' : '控制命令' }}
        </button>
        <button class="sm-btn sm-btn--outline" @click="showJsonPreview = !showJsonPreview">
          {{ showJsonPreview ? '隐藏预览' : 'JSON 预览' }}
        </button>
        <button class="sm-btn" style="background-color: #25c590" @click="sendMotionCommand">
          发送指令
        </button>
        <button class="sm-btn" style="background-color: #e67e22" @click="sendSinWaveTest">
          吊杆波浪测试
        </button>
      </div>
    </header>

    <!-- ─── 控制命令面板 ─── -->
    <section v-if="showControlPanel" class="sm-control-panel">
      <h2 class="sm-section-title">⚡ 控制命令</h2>
      <div class="sm-control-grid">
        <div class="sm-field">
          <label class="sm-label">操作类型</label>
          <select v-model="controlOp" class="sm-select">
            <optgroup
              v-for="group in ['停止', '暂停', '恢复', '清除', '等待', '层级']"
              :key="group"
              :label="group"
            >
              <option
                v-for="opt in controlOpOptions.filter((o) => o.group === group)"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </optgroup>
          </select>
        </div>
        <div class="sm-field">
          <label class="sm-label">构件 ID</label>
          <input v-model="controlElementId" class="sm-input" placeholder="可选，如 123456" />
        </div>
        <div class="sm-field">
          <label class="sm-label">同步组</label>
          <input v-model="controlSyncGroup" class="sm-input" placeholder="可选，如 groupA" />
        </div>
      </div>
      <div class="sm-json-preview-inline">
        <pre class="sm-code-block">{{ controlJsonPreview }}</pre>
        <button class="sm-btn sm-btn--sm" @click="copyControlJson">📋 复制</button>
      </div>
    </section>

    <!-- ─── 主体区域 ─── -->
    <div class="sm-body">
      <!-- ─── 左侧：轨道列表 ─── -->
      <aside class="sm-sidebar">
        <div class="sm-sidebar-header">
          <h2 class="sm-section-title">轨道列表</h2>
          <button class="sm-btn sm-btn--primary sm-btn--sm" @click="addTrack">+ 新增</button>
        </div>
        <ul class="sm-track-list">
          <li
            v-for="(track, index) in tracks"
            :key="index"
            class="sm-track-item"
            :class="{ 'sm-track-item--active': index === editingIndex }"
            @click="selectTrack(index)"
          >
            <div class="sm-track-item-info">
              <span class="sm-track-item-id">
                {{ track.elementId || `(轨道 ${index + 1})` }}
              </span>
              <span class="sm-track-item-op">{{ track.op }}</span>
            </div>
            <div class="sm-track-item-actions">
              <button
                class="sm-btn sm-btn--icon"
                @click.stop="duplicateTrack(index)"
                title="复制轨道"
              >
                📄
              </button>
              <button
                class="sm-btn sm-btn--icon sm-btn--danger"
                @click.stop="removeTrack(index)"
                title="删除轨道"
                :disabled="tracks.length <= 1"
              >
                🗑️
              </button>
            </div>
          </li>
        </ul>
      </aside>

      <!-- ─── 右侧：轨道编辑器 ─── -->
      <main class="sm-editor">
        <template v-if="currentTrack">
          <h2 class="sm-section-title">
            编辑轨道 #{{ editingIndex + 1 }}
            <span class="sm-section-subtitle">
              {{ currentTrack.elementId || '未命名' }}
            </span>
          </h2>

          <!-- ─── 基础信息 ─── -->
          <div class="sm-form-group">
            <h3 class="sm-group-title">📌 基础信息</h3>
            <div class="sm-form-row">
              <div class="sm-field sm-field--wide">
                <label class="sm-label">构件 ID (Element ID)</label>
                <input v-model="currentTrack.elementId" class="sm-input" placeholder="如 123456" />
              </div>
              <div class="sm-field">
                <label class="sm-label">操作类型</label>
                <select v-model="currentTrack.op" class="sm-select">
                  <option v-for="opt in opOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- ─── 位移 ─── -->
          <div class="sm-form-group">
            <h3 class="sm-group-title">↗️ 位移 (Translation)</h3>
            <div class="sm-form-row sm-form-row--vec3">
              <div class="sm-field">
                <label class="sm-label">X</label>
                <input
                  v-model.number="currentTrack.translation!.x"
                  type="number"
                  class="sm-input sm-input--num"
                  step="0.1"
                />
              </div>
              <div class="sm-field">
                <label class="sm-label">Y</label>
                <input
                  v-model.number="currentTrack.translation!.y"
                  type="number"
                  class="sm-input sm-input--num"
                  step="0.1"
                />
              </div>
              <div class="sm-field">
                <label class="sm-label">Z</label>
                <input
                  v-model.number="currentTrack.translation!.z"
                  type="number"
                  class="sm-input sm-input--num"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <!-- ─── 旋转 ─── -->
          <div class="sm-form-group">
            <h3 class="sm-group-title">🔄 旋转 (Rotation, 度)</h3>
            <div class="sm-form-row sm-form-row--vec3">
              <div class="sm-field">
                <label class="sm-label">Pitch</label>
                <input
                  v-model.number="currentTrack.rotation!.pitch"
                  type="number"
                  class="sm-input sm-input--num"
                  step="1"
                />
              </div>
              <div class="sm-field">
                <label class="sm-label">Yaw</label>
                <input
                  v-model.number="currentTrack.rotation!.yaw"
                  type="number"
                  class="sm-input sm-input--num"
                  step="1"
                />
              </div>
              <div class="sm-field">
                <label class="sm-label">Roll</label>
                <input
                  v-model.number="currentTrack.rotation!.roll"
                  type="number"
                  class="sm-input sm-input--num"
                  step="1"
                />
              </div>
            </div>
          </div>

          <!-- ─── 坐标空间 ─── -->
          <div class="sm-form-group">
            <h3 class="sm-group-title">🌍 坐标空间</h3>
            <div class="sm-form-row">
              <div class="sm-field">
                <label class="sm-label">空间</label>
                <select v-model="currentTrack.space" class="sm-select">
                  <option v-for="opt in spaceOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="sm-field sm-field--toggle">
                <label class="sm-label">相对变换</label>
                <label class="sm-toggle">
                  <input v-model="currentTrack.relative" type="checkbox" />
                  <span class="sm-toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- ─── 时间控制 ─── -->
          <div class="sm-form-group">
            <h3 class="sm-group-title">⏱️ 时间控制</h3>
            <div class="sm-form-row">
              <div class="sm-field">
                <label class="sm-label">持续时间 (秒)</label>
                <input
                  v-model.number="currentTrack.duration"
                  type="number"
                  class="sm-input sm-input--num"
                  min="0"
                  step="0.1"
                />
              </div>
              <div class="sm-field">
                <label class="sm-label">延迟 (秒)</label>
                <input
                  v-model.number="currentTrack.delay"
                  type="number"
                  class="sm-input sm-input--num"
                  min="0"
                  step="0.1"
                />
              </div>
              <div class="sm-field">
                <label class="sm-label">绝对开始时间 (秒)</label>
                <input
                  v-model.number="currentTrack.startTime"
                  type="number"
                  class="sm-input sm-input--num"
                  min="0"
                  step="0.1"
                  placeholder="可选"
                />
              </div>
            </div>
          </div>

          <!-- ─── 循环控制 ─── -->
          <div class="sm-form-group">
            <h3 class="sm-group-title">🔁 循环控制</h3>
            <div class="sm-form-row">
              <div class="sm-field">
                <label class="sm-label">循环次数 (0=无限)</label>
                <input
                  v-model.number="currentTrack.loop"
                  type="number"
                  class="sm-input sm-input--num"
                  min="0"
                  step="1"
                />
              </div>
              <div class="sm-field sm-field--toggle">
                <label class="sm-label">乒乓效果</label>
                <label class="sm-toggle">
                  <input v-model="currentTrack.pingPong" type="checkbox" />
                  <span class="sm-toggle-slider"></span>
                </label>
              </div>
              <div class="sm-field sm-field--toggle">
                <label class="sm-label">强制对齐终点</label>
                <label class="sm-toggle">
                  <input v-model="currentTrack.snapToEnd" type="checkbox" />
                  <span class="sm-toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- ─── 同步组 ─── -->
          <div class="sm-form-group">
            <h3 class="sm-group-title">🔗 同步组</h3>
            <div class="sm-form-row">
              <div class="sm-field sm-field--wide">
                <label class="sm-label">同步组名称</label>
                <input
                  v-model="currentTrack.syncGroup"
                  class="sm-input"
                  placeholder="可选，如 groupA"
                />
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>

    <!-- ─── JSON 预览 ─── -->
    <section v-if="showJsonPreview" class="sm-json-preview">
      <div class="sm-json-preview-header">
        <h2 class="sm-section-title">📝 JSON 命令预览</h2>
        <button class="sm-btn sm-btn--primary sm-btn--sm" @click="copyJson">📋 复制到剪贴板</button>
      </div>
      <pre class="sm-code-block sm-code-block--large">{{ jsonPreview }}</pre>
    </section>
  </div>
</template>

<style scoped>
/* ─── 全局布局 ──────────────────────────────────────── */
.stage-motion {
  height: 100vh;
  width: 25%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

/* ─── 标题栏 ────────────────────────────────────────── */
.sm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.sm-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-heading);
}
.sm-header-actions {
  display: flex;
  gap: 0.5rem;
}

/* ─── 按钮 ──────────────────────────────────────────── */
.sm-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--color-background);
  color: var(--color-text);
}
.sm-btn:hover {
  border-color: var(--color-border-hover);
  background: var(--color-background-soft);
}
.sm-btn--primary {
  background: hsla(160, 100%, 37%, 1);
  color: #fff;
  border-color: hsla(160, 100%, 37%, 1);
}
.sm-btn--primary:hover {
  background: hsla(160, 100%, 37%, 0.85);
}
.sm-btn--outline {
  background: transparent;
}
.sm-btn--sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
.sm-btn--icon {
  padding: 0.25rem 0.4rem;
  font-size: 0.85rem;
  border-radius: 4px;
}
.sm-btn--danger:hover {
  background: #e74c3c22;
  border-color: #e74c3c;
  color: #e74c3c;
}
.sm-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ─── 控制面板 ──────────────────────────────────────── */
.sm-control-panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}
.sm-control-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.sm-json-preview-inline {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
.sm-json-preview-inline .sm-code-block {
  flex: 1;
  margin: 0;
}

/* ─── 主体 ──────────────────────────────────────────── */
.sm-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;
}

/* ─── 侧栏 ──────────────────────────────────────────── */
.sm-sidebar {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  min-height: 0;
  overflow: hidden;
}
.sm-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sm-track-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  flex: 1;
}
.sm-track-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--color-background);
}
.sm-track-item:hover {
  border-color: var(--color-border-hover);
}
.sm-track-item--active {
  border-color: hsla(160, 100%, 37%, 1);
  background: hsla(160, 100%, 37%, 0.08);
}
.sm-track-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.sm-track-item-id {
  font-weight: 600;
  font-size: 0.85rem;
}
.sm-track-item-op {
  font-size: 0.7rem;
  color: var(--color-text);
  opacity: 0.7;
}
.sm-track-item-actions {
  display: flex;
  gap: 0.25rem;
}

/* ─── 编辑器 ────────────────────────────────────────── */
.sm-editor {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* ─── 标题 ──────────────────────────────────────────── */
.sm-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.sm-section-subtitle {
  font-size: 0.8rem;
  color: var(--color-text);
  opacity: 0.6;
  font-weight: 400;
}
.sm-group-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

/* ─── 表单 ──────────────────────────────────────────── */
.sm-form-group {
  margin-bottom: 0.75rem;
}
.sm-form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}
.sm-form-row--vec3 {
  grid-template-columns: repeat(3, 1fr);
}
.sm-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.sm-field--wide {
  grid-column: span 1;
}
.sm-field--toggle {
  align-items: center;
  justify-content: center;
}
.sm-field--toggle .sm-label {
  margin-bottom: 0;
}
.sm-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text);
  opacity: 0.8;
}
.sm-input {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.85rem;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s;
}
.sm-input:focus {
  outline: none;
  border-color: hsla(160, 100%, 37%, 1);
}
.sm-input--num {
  width: 100%;
  font-variant-numeric: tabular-nums;
}
.sm-select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.85rem;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}
.sm-select:focus {
  outline: none;
  border-color: hsla(160, 100%, 37%, 1);
}

/* ─── Toggle 开关 ──────────────────────────────────── */
.sm-toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}
.sm-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.sm-toggle-slider {
  position: absolute;
  inset: 0;
  background: var(--color-border);
  border-radius: 22px;
  transition: 0.3s;
  cursor: pointer;
}
.sm-toggle-slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
}
.sm-toggle input:checked + .sm-toggle-slider {
  background: hsla(160, 100%, 37%, 1);
}
.sm-toggle input:checked + .sm-toggle-slider::before {
  transform: translateX(18px);
}

/* ─── JSON 预览 ─────────────────────────────────────── */
.sm-json-preview {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  max-height: 200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sm-json-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.sm-code-block {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.75rem;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
  color: var(--color-text);
}
.sm-code-block--large {
  max-height: 150px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* ─── 响应式 ────────────────────────────────────────── */
@media (max-width: 768px) {
  .sm-form-row--vec3 {
    grid-template-columns: 1fr;
  }
}
</style>
