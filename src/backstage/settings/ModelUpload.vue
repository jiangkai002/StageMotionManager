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
  <section class="settings-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <h3>模型上传</h3>
            <p>维护舞台模型文件与基础资料。</p>
          </div>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="模型名称" prop="name">
              <el-input v-model="form.name" placeholder="例如：乐池升降机" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="模型分类" prop="category">
              <el-select v-model="form.category" class="full-width">
                <el-option label="舞台设备" value="stage" />
                <el-option label="灯光设备" value="light" />
                <el-option label="布景道具" value="prop" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="版本号">
          <el-input v-model="form.version" placeholder="1.0.0" />
        </el-form-item>

        <el-form-item label="模型文件">
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :file-list="fileList"
            accept=".glb,.gltf"
            @change="handleFileChange"
          >
            <div class="upload-text">
              <strong>拖拽模型文件到此处</strong>
              <span>支持 .glb / .gltf，当前页面先完成本地选择与表单校验。</span>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="说明">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="补充模型来源、比例、适用舞台区域等信息"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">保存模型</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </section>
</template>

<style scoped>
.settings-page {
  max-width: 1080px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.card-header p {
  margin: 4px 0 0;
  color: #64748b;
}

.full-width {
  width: 100%;
}

.upload-text {
  display: grid;
  gap: 6px;
  color: #334155;
}

.upload-text strong {
  font-weight: 700;
}

.upload-text span {
  font-size: 13px;
  color: #64748b;
}
</style>
