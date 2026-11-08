<script setup lang="ts">
import { computed } from 'vue'
import type { TicketPriority } from '@/types'

const props = defineProps<{
  priority: TicketPriority
}>()

const badgeClass = computed(() => {
  switch (props.priority) {
    case 'HIGH':
      return 'badge-red'
    case 'MEDIUM':
      return 'badge-yellow'
    case 'LOW':
    default:
      return 'badge-gray'
  }
})

const label = computed(() => {
  switch (props.priority) {
    case 'HIGH':
      return 'High'
    case 'MEDIUM':
      return 'Medium'
    case 'LOW':
      return 'Low'
    default:
      return props.priority
  }
})
</script>

<template>
  <span class="badge" :class="badgeClass">{{ label }}</span>
</template>

