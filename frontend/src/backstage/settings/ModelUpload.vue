<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, UploadFilled, View, Edit } from '@element-plus/icons-vue'
import OSS from 'ali-oss'
import { OssInfoDecryptor } from '@/utils/frontend-decryption'
import { apiClient, ModelFilesService, ModelFileType } from '@/api'

/** 单个上传任务状态 */
interface UploadTask {
  id: string
  file: File
  name: string
  room: string
  description: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  ossUrl?: string
  ossKey?: string
  errorMsg?: string
}

/** 已上传完成的模型记录 */
interface UploadedModel {
  id: string
  name: string
  room: string
  ossUrl: string
  fileSize: number
}

const ossClient = ref<OSS | null>(null)
const uploadTasks = ref<UploadTask[]>([])
const uploadedModels = ref<UploadedModel[]>([])
const isUploading = ref(false)
const uploadDialogVisible = ref(false)
const fileInput = ref<HTMLInputElement>()
const form = reactive({
  room: '',
  description: '',
})

onMounted(async () => {
  await Promise.all([initOssClient(), loadUploadedModels()])
})

/** 初始化 OSS 客户端 */
async function initOssClient() {
  try {
    const { data } = await apiClient.get('/auth/ossinfo')
    const info = OssInfoDecryptor.decryptOssInfoForHttp(
      data.stsToken,
      data.accessKeyId,
      data.accessKeySecret,
    )
    ossClient.value = new OSS({
      region: info.region,
      accessKeyId: info.accessKeyId,
      accessKeySecret: info.accessKeySecret,
      stsToken: info.stsToken,
      bucket: info.bucket,
    })
  } catch (error) {
    console.error('获取 OSS 凭据失败:', error)
    ElMessage.error('获取 OSS 凭据失败，请刷新重试')
  }
}

/** 从后端加载已上传模型列表 */
async function loadUploadedModels() {
  try {
    const data = await ModelFilesService.getModelFilesModelFilesGet({ skip: 0, limit: 100 })
    const list = Array.isArray(data) ? data : (data?.items ?? [])
    uploadedModels.value = list.map((item: any) => ({
      id: item.id ?? item._id ?? '',
      name: item.name,
      room: item.room ?? 'default',
      ossUrl: item.file_path ?? '',
      fileSize: item.file_size ?? 0,
    }))
  } catch (error) {
    console.error('加载已上传模型列表失败:', error)
  }
}

/** 点击"上传模型"按钮，触发文件选择 */
function triggerFileSelect() {
  if (!ossClient.value) {
    ElMessage.warning('OSS 凭据未就绪，请稍后再试')
    return
  }
  fileInput.value?.click()
}

/** 用户选择文件后，添加到上传队列 */
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || !files.length) return

  for (const file of Array.from(files)) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'glb' && ext !== 'gltf') {
      ElMessage.warning(`${file.name} 不是 GLB/GLTF 文件，已跳过`)
      continue
    }

    uploadTasks.value.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      name: file.name,
      room: form.room,
      description: form.description,
      progress: 0,
      status: 'pending',
    })
  }

  // 重置 input，允许重复选择同一文件
  target.value = ''

  // 打开上传进度弹窗
  if (uploadTasks.value.length > 0) {
    uploadDialogVisible.value = true
  }
}

/** 开始上传所有待上传任务 */
async function startUpload() {
  const pending = uploadTasks.value.filter((t) => t.status === 'pending')
  if (!pending.length) {
    ElMessage.warning('没有待上传的文件')
    return
  }

  if (!ossClient.value) {
    ElMessage.error('OSS 客户端未初始化')
    return
  }

  isUploading.value = true

  for (const task of pending) {
    await uploadSingleFile(task)
  }

  isUploading.value = false

  const successCount = pending.filter((t) => t.status === 'success').length
  if (successCount > 0) {
    ElMessage.success(`${successCount} 个模型上传成功`)
  }
}

/** 确认完成：将上传成功的文件保存到后端数据库 */
async function confirmUpload() {
  const successTasks = uploadTasks.value.filter((t) => t.status === 'success')
  if (!successTasks.length) {
    ElMessage.warning('没有可保存的上传记录')
    return
  }

  const modelFiles = successTasks.map((task) => ({
    name: task.name,
    file_type: ModelFileType.gltf,
    room: task.room || 'default',
    file_path: task.ossUrl || '',
    file_size: task.file.size,
    description: task.description || undefined,
  }))

  try {
    await ModelFilesService.createModelFilesModelFilesBatchPost({ body: modelFiles })

    // 添加到已上传列表
    for (const task of successTasks) {
      uploadedModels.value.push({
        id: task.id,
        name: task.name,
        room: task.room || 'default',
        ossUrl: task.ossUrl!,
        fileSize: task.file.size,
      })
    }

    // 清空上传队列并关闭弹窗
    uploadTasks.value = []
    uploadDialogVisible.value = false
    ElMessage.success('模型记录已保存')

    // 刷新已上传列表
    await loadUploadedModels()
  } catch (error) {
    console.error('批量保存模型记录失败:', error)
    ElMessage.error('模型记录保存失败，请重试')
  }
}

/** 关闭弹窗时清理未上传的任务 */
function closeUploadDialog() {
  uploadTasks.value = []
  uploadDialogVisible.value = false
}

