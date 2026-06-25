<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { ArrowDown, ArrowUp, Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import {
  ElementBasicInfoService,
  OperationMethodService,
  type ElementType,
  type OperationMethod,
  type OperationStep,
} from '@/api'

interface SelectOption {
  label: string
  value: string
}

type StepForm = {
  index: number
  step_name: string
  operation_detail: string
  operation_type: string
}

const loading = ref(false)
const submitting = ref(false)
const methods = ref<OperationMethod[]>([])
const elementTypeOptions = ref<SelectOption[]>([])
const operationTypeOptions = ref<SelectOption[]>([])
const activeType = ref('')
const keyword = ref('')

const methodDialogVisible = ref(false)
const stepDialogVisible = ref(false)
const stepDialogMode = ref<'add' | 'edit'>('add')

const methodFormRef = ref<FormInstance>()
const stepFormRef = ref<FormInstance>()

const methodForm = reactive({
  type: '',
})

const stepForm = reactive<StepForm>({
  index: 0,
  step_name: '',
  operation_detail: '',
  operation_type: '',
})

const methodRules: FormRules = {
  type: [{ required: true, message: '请选择构件类型', trigger: 'change' }],
}

const stepRules: FormRules = {
  step_name: [{ required: true, message: '请输入步骤名称', trigger: 'blur' }],
  operation_type: [{ required: true, message: '请选择操作类型', trigger: 'change' }],
}

const existingTypes = computed(() => new Set(methods.value.map((item) => item.type as string)))
const configuredCount = computed(() => methods.value.length)
const totalStepCount = computed(() =>
  methods.value.reduce((sum, item) => sum + (item.operation_steps?.length ?? 0), 0),
)
const availableTypeOptions = computed(() =>
  elementTypeOptions.value.filter((item) => !existingTypes.value.has(item.value)),
)
const filteredMethods = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  if (!normalizedKeyword) return sortedMethods(methods.value)

  return sortedMethods(
    methods.value.filter((item) => {
      const type = String(item.type)
      const steps = item.operation_steps ?? []
      return (
        type.toLowerCase().includes(normalizedKeyword) ||
        steps.some((step) =>
          [step.step_name, step.operation_type, step.operation_detail]
            .filter(Boolean)
            .some((text) => String(text).toLowerCase().includes(normalizedKeyword)),
        )
      )
    }),
  )
})
const selectedMethod = computed(
  () => methods.value.find((item) => String(item.type) === activeType.value) ?? null,
)
const selectedSteps = computed(() => normalizeSteps(selectedMethod.value?.operation_steps ?? []))
const stepDialogTitle = computed(() =>
  stepDialogMode.value === 'add' ? '添加操作步骤' : '编辑操作步骤',
)

onMounted(async () => {
  await Promise.all([loadElementTypes(), loadOperationTypes(), loadMethods()])
})

function normalizeOptionList(value: unknown): SelectOption[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') return { label: item, value: item }
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>
        const value = String(record.value ?? '')
        if (value) return { label: value, value }
      }
      return null
    })
    .filter((item): item is SelectOption => Boolean(item))
}

function sortedMethods(list: OperationMethod[]) {
  return [...list].sort((a, b) => String(a.type).localeCompare(String(b.type), 'zh-Hans-CN'))
}

function normalizeSteps(steps: OperationStep[]) {
  return [...steps].sort((a, b) => a.index - b.index)
}

function reindexSteps(steps: OperationStep[]) {
  return steps.map((step, index) => ({
    ...step,
    index,
    operation_detail: step.operation_detail ?? '',
  }))
}

async function loadElementTypes() {
  try {
    const data = await ElementBasicInfoService.getTypesApiElementBasicInfoTypesGet()
    elementTypeOptions.value = normalizeOptionList(data)
  } catch (error) {
    console.error('加载构件类型失败:', error)
  }
}

async function loadOperationTypes() {
  try {
    const data = await OperationMethodService.getOperationTypesApiOperationMethodTypesGet()
    operationTypeOptions.value = normalizeOptionList(data)
  } catch (error) {
    console.error('加载操作类型失败:', error)
  }
}

