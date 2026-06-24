<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Aim, ArrowLeft, Edit, Refresh, Search, View } from '@element-plus/icons-vue'
import { apiClient, MotionType, type MotionRange } from '@/api'
import ModelViewer from '@/components/ModelViewer.vue'
import type { StageMotionTrack } from '@/models/StageMotionTrack'
import type { SceneElementInfo } from '@/scenes/ModelScene'

interface ModelFileItem {
  id: string
  name: string
  type: string
  room: string
  filePath: string
  fileSize: number
  description?: string
}

interface TreeNode {
  id: string
  label: string
  count?: number
  model?: ModelFileItem
  children?: TreeNode[]
}

interface BackendElement {
  name: string
  elementId: string
  guid?: string
  model_file_id: string
  motion_ranges?: MotionRange[]
}

interface ElementItem extends SceneElementInfo {
  configured: boolean
  motion_ranges: MotionRange[]
}

interface MotionRangeForm {
  motion_type: MotionType
  label: string
  enabled: boolean
  min: number
  max: number
  unit: string
}

interface ModelViewerExpose {
  getElements: () => SceneElementInfo[]
  focusElement: (elementId: string) => boolean
  executeTrack: (track: StageMotionTrack) => void
  executeControl: (cmd: { op: 'stopAll' }) => void
}

const defaultRoom = '未分组厅'
const defaultType = '未分组类型'
const modelViewerRef = ref<ModelViewerExpose | null>(null)
const elementPanelRef = ref<HTMLElement | null>(null)
const modelFiles = ref<ModelFileItem[]>([])
const backendElements = ref<BackendElement[]>([])
const sceneElements = ref<SceneElementInfo[]>([])
const selectedModel = ref<ModelFileItem | null>(null)
const selectedElementId = ref('')
const modelKeyword = ref('')
const elementKeyword = ref('')
const isLoadingModels = ref(false)
const isLoadingElements = ref(false)
const isSaving = ref(false)
const isPreviewing = ref(false)
const panelMode = ref<'list' | 'edit' | 'view'>('list')

const motionRangeForm = reactive<MotionRangeForm[]>([
  {
    motion_type: MotionType.translation_x,
    label: 'X 平移',
    enabled: false,
    min: 0,
    max: 0,
    unit: 'm',
  },
  {
    motion_type: MotionType.translation_y,
    label: 'Y 平移',
    enabled: false,
    min: 0,
    max: 0,
    unit: 'm',
  },
  {
    motion_type: MotionType.translation_z,
    label: 'Z 平移',
    enabled: false,
    min: 0,
    max: 0,
    unit: 'm',
  },
  {
    motion_type: MotionType.rotation_x,
    label: 'X 旋转',
    enabled: false,
    min: 0,
    max: 0,
    unit: 'deg',
  },
  {
    motion_type: MotionType.rotation_y,
    label: 'Y 旋转',
    enabled: false,
    min: 0,
    max: 0,
    unit: 'deg',
  },
  {
    motion_type: MotionType.rotation_z,
    label: 'Z 旋转',
    enabled: false,
    min: 0,
    max: 0,
    unit: 'deg',
  },
])

const treeData = computed<TreeNode[]>(() => {
  const keyword = modelKeyword.value.trim().toLowerCase()
  const visibleModels = keyword
    ? modelFiles.value.filter((model) =>
        [model.name, model.room, model.type].some((value) => value.toLowerCase().includes(keyword)),
      )
    : modelFiles.value

  const roomMap = new Map<string, Map<string, ModelFileItem[]>>()
  for (const model of visibleModels) {
    const room = model.room || defaultRoom
    const type = model.type || defaultType
    if (!roomMap.has(room)) roomMap.set(room, new Map())
    const typeMap = roomMap.get(room)!
    if (!typeMap.has(type)) typeMap.set(type, [])
    typeMap.get(type)!.push(model)
  }

  return Array.from(roomMap.entries()).map(([room, typeMap]) => {
    const typeChildren = Array.from(typeMap.entries()).map(([type, models]) => ({
      id: `type:${room}:${type}`,
      label: type,
      count: models.length,
      children: models.map((model) => ({
        id: `model:${model.id}`,
        label: model.name,
        model,
      })),
    }))

    return {
      id: `room:${room}`,
      label: room,
      count: typeChildren.reduce((sum, node) => sum + (node.count ?? 0), 0),
      children: typeChildren,
    }
  })
})

