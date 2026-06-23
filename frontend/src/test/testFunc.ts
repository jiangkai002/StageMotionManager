import { ref } from 'vue'
export function useCount() {
  const count = ref(0)
  const log = () => {
    console.log(count)
  }
  return { count, log }
}