/** 上传单个文件到 OSS */
async function uploadSingleFile(task: UploadTask) {
  task.status = 'uploading'
  task.progress = 0

  const ossKey = `StageModels/${task.file.name}`
  task.ossKey = ossKey

  try {
    const result = await ossClient.value!.multipartUpload(ossKey, task.file, {
      progress: (p: number) => {
        task.progress = Math.round(p * 100)
        return Promise.resolve()
      },
    })

    task.ossUrl = ossClient.value!.generateObjectUrl(ossKey)
    task.status = 'success'
    task.progress = 100
  } catch (error: any) {
    task.status = 'error'
    task.errorMsg = error?.message || '上传失败'
    console.error(`上传 ${task.name} 失败:`, error)
  }
}

/** 从队列中移除任务 */
function removeTask(id: string) {
  uploadTasks.value = uploadTasks.value.filter((t) => t.id !== id)
}

/** 查看模型 */
function handleView(model: UploadedModel) {
  ElMessage.info(`查看模型：${model.name}`)
}

/** 编辑模型 */
function handleEdit(model: UploadedModel) {
  ElMessage.info(`编辑模型：${model.name}`)
}

/** 格式化文件大小 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** 格式化进度条状态 */
function progressStatus(status: UploadTask['status']) {
  if (status === 'success') return 'success'
  if (status === 'error') return 'exception'
  return undefined
}
</script>

<template>
  <div class="model-upload-setting">
    <el-container>
      <el-header>
        <div class="header-left">
          <span class="header-title">模型管理</span>
        </div>
        <div class="header-right">
          <el-button type="primary" :icon="UploadFilled" @click="triggerFileSelect">
            上传模型
          </el-button>
        </div>
        <!-- 隐藏的文件选择器 -->
        <input
          ref="fileInput"
          type="file"
          accept=".glb,.gltf"
          multiple
          class="hidden-input"
          @change="handleFileChange"
        />
      </el-header>

      <el-container>
        <!-- 左侧：已上传模型列表 -->
        <el-aside width="33.33%" class="model-aside">
          <div class="aside-header">已上传模型</div>
          <div class="aside-list">
            <el-empty v-if="!uploadedModels.length" description="暂无已上传模型" />
            <div v-for="model in uploadedModels" :key="model.id" class="model-card">
              <div class="model-card-info">
                <div class="model-card-name">{{ model.name }}</div>
                <div class="model-card-meta">
                  <el-tag size="small" type="info">{{ model.room }}</el-tag>
                  <span class="model-size">{{ formatSize(model.fileSize) }}</span>
                </div>
              </div>
              <div class="model-card-actions">
                <el-button :icon="View" size="big" text @click="handleView(model)" />
                <el-button :icon="Edit" size="big" text @click="handleEdit(model)" />
              </div>
            </div>
          </div>
        </el-aside>

        <!-- 右侧：3D 模型预览区域 -->
        <el-main class="model-preview-main">
          <div class="preview-placeholder">
            <el-icon :size="48"><UploadFilled /></el-icon>
            <p>3D 模型预览区域</p>
          </div>
        </el-main>
      </el-container>
    </el-container>

    <!-- 上传进度弹窗 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传模型"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="closeUploadDialog"
    >
      <div class="upload-list">
        <div v-for="task in uploadTasks" :key="task.id" class="upload-item">
          <div class="upload-item-header">
            <span class="upload-item-name">{{ task.name }}</span>
            <div class="upload-item-actions">
              <el-tag v-if="task.status === 'success'" size="small" type="success">已完成</el-tag>
              <el-tag v-else-if="task.status === 'error'" size="small" type="danger">失败</el-tag>
              <el-tag v-else-if="task.status === 'uploading'" size="small" type="warning"
                >上传中</el-tag
              >
              <el-tag v-else size="small">等待中</el-tag>

              <el-button
                v-if="task.status === 'success' || task.status === 'error'"
                :icon="Delete"
                size="small"
                text
                @click="removeTask(task.id)"
              />
            </div>
          </div>
          <el-progress
            :percentage="task.progress"
            :status="progressStatus(task.status)"
            :stroke-width="8"
          />
          <div v-if="task.status === 'error'" class="upload-error">
            {{ task.errorMsg }}
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeUploadDialog">取消</el-button>
          <el-button
            type="primary"
            :loading="isUploading"
            :disabled="!uploadTasks.some((t) => t.status === 'pending')"
            @click="startUpload"
          >
            {{ isUploading ? '上传中...' : '开始上传' }}
          </el-button>
          <el-button
            type="success"
            :disabled="isUploading || !uploadTasks.some((t) => t.status === 'success')"
            @click="confirmUpload"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.model-upload-setting {
  height: 100%;
  width: 100%;
}

.hidden-input {
  display: none;
}

.model-upload-setting > .el-container {
  height: 100%;
}

/* Header */
.model-upload-setting .el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background: #ffffff;
  border-radius: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-input {
  width: 180px;
}

/* Aside */
.model-aside {
  margin: 12px 0 0 0;
  padding: 16px;
  height: calc(100% - 24px);
  background: #ffffff;
  border-radius: 8px;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
}

.aside-header {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.aside-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.model-card {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.model-card:hover {
  background: #f3f4f6;
}

.model-card-info {
  flex: 1;
  min-width: 0;
}

.model-card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.model-card-name {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.model-size {
  font-size: 12px;
  color: #9ca3af;
}

/* Main */
.model-preview-main {
  margin: 12px 0 0 12px;
  border-radius: 8px;
  padding: 20px;
  height: calc(100% - 24px);
  background: #ffffff;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.preview-placeholder p {
  margin-top: 12px;
  font-size: 14px;
}

.upload-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-item {
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.upload-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.upload-item-name {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.upload-error {
  margin-top: 6px;
  font-size: 12px;
  color: #ef4444;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
