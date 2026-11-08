<script setup lang="ts">
import { computed } from 'vue'
import type { Role } from '@/types'

const props = defineProps<{
  role: Role
}>()

const badgeClass = computed(() => {
  switch (props.role) {
    case 'ADMIN':
      return 'badge-purple'
    case 'TECHNICIAN':
      return 'badge-blue'
    default:
      return 'badge-gray'
  }
})

const label = computed(() => {
  switch (props.role) {
    case 'ADMIN':
      return 'Admin'
    case 'TECHNICIAN':
      return 'Technician'
    default:
      return 'Client'
  }
})
</script>

<template>
  <span class="badge" :class="badgeClass">{{ label }}</span>
</template>

