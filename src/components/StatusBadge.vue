<script setup lang="ts">
import { computed } from 'vue'
import type { TicketStatus } from '@/types'

const props = defineProps<{
  status: TicketStatus
}>()

const badgeClass = computed(() => {
  switch (props.status) {
    case 'OPEN':
      return 'badge-blue'
    case 'IN_PROGRESS':
      return 'badge-orange'
    case 'RESOLVED':
      return 'badge-green'
    case 'CLOSED':
      return 'badge-gray'
    case 'CANCELLED':
      return 'badge-red'
    default:
      return 'badge-gray'
  }
})

const label = computed(() => {
  switch (props.status) {
    case 'OPEN':
      return 'Open'
    case 'IN_PROGRESS':
      return 'In Progress'
    case 'RESOLVED':
      return 'Resolved'
    case 'CLOSED':
      return 'Closed'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return props.status
  }
})
</script>

<template>
  <span class="badge" :class="badgeClass">{{ label }}</span>
</template>