async function loadMethods() {
  loading.value = true
  try {
    const data = await OperationMethodService.getOperationMethodsApiOperationMethodGet({
      skip: 0,
      limit: 500,
    })
    methods.value = Array.isArray(data) ? data : []

    if (!methods.value.some((item) => String(item.type) === activeType.value)) {
      activeType.value = String(sortedMethods(methods.value)[0]?.type ?? '')
    }
  } catch (error) {
    console.error('加载操作方法失败:', error)
  } finally {
    loading.value = false
  }
}

function selectMethod(type: string) {
  activeType.value = type
}

function openCreateMethodDialog() {
  methodForm.type = ''
  methodDialogVisible.value = true
  nextTick(() => methodFormRef.value?.clearValidate())
}

async function submitMethod() {
  if (!methodFormRef.value) return

  const valid = await methodFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await OperationMethodService.createOperationMethodApiOperationMethodPost({
      body: {
        type: methodForm.type as ElementType,
        operation_steps: [],
      },
    })
    ElMessage.success('操作方法已创建')
    methodDialogVisible.value = false
    activeType.value = methodForm.type
    await loadMethods()
  } catch (error) {
    console.error('创建操作方法失败:', error)
  } finally {
    submitting.value = false
  }
}

async function deleteMethod(row: OperationMethod) {
  try {
    await ElMessageBox.confirm(`确定删除“${row.type}”的全部操作步骤吗？`, '删除操作方法', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await OperationMethodService.deleteOperationMethodApiOperationMethodTypeDelete({
      type: row.type,
    })
    ElMessage.success('操作方法已删除')
    await loadMethods()
  } catch (error) {
    if (error !== 'cancel') console.error('删除操作方法失败:', error)
  }
}

function resetStepForm() {
  stepForm.index = 0
  stepForm.step_name = ''
  stepForm.operation_detail = ''
  stepForm.operation_type = operationTypeOptions.value[0]?.value ?? ''
}

function openAddStepDialog() {
  if (!selectedMethod.value) return

  resetStepForm()
  stepForm.index = selectedSteps.value.length
  stepDialogMode.value = 'add'
  stepDialogVisible.value = true
  nextTick(() => stepFormRef.value?.clearValidate())
}

function openEditStepDialog(step: OperationStep) {
  resetStepForm()
  stepForm.index = step.index
  stepForm.step_name = step.step_name
  stepForm.operation_detail = step.operation_detail ?? ''
  stepForm.operation_type = String(step.operation_type)
  stepDialogMode.value = 'edit'
  stepDialogVisible.value = true
  nextTick(() => stepFormRef.value?.clearValidate())
}

function buildStepPayload(): OperationStep {
  return {
    index: stepForm.index,
    step_name: stepForm.step_name.trim(),
    operation_detail: stepForm.operation_detail.trim(),
    operation_type: stepForm.operation_type as OperationStep['operation_type'],
  }
}

async function updateSelectedSteps(steps: OperationStep[], successMessage = '操作步骤已更新') {
  if (!selectedMethod.value) return

  await OperationMethodService.updateOperationMethodApiOperationMethodTypePut({
    type: activeType.value as ElementType,
    body: {
      operation_steps: reindexSteps(steps),
    },
  })
  ElMessage.success(successMessage)
}

async function submitStep() {
  if (!selectedMethod.value || !stepFormRef.value) return

  const valid = await stepFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const payload = buildStepPayload()

    if (stepDialogMode.value === 'add') {
      const steps = [...selectedSteps.value]
      const insertIndex = Math.max(0, Math.min(payload.index, steps.length))
      steps.splice(insertIndex, 0, payload)
      await updateSelectedSteps(steps, '操作步骤已添加')
    } else {
      const steps = selectedSteps.value.map((step) =>
        step.index === payload.index ? payload : step,
      )
      await updateSelectedSteps(steps, '操作步骤已更新')
    }

    stepDialogVisible.value = false
    await loadMethods()
  } catch (error) {
    console.error('保存操作步骤失败:', error)
  } finally {
    submitting.value = false
  }
}

