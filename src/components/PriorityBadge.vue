<script setup lang="ts">
import type { Priority } from '@/Data/Ticket'
import { computed } from 'vue'

const props = defineProps<{
  priority: Priority
}>()

const priorityClass = computed(() => {
  if (props.priority === 'High') return 'priority-red'
  if (props.priority === 'Medium') return 'priority-yellow'
  if (props.priority === 'Low') return 'priority-gray'
  return 'priority-gray'
})
</script>

<template>
  <span class="badge" :class="priorityClass">{{ priority }}</span>
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

