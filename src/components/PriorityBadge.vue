<script setup lang="ts">
import type { TicketPriority } from '@/Data/Ticket'
import { computed } from 'vue'

const props = defineProps<{
  priority: TicketPriority
}>()

const priorityClass = computed(() => {
  switch (props.priority) {
    case 'HIGH':
      return 'priority-red'
    case 'MEDIUM':
      return 'priority-yellow'
    case 'LOW':
      return 'priority-gray'
    default:
      return 'priority-gray'
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
  <span class="badge" :class="priorityClass">{{ label }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.priority-red {
  background-color: #fee2e2;
  color: #b91c1c;
}

.priority-yellow {
  background-color: #fef9c3;
  color: #a16207;
}

.priority-gray {
  background-color: #f1f5f9;
  color: #475569;
}
</style>
