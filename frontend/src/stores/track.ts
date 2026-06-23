import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { StageMotionTrack } from '@/models/StageMotionTrack'

/**
 * 舞台轨道 Store
 * 演示如何在 Pinia 中管理业务数据
 */
export const useTrackStore = defineStore('track', () => {
  // ─── state ────────────────────────────────
  const tracks = ref<StageMotionTrack[]>([])
  const editingIndex = ref(0)

  // ─── getters ──────────────────────────────
  const currentTrack = computed(() => tracks.value[editingIndex.value])

  const trackCount = computed(() => tracks.value.length)

  const validTracks = computed(() => tracks.value.filter((t) => t.elementId?.trim() !== ''))

  // ─── actions ──────────────────────────────
  function addTrack(track: StageMotionTrack) {
    tracks.value.push(track)
    editingIndex.value = tracks.value.length - 1
  }

  function removeTrack(index: number) {
    if (tracks.value.length <= 1) return
    tracks.value.splice(index, 1)
    if (editingIndex.value >= tracks.value.length) {
      editingIndex.value = tracks.value.length - 1
    }
  }

  function selectTrack(index: number) {
    editingIndex.value = index
  }

  function clearAll() {
    tracks.value = []
    editingIndex.value = 0
  }

  return {
    tracks,
    editingIndex,
    currentTrack,
    trackCount,
    validTracks,
    addTrack,
    removeTrack,
    selectTrack,
    clearAll,
  }
})
