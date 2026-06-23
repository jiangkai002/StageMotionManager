<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, UploadProps, UploadUserFile } from 'element-plus'
import { ElMessage } from 'element-plus'

const formRef = ref<FormInstance>()
const fileList = ref<UploadUserFile[]>([])

const form = reactive({
  name: '',
  category: 'stage',
  version: '1.0.0',
  description: '',
})

const rules = {
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择模型分类', trigger: 'change' }],
}

const handleFileChange: UploadProps['onChange'] = (_file, files) => {
  fileList.value = files.slice(-1)
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) return

  if (!fileList.value.length) {
    ElMessage.warning('请先选择 GLB / GLTF 模型文件')
    return
  }

  ElMessage.success('模型信息已准备提交')
}

function resetForm() {
  formRef.value?.resetFields()
  fileList.value = []
}
</script>

<template>
  <div class="model-upload-setting">
    <el-container>
      <el-header>Header</el-header>
      <el-container>
        <el-aside width="33.33%">Aside</el-aside>
        <el-main>Main</el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.model-upload-setting {
  height: 100%;
  width: 100%;
}

.model-upload-setting > .el-container {
  height: 100%;
}

.model-upload-setting .el-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  background: #ba0000;
  border-bottom: 1px solid #e5e7eb;
}

.model-upload-setting .el-aside {
  padding: 20px;
  height: 100%;
  background: #07ca14;
  border-right: 1px solid #e5e7eb;
  overflow-y: hidden;
}

.model-upload-setting .el-main {
  padding: 20px;
  height: 100%;
  background: #f4f7fb;
}
</style>
