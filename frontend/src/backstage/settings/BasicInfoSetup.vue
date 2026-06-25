<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElementBasicInfoService, type ElementBasicInfo, type ElementType } from '@/api'
import { apiClient } from '@/api'

/** 表格数据 */
const tableData = ref<ElementBasicInfo[]>([])
const loading = ref(false)

/** 新增/编辑弹窗 */
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const dialogTitle = ref('')
const submitting = ref(false)

/** 表单数据 */
const form = reactive<{
  elementId: number | null
  name: string
  type: ElementType | ''
  specification: string
  supplier: string
  rated_load: string
  drive_method: string
  function_description: string
}>({
  elementId: null,
  name: '',
  type: '',
  specification: '',
  supplier: '',
  rated_load: '',
  drive_method: '',
  function_description: '',
})

/** 类型选项 */
const typeOptions = ref<string[]>([])

/** 表单引用 */
const formRef = ref()

/** 表单校验规则 */
const rules = {
  name: [{ required: true, message: '请输入构件名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择构件类型', trigger: 'change' }],
}

onMounted(() => {
  loadList()
  loadTypes()
})

/** 加载列表 */
async function loadList() {
  loading.value = true
  try {
    const data = await ElementBasicInfoService.getBasicInfosApiElementBasicInfoGet({
      skip: 0,
      limit: 100,
    })
    const list = Array.isArray(data) ? data : (data?.items ?? [])
    tableData.value = list
  } catch (error) {
    console.error('加载基础信息列表失败:', error)
  } finally {
    loading.value = false
  }
}

/** 加载类型选项 */
async function loadTypes() {
  try {
    const data = await ElementBasicInfoService.getTypesApiElementBasicInfoTypesGet()
    typeOptions.value = Array.isArray(data) ? data.map((x) => x.value) : []
  } catch (error) {
    console.error('加载类型列表失败:', error)
  }
}

/** 重置表单 */
function resetForm() {
  form.elementId = null
  form.name = ''
  form.type = ''
  form.specification = ''
  form.supplier = ''
  form.rated_load = ''
  form.drive_method = ''
  form.function_description = ''
}

/** 打开新增弹窗 */
function handleCreate() {
  resetForm()
  dialogMode.value = 'create'
  dialogTitle.value = '新增构件基础信息'
  dialogVisible.value = true
}

/** 打开编辑弹窗 */
function handleEdit(row: any) {
  resetForm()
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑构件基础信息'
  const info = row as ElementBasicInfo
  form.elementId = row.elementId ?? row.element_id ?? null
  form.name = info.name
  form.type = info.type
  form.specification = info.specification ?? ''
  form.supplier = info.supplier ?? ''
  form.rated_load = info.rated_load ?? ''
  form.drive_method = info.drive_method ?? ''
  form.function_description = info.function_description ?? ''
  dialogVisible.value = true
}

/** 提交表单 */
async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    submitting.value = true
    const payload: ElementBasicInfo = {
      name: form.name,
      type: form.type as ElementType,
      specification: form.specification || undefined,
      supplier: form.supplier || undefined,
      rated_load: form.rated_load || undefined,
      drive_method: form.drive_method || undefined,
      function_description: form.function_description || undefined,
    }

    try {
      if (dialogMode.value === 'create') {
        await ElementBasicInfoService.createBasicInfoApiElementBasicInfoPost({ body: payload })
        ElMessage.success('创建成功')
      } else {
        // 生成的 API 客户端缺少 body 参数，直接用 apiClient 调用
        await apiClient.put(`/api/element-basic-info/${form.elementId}`, payload)
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      await loadList()
    } catch (error) {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}

/** 删除 */
async function handleDelete(row: any) {
  const elementId = row.elementId ?? row.element_id
  if (!elementId) return

  try {
    await ElMessageBox.confirm(`确定删除「${row.name}」吗？`, '提示', {
      type: 'warning',
    })
    await ElementBasicInfoService.deleteBasicInfoApiElementBasicInfoElementIdDelete({
      elementId,
    })
    ElMessage.success('删除成功')
    await loadList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}
</script>

<template>
  <div class="basic-info-setup">
    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate">新增</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      style="width: 100%"
      :header-cell-style="{ background: '#f9fafb' }"
    >
      <el-table-column prop="name" label="构件名称" min-width="140" show-overflow-tooltip />
      <el-table-column prop="type" label="类型" min-width="160" show-overflow-tooltip />
      <el-table-column prop="specification" label="规格" min-width="120" show-overflow-tooltip />
      <el-table-column prop="supplier" label="供应商" min-width="120" show-overflow-tooltip />
      <el-table-column prop="rated_load" label="额定荷载" min-width="100" show-overflow-tooltip />
      <el-table-column prop="drive_method" label="驱动方式" min-width="100" show-overflow-tooltip />
      <el-table-column
        prop="function_description"
        label="功能说明"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button :icon="Edit" size="small" text @click="handleEdit(row)" />
          <el-button :icon="Delete" size="small" text type="danger" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="构件名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入构件名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" filterable style="width: 100%">
            <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="form.specification" placeholder="请输入规格" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="form.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="额定荷载">
          <el-input v-model="form.rated_load" placeholder="请输入额定荷载" />
        </el-form-item>
        <el-form-item label="驱动方式">
          <el-input v-model="form.drive_method" placeholder="请输入驱动方式" />
        </el-form-item>
        <el-form-item label="功能说明">
          <el-input
            v-model="form.function_description"
            type="textarea"
            :rows="3"
            placeholder="请输入功能说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.basic-info-setup {
  padding: 16px;
}

.toolbar {
  margin-bottom: 16px;
}
</style>
