import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 计数器 Store —— 最简示例
 * 使用 Composition API 风格（setup store）
 */
export const useCounterStore = defineStore('counter', () => {
  // ─── state ────────────────────────────────
  const count = ref(0)

  // ─── getters（相当于 computed）────────────
  const double = computed(() => count.value * 2)

  // ─── actions ──────────────────────────────
  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  return { count, double, increment, decrement, reset }
})