async function deleteStep(step: OperationStep) {
  if (!selectedMethod.value) return

  try {
    await ElMessageBox.confirm(`确定删除步骤“${step.step_name}”吗？`, '删除操作步骤', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    const steps = selectedSteps.value.filter((item) => item.index !== step.index)
    await updateSelectedSteps(steps, '操作步骤已删除')
    await loadMethods()
  } catch (error) {
    if (error !== 'cancel') console.error('删除操作步骤失败:', error)
  }
}

async function moveStep(step: OperationStep, direction: -1 | 1) {
  const steps = selectedSteps.value
  const currentIndex = steps.findIndex((item) => item.index === step.index)
  const nextIndex = currentIndex + direction

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= steps.length) return

  const nextSteps = [...steps]
  const currentStep = nextSteps[currentIndex]
  const targetStep = nextSteps[nextIndex]
  if (!currentStep || !targetStep) return

  nextSteps[currentIndex] = targetStep
  nextSteps[nextIndex] = currentStep
  submitting.value = true
  try {
    await updateSelectedSteps(nextSteps, '步骤顺序已更新')
    await loadMethods()
  } catch (error) {
    console.error('移动操作步骤失败:', error)
  } finally {
    submitting.value = false
  }
}

function operationTagType(type: string) {
  if (type.includes('紧急')) return 'danger'
  if (type.includes('切换')) return 'warning'
  if (type.includes('常规')) return 'primary'
  return 'info'
}

function formatDate(value?: Date | string) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}
</script>

