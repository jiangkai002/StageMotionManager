<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Delete, Edit, Link, Plus, Refresh, Search, VideoPlay } from '@element-plus/icons-vue'
import {
  ElementBasicInfoService,
  MaintenanceRequirementsService,
  type ElementType,
  type MaintenancePeriod,
  type MaintenanceRequirement,
  type MaintenanceRequirementUpdate,
} from '@/api'

interface SelectOption<T = string> {
  label: string
  value: T
}

type RequirementRow = MaintenanceRequirement & {
  id?: string
  _id?: string
}

const defaultPeriod = '月' as MaintenancePeriod

const loading = ref(false)
const submitting = ref(false)
const requirements = ref<RequirementRow[]>([])
const typeOptions = ref<SelectOption<ElementType>[]>([])
const periodOptions = ref<SelectOption<MaintenancePeriod>[]>([])
const keyword = ref('')

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const editingId = ref('')

const form = reactive({
  type: '' as ElementType | '',
  name: '',
  content: '',
  times: 1,
  period: defaultPeriod,
  video_url: '',
})

const rules: FormRules = {
  type: [{ required: true, message: '请选择构件类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入维保名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入维保内容', trigger: 'blur' }],
  times: [{ required: true, message: '请输入次数', trigger: 'change' }],
  period: [{ required: true, message: '请选择周期单位', trigger: 'change' }],
}

const dialogTitle = computed(() => (dialogMode.value === 'create' ? '新增维保要求' : '编辑维保要求'))
const filteredRequirements = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  if (!value) return requirements.value
  return requirements.value.filter((item) =>
    [item.type, item.name, item.content, item.video_url]
      .filter(Boolean)
      .some((text) => String(text).toLowerCase().includes(value)),
  )
})
const totalCount = computed(() => requirements.value.length)
const withVideoCount = computed(() => requirements.value.filter((item) => item.video_url).length)

onMounted(async () => {
  await Promise.all([loadElementTypes(), loadPeriods(), loadRequirements()])
})

function normalizeOptionList<T = string>(value: unknown): SelectOption<T>[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') return { label: item, value: item as T }
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>
        const optionValue = String(record.value ?? '')
        if (optionValue) return { label: optionValue, value: optionValue as T }
      }
      return null
    })
    .filter((item): item is SelectOption<T> => Boolean(item))
}

async function loadElementTypes() {
  try {
    const data = await ElementBasicInfoService.getTypesApiElementBasicInfoTypesGet()
    typeOptions.value = normalizeOptionList<ElementType>(data)
  } catch (error) {
    console.error('加载构件类型失败:', error)
  }
}

async function loadPeriods() {
  try {
    const data = await MaintenanceRequirementsService.getPeriodsApiMaintenanceRequirementsPeriodsGet()
    periodOptions.value = normalizeOptionList<MaintenancePeriod>(data)
    if (!periodOptions.value.length) {
      periodOptions.value = [
        { label: '天', value: '天' as MaintenancePeriod },
        { label: '周', value: '周' as MaintenancePeriod },
        { label: '月', value: '月' as MaintenancePeriod },
        { label: '年', value: '年' as MaintenancePeriod },
      ]
    }
    form.period = periodOptions.value[0]?.value ?? defaultPeriod
  } catch (error) {
    console.error('加载维保周期失败:', error)
  }
}

async function loadRequirements() {
  loading.value = true
  try {
    const data = await MaintenanceRequirementsService.getRequirementsApiMaintenanceRequirementsGet({
      skip: 0,
      limit: 500,
      name: keyword.value.trim() || undefined,
    })
    requirements.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载维保要求失败:', error)
    ElMessage.error('加载维保要求失败')
  } finally {
    loading.value = false
  }
}

function getRowId(row: RequirementRow) {
  return String(row.id ?? row._id ?? '')
}

function resetForm() {
  editingId.value = ''
  form.type = ''
  form.name = ''
  form.content = ''
  form.times = 1
  form.period = periodOptions.value[0]?.value ?? defaultPeriod
  form.video_url = ''
}

