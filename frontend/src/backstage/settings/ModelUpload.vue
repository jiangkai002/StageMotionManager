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
      <el-header>
        <el-button type="primary" class="upload-button">
          <el-icon class="upload-icon"><Upload /></el-icon>
          上传模型
        </el-button>
      </el-header>
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

.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.upload-button:hover {
  background: #1d4fb8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.upload-button .upload-icon {
  font-size: 16px;
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
  background: #ffffff;
  border-radius: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.model-upload-setting .el-aside {
  margin: 12px 0 0 0;
  padding: 20px;
  height: calc(100% - 24px);
  background: #07ca14;
  border-radius: 8px;
  border-right: 1px solid #e5e7eb;
  overflow-y: hidden;
}

.model-upload-setting .el-main {
  margin: 12px 0 0 12px;
  border-radius: 8px;
  padding: 20px;
  height: calc(100% - 24px);
  background: #0563ddda;
}
</style>