const elements = computed<ElementItem[]>(() => {
  const backendMap = new Map(backendElements.value.map((element) => [element.elementId, element]))
  const sceneMap = new Map(sceneElements.value.map((element) => [element.elementId, element]))

  for (const backendElement of backendElements.value) {
    if (!sceneMap.has(backendElement.elementId)) {
      sceneMap.set(backendElement.elementId, {
        elementId: backendElement.elementId,
        name: backendElement.name,
        meshName: backendElement.name,
        guid: backendElement.guid,
      })
    }
  }

  return Array.from(sceneMap.values()).map((element) => {
    const backendElement = backendMap.get(element.elementId)
    return {
      ...element,
      name: element.name || backendElement?.name || element.meshName,
      configured: Boolean(backendElement?.motion_ranges?.length),
      motion_ranges: backendElement?.motion_ranges ?? [],
    }
  })
})

const filteredElements = computed(() => {
  const keyword = elementKeyword.value.trim().toLowerCase()
  if (!keyword) return elements.value
  return elements.value.filter((element) =>
    [element.elementId, element.name, element.meshName].some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(keyword),
    ),
  )
})

const selectedElement = computed(
  () => elements.value.find((element) => element.elementId === selectedElementId.value) ?? null,
)
const isReadonlyPanel = computed(() => panelMode.value === 'view')
const modelSelectionEnabled = computed(() => panelMode.value === 'list')
const panelTitle = computed(() => {
  if (panelMode.value === 'edit') return '设置运动参数'
  if (panelMode.value === 'view') return '查询运动参数'
  return '构件'
})

onMounted(() => {
  loadModelFiles()
})

async function loadModelFiles() {
  isLoadingModels.value = true
  try {
    const { data } = await apiClient.get('/model-files', { params: { skip: 0, limit: 500 } })
    const list = Array.isArray(data) ? data : (data?.items ?? [])
    modelFiles.value = list.map((item: any) => ({
      id: String(item.id ?? item._id ?? ''),
      name: item.name ?? '未命名模型',
      type: item.type ?? defaultType,
      room: item.room ?? defaultRoom,
      filePath: item.file_path ?? '',
      fileSize: Number(item.file_size ?? 0),
      description: item.description ?? '',
    }))
  } catch (error) {
    console.error('加载模型文件失败:', error)
    ElMessage.error('加载模型文件失败')
  } finally {
    isLoadingModels.value = false
  }
}

async function loadBackendElements(modelId: string) {
  isLoadingElements.value = true
  try {
    const { data } = await apiClient.get('/elements', { params: { skip: 0, limit: 2000 } })
    const list = Array.isArray(data) ? data : (data?.items ?? [])
    backendElements.value = list
      .filter((item: any) => String(item.model_file_id ?? '') === modelId)
      .map((item: any) => ({
        name: item.name ?? String(item.elementId ?? item.element_id ?? ''),
        elementId: String(item.elementId ?? item.element_id ?? ''),
        guid: item.guid,
        model_file_id: String(item.model_file_id ?? ''),
        motion_ranges: item.motion_ranges ?? [],
      }))
  } catch (error) {
    console.error('加载构件配置失败:', error)
    ElMessage.error('加载构件配置失败')
  } finally {
    isLoadingElements.value = false
  }
}

async function refreshSelectedElementConfig() {
  if (!selectedModel.value) return
  await loadBackendElements(selectedModel.value.id)
}

async function handleTreeNodeClick(node: TreeNode) {
  if (!node.model) return
  selectedModel.value = node.model
  selectedElementId.value = ''
  panelMode.value = 'list'
  backendElements.value = []
  sceneElements.value = []
  resetMotionForm()
  await loadBackendElements(node.model.id)
}

async function handleSceneReady() {
  await nextTick()
  sceneElements.value = modelViewerRef.value?.getElements() ?? []
}