<template>
  <div class="operation-method-setup" v-loading="loading">
    <section class="command-bar">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          class="search-input"
          clearable
          placeholder="搜索构件、步骤或操作类型"
          :prefix-icon="Search"
        />
        <el-button :icon="Refresh" @click="loadMethods">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateMethodDialog">
          新增操作方法
        </el-button>
      </div>
    </section>

    <section class="workspace">
      <aside class="method-panel">
        <div class="panel-header">
          <span>构件类型</span>
          <small>{{ filteredMethods.length }} 项</small>
        </div>

        <el-scrollbar class="method-scroll">
          <el-empty v-if="!filteredMethods.length" description="暂无操作方法" />
          <button
            v-for="method in filteredMethods"
            :key="String(method.type)"
            class="method-item"
            :class="{ active: activeType === String(method.type) }"
            type="button"
            @click="selectMethod(String(method.type))"
          >
            <span class="method-title">{{ method.type }}</span>
            <span class="method-meta">
              <span>{{ method.operation_steps?.length ?? 0 }} 个步骤</span>
              <span>{{ formatDate(method.updated_at) }}</span>
            </span>
          </button>
        </el-scrollbar>
      </aside>

      <main class="detail-panel">
        <template v-if="selectedMethod">
          <div class="detail-header">
            <div class="detail-title">
              <span class="eyebrow">操作方法</span>
              <h3>{{ selectedMethod.type }}</h3>
              <p>
                创建 {{ formatDate(selectedMethod.created_at) }}，更新
                {{ formatDate(selectedMethod.updated_at) }}
              </p>
            </div>
            <div class="detail-actions">
              <el-button type="primary" :icon="Plus" @click="openAddStepDialog">添加步骤</el-button>
              <el-button type="danger" :icon="Delete" plain @click="deleteMethod(selectedMethod)">
                删除方法
              </el-button>
            </div>
          </div>

          <el-table :data="selectedSteps" class="steps-table" row-key="index" border>
            <el-table-column label="#" width="64" align="center">
              <template #default="{ $index }">{{ $index + 1 }}</template>
            </el-table-column>
            <el-table-column
              prop="step_name"
              label="步骤名称"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column label="操作类型" width="140" align="center">
              <template #default="{ row }">
                <el-tag :type="operationTagType(row.operation_type)" size="small">
                  {{ row.operation_type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="operation_detail"
              label="操作细节"
              min-width="260"
              show-overflow-tooltip
            />
            <el-table-column label="操作" width="168" fixed="right" align="center">
              <template #default="{ row, $index }">
                <div class="step-actions">
                  <el-button
                    :icon="ArrowUp"
                    class="step-action-button"
                    title="上移"
                    size="small"
                    text
                    :disabled="$index === 0 || submitting"
                    @click="moveStep(row, -1)"
                  />
                  <el-button
                    :icon="ArrowDown"
                    class="step-action-button"
                    title="下移"
                    size="small"
                    text
                    :disabled="$index === selectedSteps.length - 1 || submitting"
                    @click="moveStep(row, 1)"
                  />
                  <el-button
                    :icon="Edit"
                    class="step-action-button"
                    title="编辑"
                    size="small"
                    text
                    @click="openEditStepDialog(row)"
                  />
                  <el-button
                    :icon="Delete"
                    class="step-action-button danger"
                    title="删除"
                    size="small"
                    text
                    type="danger"
                    @click="deleteStep(row)"
                  />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <el-empty v-else description="请选择左侧构件类型，或新增一个操作方法" />
      </main>
    </section>

    <el-dialog
      v-model="methodDialogVisible"
      title="新增操作方法"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form ref="methodFormRef" :model="methodForm" :rules="methodRules" label-width="96px">
        <el-form-item label="构件类型" prop="type">
          <el-select
            v-model="methodForm.type"
            class="full-width"
            filterable
            placeholder="请选择尚未配置的构件类型"
          >
            <el-option
              v-for="item in availableTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="methodDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitMethod">创建</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="stepDialogVisible"
      :title="stepDialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="stepFormRef" :model="stepForm" :rules="stepRules" label-width="96px">
        <el-form-item label="步骤序号">
          <el-input-number
            v-model="stepForm.index"
            :min="0"
            :max="99"
            :disabled="stepDialogMode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="步骤名称" prop="step_name">
          <el-input v-model="stepForm.step_name" placeholder="请输入步骤名称" />
        </el-form-item>
        <el-form-item label="操作类型" prop="operation_type">
          <el-select
            v-model="stepForm.operation_type"
            class="full-width"
            placeholder="请选择操作类型"
          >
            <el-option
              v-for="item in operationTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作细节">
          <el-input
            v-model="stepForm.operation_detail"
            type="textarea"
            :rows="4"
            resize="vertical"
            placeholder="请输入具体操作细节"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="stepDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitStep">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.operation-method-setup {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  gap: 14px;
}

.command-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 14px 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.metrics {
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

.toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
}

.search-input {
  width: 280px;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
  min-height: 0;
  flex: 1;
  gap: 14px;
}

.method-panel,
.detail-panel {
  min-height: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.method-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 14px;
  border-bottom: 1px solid #eef2f7;
}

.panel-header span {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.panel-header small {
  font-size: 12px;
  color: #64748b;
}

.method-scroll {
  flex: 1;
  min-height: 0;
  padding: 8px;
}

.method-item {
  display: block;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 6px;
  font: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
}

.method-item:hover {
  background: #f8fafc;
  border-color: #e5e7eb;
}

.method-item.active {
  background: #ebf3fc;
  border-color: #bfdbfe;
}

.method-title {
  display: block;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.method-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 12px;
  color: #64748b;
}

.method-meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 16px;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.detail-title {
  min-width: 0;
}

.eyebrow {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.detail-title h3 {
  margin: 3px 0 0;
  overflow: hidden;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: #111827;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-title p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #64748b;
}

.detail-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 10px;
}

.steps-table {
  flex: 1;
}

.step-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  white-space: nowrap;
}

.step-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.step-action-button {
  width: 28px;
  height: 28px;
  padding: 0;
  color: #64748b;
  border-radius: 6px;
}

.step-action-button:hover {
  color: #0f6cbd;
  background: #ebf3fc;
}

.step-action-button.danger {
  color: #dc2626;
}

.step-action-button.danger:hover {
  color: #b91c1c;
  background: #fef2f2;
}

.full-width {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1100px) {
  .command-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar {
    justify-content: flex-start;
  }

  .search-input {
    flex: 1;
    width: auto;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .method-panel {
    min-height: 280px;
  }
}

@media (max-width: 720px) {
  .metrics,
  .toolbar,
  .detail-header,
  .detail-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .metric-item,
  .search-input,
  .toolbar .el-button,
  .detail-actions .el-button {
    width: 100%;
  }
}
</style>