function openCreateDialog() {
  resetForm()
  dialogMode.value = 'create'
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEditDialog(row: RequirementRow) {
  resetForm()
  dialogMode.value = 'edit'
  editingId.value = getRowId(row)
  form.type = row.type
  form.name = row.name
  form.content = row.content
  form.times = row.frequency?.times ?? 1
  form.period = (row.frequency?.period ?? defaultPeriod) as MaintenancePeriod
  form.video_url = row.video_url ?? ''
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function buildPayload(): MaintenanceRequirement | MaintenanceRequirementUpdate {
  return {
    type: form.type as ElementType,
    name: form.name.trim(),
    content: form.content.trim(),
    frequency: {
      times: Number(form.times),
      period: form.period,
    },
    video_url: form.video_url.trim(),
  }
}

async function submitForm() {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const payload = buildPayload()
    if (dialogMode.value === 'create') {
      await MaintenanceRequirementsService.createRequirementApiMaintenanceRequirementsPost({
        body: payload as MaintenanceRequirement,
      })
      ElMessage.success('维保要求已创建')
    } else {
      await MaintenanceRequirementsService.updateRequirementApiMaintenanceRequirementsDocIdPut({
        docId: editingId.value,
        body: payload,
      })
      ElMessage.success('维保要求已更新')
    }

    dialogVisible.value = false
    await loadRequirements()
  } catch (error) {
    console.error('保存维保要求失败:', error)
    ElMessage.error('保存维保要求失败')
  } finally {
    submitting.value = false
  }
}

async function deleteRequirement(row: RequirementRow) {
  const docId = getRowId(row)
  if (!docId) return

  try {
    await ElMessageBox.confirm(`确定删除“${row.name}”吗？`, '删除维保要求', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await MaintenanceRequirementsService.deleteRequirementApiMaintenanceRequirementsDocIdDelete({
      docId,
    })
    ElMessage.success('维保要求已删除')
    await loadRequirements()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除维保要求失败:', error)
      ElMessage.error('删除维保要求失败')
    }
  }
}

function openVideo(url?: string) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function formatFrequency(row: RequirementRow) {
  const times = row.frequency?.times ?? 1
  const period = row.frequency?.period ?? defaultPeriod
  return `${times} 次 / ${period}`
}
</script>

<template>
  <div class="maintenance-page">
    <section class="command-bar">
      <div class="metrics">
        <div class="metric-item">
          <span>维保要求</span>
          <strong>{{ totalCount }}</strong>
        </div>
        <div class="metric-item">
          <span>含视频</span>
          <strong>{{ withVideoCount }}</strong>
        </div>
      </div>

      <div class="toolbar">
        <el-input
          v-model="keyword"
          class="search-input"
          clearable
          placeholder="搜索构件类型、维保名称或内容"
          :prefix-icon="Search"
          @keyup.enter="loadRequirements"
          @clear="loadRequirements"
        />
        <el-button :icon="Refresh" :loading="loading" @click="loadRequirements">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增维保要求</el-button>
      </div>
    </section>

    <section class="table-panel">
      <el-table
        v-loading="loading"
        :data="filteredRequirements"
        row-key="id"
        height="100%"
        border
        :header-cell-style="{ background: '#f9fafb' }"
      >
        <el-table-column prop="type" label="构件类型" min-width="180" show-overflow-tooltip />
        <el-table-column prop="name" label="维保名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="频率" width="130" align="center">
          <template #default="{ row }">
            <el-tag type="primary" effect="plain">{{ formatFrequency(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="维保内容" min-width="320" show-overflow-tooltip />
        <el-table-column label="教学视频" width="120" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.video_url"
              :icon="VideoPlay"
              text
              type="primary"
              @click="openVideo(row.video_url)"
            >
              查看
            </el-button>
            <span v-else class="muted">无</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="128" fixed="right" align="center">
          <template #default="{ row }">
            <div class="row-actions">
              <el-button :icon="Edit" size="small" text title="编辑" @click="openEditDialog(row)" />
              <el-button
                :icon="Delete"
                size="small"
                text
                type="danger"
                title="删除"
                @click="deleteRequirement(row)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="680px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="构件类型" prop="type">
          <el-select v-model="form.type" filterable placeholder="请选择构件类型" class="full-width">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="维保名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入维保名称" />
        </el-form-item>
        <el-form-item label="维保频率" required>
          <div class="frequency-fields">
            <el-form-item prop="times">
              <el-input-number v-model="form.times" :min="1" :max="999" controls-position="right" />
            </el-form-item>
            <el-form-item prop="period">
              <el-select v-model="form.period" placeholder="周期单位">
                <el-option
                  v-for="item in periodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="维保内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            resize="vertical"
            placeholder="请输入具体检查、保养或更换要求"
          />
        </el-form-item>
        <el-form-item label="视频地址">
          <el-input v-model="form.video_url" placeholder="请输入教学视频 URL">
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.maintenance-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 14px;
}

.command-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.metrics,
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric-item {
  min-width: 104px;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #edf2f7;
  border-radius: 6px;
}

.metric-item span {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.metric-item strong {
  display: block;
  margin-top: 2px;
  font-size: 20px;
  line-height: 24px;
  color: #0f172a;
}

.search-input {
  width: 300px;
}

.table-panel {
  flex: 1;
  min-height: 0;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.muted {
  color: #94a3b8;
  font-size: 13px;
}

.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
}

.row-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.full-width {
  width: 100%;
}

.frequency-fields {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 10px;
  width: 100%;
}

.frequency-fields :deep(.el-form-item) {
  margin-bottom: 0;
}

.frequency-fields :deep(.el-input-number),
.frequency-fields :deep(.el-select) {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 900px) {
  .command-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-input,
  .toolbar .el-button {
    width: 100%;
  }
}
</style>