async function handleMeshSelected(elementId: string) {
  if (panelMode.value !== 'list') return

  const element = elements.value.find((item) => item.elementId === elementId)
  if (!element) return

  const isVisible = filteredElements.value.some((item) => item.elementId === elementId)
  if (!isVisible) {
    elementKeyword.value = ''
  }

  focusElement(element)
  await scrollElementIntoView(elementId)
}

function focusElement(element: ElementItem) {
  selectedElementId.value = element.elementId
  const focused = modelViewerRef.value?.focusElement(element.elementId)
  if (focused === false) {
    ElMessage.warning('模型中未找到该构件')
  }
}

async function scrollElementIntoView(elementId: string) {
  await nextTick()

  const rows = elementPanelRef.value?.querySelectorAll<HTMLElement>('.element-item') ?? []
  const row = Array.from(rows).find((item) => item.dataset.elementId === elementId)
  row?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

function openMotionEditor(element: ElementItem) {
  focusElement(element)
  panelMode.value = 'edit'
  fillMotionForm(element.motion_ranges)
}

async function queryMotionRanges(element: ElementItem) {
  focusElement(element)
  await refreshSelectedElementConfig()
  const latestElement =
    elements.value.find((item) => item.elementId === element.elementId) ?? element
  panelMode.value = 'view'
  fillMotionForm(latestElement.motion_ranges)

  if (!latestElement.motion_ranges.length) {
    ElMessage.info('该构件暂无已保存的运动参数')
  }
}

function returnToElementList() {
  panelMode.value = 'list'
}

function fillMotionForm(ranges: MotionRange[] = []) {
  for (const row of motionRangeForm) {
    const saved = ranges.find((range) => range.motion_type === row.motion_type)
    row.enabled = Boolean(saved)
    row.min = saved?.min ?? 0
    row.max = saved?.max ?? 0
    row.unit = saved?.unit ?? (row.motion_type.startsWith('translation') ? 'm' : 'deg')
  }
}

function resetMotionForm() {
  fillMotionForm([])
}

function buildMotionRanges(): MotionRange[] {
  return motionRangeForm
    .filter((row) => row.enabled)
    .map((row) => ({
      motion_type: row.motion_type,
      min: Number(row.min),
      max: Number(row.max),
      unit: row.unit,
    }))
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function createPreviewTrack(
  elementId: string,
  motionType: MotionType,
  value: number,
  duration = 0.8,
): StageMotionTrack {
  const track: StageMotionTrack = {
    elementId,
    duration,
    relative: true,
    snapToEnd: true,
  }

  switch (motionType) {
    case MotionType.translation_x:
      track.translation = { x: value, y: 0, z: 0 }
      break
    case MotionType.translation_y:
      track.translation = { x: 0, y: value, z: 0 }
      break
    case MotionType.translation_z:
      track.translation = { x: 0, y: 0, z: value }
      break
    case MotionType.rotation_x:
      track.rotation = { pitch: value, yaw: 0, roll: 0 }
      break
    case MotionType.rotation_y:
      track.rotation = { pitch: 0, yaw: value, roll: 0 }
      break
    case MotionType.rotation_z:
      track.rotation = { pitch: 0, yaw: 0, roll: value }
      break
  }

  return track
}

async function previewMotionRanges() {
  if (!selectedElement.value || isReadonlyPanel.value) return

  const ranges = buildMotionRanges()
  if (!ranges.length) {
    ElMessage.warning('请先启用至少一个运动范围')
    return
  }

  for (const row of motionRangeForm) {
    if (row.enabled && Number(row.min) > Number(row.max)) {
      ElMessage.warning(`${row.label} 的最小值不能大于最大值`)
      return
    }
  }

  isPreviewing.value = true
  modelViewerRef.value?.executeControl({ op: 'stopAll' })
  modelViewerRef.value?.focusElement(selectedElement.value.elementId)

  try {
    for (const range of ranges) {
      const min = Number(range.min)
      const max = Number(range.max)
      const duration = 0.8
      const steps = [min, max - min, -max].filter((value) => Math.abs(value) > 0.000001)

      for (const value of steps) {
        modelViewerRef.value?.executeTrack(
          createPreviewTrack(selectedElement.value.elementId, range.motion_type, value, duration),
        )
        await wait(duration * 1000 + 120)
      }
    }
  } finally {
    isPreviewing.value = false
  }
}

async function saveElementMotionRanges() {
  if (!selectedModel.value || !selectedElement.value || isReadonlyPanel.value) return

  for (const row of motionRangeForm) {
    if (row.enabled && Number(row.min) > Number(row.max)) {
      ElMessage.warning(`${row.label} 的最小值不能大于最大值`)
      return
    }
  }

  const elementIdValue = Number(selectedElement.value.elementId)
  const payload = {
    name: selectedElement.value.name || selectedElement.value.meshName,
    elementId: Number.isFinite(elementIdValue) ? elementIdValue : selectedElement.value.elementId,
    guid: selectedElement.value.guid,
    model_file_id: selectedModel.value.id,
    motion_ranges: buildMotionRanges(),
  }

  isSaving.value = true
  try {
    const exists = backendElements.value.some(
      (element) => element.elementId === selectedElement.value?.elementId,
    )

    if (exists) {
      await apiClient.put(
        `/elements/${encodeURIComponent(selectedElement.value.elementId)}`,
        payload,
      )
    } else {
      await apiClient.post('/elements', payload)
    }

    await loadBackendElements(selectedModel.value.id)
    const refreshedElement = elements.value.find(
      (element) => element.elementId === selectedElement.value?.elementId,
    )
    if (refreshedElement) fillMotionForm(refreshedElement.motion_ranges)
    ElMessage.success('构件运动范围已保存')
  } catch (error) {
    console.error('保存构件运动范围失败:', error)
    ElMessage.error('保存构件运动范围失败')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="element-motion-para">
    <section class="model-tree-panel">
      <div class="panel-header">
        <div>
          <h3>模型文件</h3>
          <p>按厅和模型类型聚合</p>
        </div>
        <el-button :icon="Refresh" circle :loading="isLoadingModels" @click="loadModelFiles" />
      </div>

      <el-input
        v-model="modelKeyword"
        class="tree-search"
        :prefix-icon="Search"
        clearable
        placeholder="搜索模型"
      />

      <el-scrollbar class="model-tree-scroll">
        <el-empty v-if="!treeData.length" description="暂无模型文件" />
        <el-tree
          v-else
          :data="treeData"
          node-key="id"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleTreeNodeClick"
        >
          <template #default="{ data }">
            <div class="tree-node" :class="{ 'is-model': data.model }">
              <span class="tree-node__label">{{ data.label }}</span>
              <el-tag v-if="data.count" size="small" effect="plain">{{ data.count }}</el-tag>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </section>

    <section class="model-view-panel">
      <ModelViewer
        v-if="selectedModel"
        ref="modelViewerRef"
        :key="selectedModel.id"
        :model-url="selectedModel.filePath"
        :show-controls="false"
        :show-fps="false"
        :selection-enabled="modelSelectionEnabled"
        @scene-ready="handleSceneReady"
        @mesh-selected="handleMeshSelected"
      />
      <el-empty v-else description="请选择左侧模型文件" />
    </section>

    <section ref="elementPanelRef" class="element-panel">
      <div class="panel-header">
        <div>
          <h3>{{ panelTitle }}</h3>
          <p v-if="panelMode === 'list'">{{ selectedModel ? selectedModel.name : '未选择模型' }}</p>
          <p v-else-if="selectedElement">
            {{ selectedElement.name }}
            <span>ID: {{ selectedElement.elementId }}</span>
          </p>
        </div>
        <el-tag v-if="panelMode === 'list' && selectedModel" type="info" effect="plain">
          {{ elements.length }}
        </el-tag>
        <el-button v-else :icon="ArrowLeft" size="small" @click="returnToElementList">
          返回
        </el-button>
      </div>

      <template v-if="panelMode === 'list'">
        <el-input
          v-model="elementKeyword"
          class="element-search"
          :prefix-icon="Search"
          clearable
          placeholder="搜索构件"
          :disabled="!selectedModel"
        />

        <el-scrollbar class="element-list">
          <el-empty
            v-if="selectedModel && !filteredElements.length && !isLoadingElements"
            description="暂无构件"
          />
          <div
            v-for="element in filteredElements"
            :key="element.elementId"
            :data-element-id="element.elementId"
            class="element-item"
            :class="{ active: element.elementId === selectedElementId }"
            @click="focusElement(element)"
          >
            <div class="element-item__main">
              <span class="element-name">{{ element.name }}</span>
              <span class="element-id">ID: {{ element.elementId }}</span>
            </div>
            <div class="element-actions" @click.stop>
              <el-tag v-if="element.configured" size="small" type="success">已配置</el-tag>
              <el-button
                :icon="Edit"
                size="small"
                type="primary"
                text
                @click="openMotionEditor(element)"
              >
                设置
              </el-button>
              <el-button :icon="View" size="small" text @click="queryMotionRanges(element)">
                查询
              </el-button>
            </div>
          </div>
        </el-scrollbar>
      </template>

      <template v-else>
        <div class="motion-panel-hint">模型视图仍可旋转、平移和缩放；当前已暂停点击选择构件。</div>

        <el-empty v-if="!selectedElement" description="请选择一个构件" />
        <el-form v-else label-position="top" class="motion-form">
          <div v-for="row in motionRangeForm" :key="row.motion_type" class="motion-row">
            <el-checkbox v-model="row.enabled" :disabled="isReadonlyPanel">
              {{ row.label }}
            </el-checkbox>
            <div class="motion-row__fields">
              <el-input-number
                v-model="row.min"
                :disabled="isReadonlyPanel || !row.enabled"
                controls-position="right"
                placeholder="最小"
              />
              <el-input-number
                v-model="row.max"
                :disabled="isReadonlyPanel || !row.enabled"
                controls-position="right"
                placeholder="最大"
              />
              <el-input v-model="row.unit" :disabled="isReadonlyPanel || !row.enabled" />
            </div>
          </div>
        </el-form>

        <div class="motion-panel-footer">
          <el-button @click="returnToElementList">返回</el-button>
          <el-button
            v-if="!isReadonlyPanel"
            :loading="isPreviewing"
            :disabled="!selectedElement || isSaving"
            @click="previewMotionRanges"
          >
            预览
          </el-button>
          <el-button
            v-if="!isReadonlyPanel"
            type="primary"
            :loading="isSaving"
            :disabled="!selectedElement || isPreviewing"
            @click="saveElementMotionRanges"
          >
            保存到后端
          </el-button>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.element-motion-para {
  display: grid;
  grid-template-columns: 280px minmax(420px, 1fr) 420px;
  gap: 12px;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.model-tree-panel,
.model-view-panel,
.element-panel {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.model-tree-panel,
.element-panel {
  display: flex;
  flex-direction: column;
  padding: 14px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  line-height: 22px;
  color: #111827;
}

.panel-header p {
  margin: 2px 0 0;
  max-width: 240px;
  overflow: hidden;
  color: #6b7280;
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-header p span {
  display: block;
}

.tree-search,
.element-search {
  margin-bottom: 12px;
}

.model-tree-scroll,
.element-list {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.model-tree-scroll :deep(.el-scrollbar__wrap),
.element-list :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  padding-right: 8px;
}

.tree-node__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-node.is-model .tree-node__label {
  color: #2563eb;
}

.model-view-panel {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-panel {
  gap: 0;
}

.element-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 10px;
  margin-bottom: 8px;
  border: 1px solid #eef2f7;
  border-radius: 6px;
  background: #f9fafb;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.element-item:hover,
.element-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.element-item__main {
  min-width: 0;
}

.element-name,
.element-id {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.element-name {
  color: #111827;
  font-size: 13px;
  font-weight: 600;
}

.element-id {
  margin-top: 2px;
  color: #6b7280;
  font-size: 12px;
}

.element-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
}

.motion-panel-hint {
  flex-shrink: 0;
  padding: 9px 10px;
  margin-bottom: 10px;
  color: #475569;
  font-size: 12px;
  line-height: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.motion-form {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.motion-row {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.motion-row__fields {
  display: grid;
  grid-template-columns: 1fr 1fr 70px;
  gap: 8px;
  margin-top: 6px;
}

.motion-row__fields :deep(.el-input-number) {
  width: 100%;
}

.motion-panel-footer {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 14px;
  margin-top: 12px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 1280px) {
  .element-motion-para {
    grid-template-columns: 240px minmax(360px, 1fr) 380px;
  }
}
</style>
