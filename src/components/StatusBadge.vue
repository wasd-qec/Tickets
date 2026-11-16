<script setup lang="ts">
import type { TicketStatus } from '@/Data/Ticket'
import { computed } from 'vue'

const props = defineProps<{
  status: TicketStatus
}>()

const statusClass = computed(() => {
  switch (props.status) {
    case 'OPEN':
      return 'stage-blue'
    case 'IN_PROGRESS':
      return 'stage-orange'
    case 'RESOLVED':
      return 'stage-green'
    case 'CLOSED':
      return 'stage-gray'
    case 'CANCELLED':
      return 'stage-red'
    default:
      return 'stage-gray'
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
  <span class="stage-badge" :class="statusClass">{{ label }}</span>
</template>

<style scoped>
.stage-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.stage-blue {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.stage-orange {
  background-color: #ffedd5;
  color: #c2410c;
}

.stage-green {
  background-color: #dcfce7;
  color: #15803d;
}

.stage-gray {
  background-color: #f1f5f9;
  color: #475569;
}

.stage-red {
  background-color: #fee2e2;
  color: #b91c1c;
}
</style>
