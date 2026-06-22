<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

// 获取 store 实例
const counter = useCounterStore()

// 解构响应式数据（必须用 storeToRefs，否则失去响应性）
const { count, double } = storeToRefs(counter)

// actions 可以直接解构（函数不需要响应性）
const { increment, decrement, reset } = counter
</script>

<template>
  <div class="counter-demo">
    <h3>Pinia 计数器示例</h3>
    <p>count: {{ count }} | double: {{ double }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
    <button @click="reset">重置</button>
  </div>
</template>

<style scoped>
.counter-demo {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
button {
  margin: 0 4px;
  padding: 4px 12px;
  cursor: pointer;
}
</style>
