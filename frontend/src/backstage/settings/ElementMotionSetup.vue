<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface MotionItem {
  id: number
  elementName: string
  axis: 'x' | 'y' | 'z'
  distance: number
  duration: number
  enabled: boolean
}

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const motions = ref<MotionItem[]>([
  { id: 1, elementName: '乐池升降机', axis: 'y', distance: 3.2, duration: 4, enabled: true },
  { id: 2, elementName: '乐池车台', axis: 'x', distance: 8, duration: 6, enabled: true },
])

const form = reactive({
  elementName: '',
  axis: 'y' as MotionItem['axis'],
  distance: 1,
  duration: 3,
  enabled: true,
})

function openCreateDialog() {
  editingId.value = null
  Object.assign(form, {
    elementName: '',
    axis: 'y',
    distance: 1,
    duration: 3,
    enabled: true,
  })
  dialogVisible.value = true
}

function openEditDialog(row: MotionItem) {
  editingId.value = row.id
  Object.assign(form, row)
  dialogVisible.value = true
}

function saveMotion() {
  if (!form.elementName.trim()) {
    ElMessage.warning('请输入元素名称')
    return
  }

  if (editingId.value) {
    const target = motions.value.find((item) => item.id === editingId.value)
    if (target) Object.assign(target, form)
  } else {
    motions.value.push({
      id: Date.now(),
      elementName: form.elementName,
      axis: form.axis,
      distance: form.distance,
      duration: form.duration,
      enabled: form.enabled,
    })
  }

  dialogVisible.value = false
  ElMessage.success('运动配置已保存')
}

async function removeMotion(row: MotionItem) {
  await ElMessageBox.confirm(`确定删除「${row.elementName}」的运动配置吗？`, '删除确认', {
    type: 'warning',
  })
  motions.value = motions.value.filter((item) => item.id !== row.id)
  ElMessage.success('已删除')
}
</script>

<template>
  <section class="settings-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <h3>元素运动配置</h3>
            <p>配置舞台元素的运动方向、位移和时长。</p>
          </div>
          <el-button type="primary" @click="openCreateDialog">新增配置</el-button>
        </div>
      </template>

      <el-table :data="motions" stripe>
        <el-table-column prop="elementName" label="元素名称" min-width="180" />
        <el-table-column prop="axis" label="运动轴" width="110" />
        <el-table-column prop="distance" label="位移" width="120">
          <template #default="{ row }">{{ row.distance }} m</template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="120">
          <template #default="{ row }">{{ row.duration }} s</template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="removeMotion(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑配置' : '新增配置'" width="520px">
      <el-form :model="form" label-width="92px">
        <el-form-item label="元素名称">
          <el-input v-model="form.elementName" placeholder="例如：乐池升降机" />
        </el-form-item>
        <el-form-item label="运动轴">
          <el-radio-group v-model="form.axis">
            <el-radio-button label="x">X</el-radio-button>
            <el-radio-button label="y">Y</el-radio-button>
            <el-radio-button label="z">Z</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="位移">
          <el-input-number v-model="form.distance" :min="-100" :max="100" :step="0.1" />
        </el-form-item>
        <el-form-item label="时长">
          <el-input-number v-model="form.duration" :min="0.1" :max="120" :step="0.5" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMotion">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
.settings-page {
  max-width: 1080px;
}

.card-header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
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

@media (max-width: 640px) {
  .card-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
