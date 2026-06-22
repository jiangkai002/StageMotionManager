<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { useCount } from '../test/testFunc.ts'

const { count, log } = useCount()
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
