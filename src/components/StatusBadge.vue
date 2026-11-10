<script setup lang="ts">
import type { Stage } from '@/Data/Ticket'
import { computed } from 'vue'

const props = defineProps<{
  Stage: Stage
}>()

const statusClass = computed(() => {
  if (props.Stage === 'Opened') return 'stage-blue'
  if (props.Stage === 'In Progress') return 'stage-orange'
  if (props.Stage === 'Resolved') return 'stage-green'
  if (props.Stage === 'Closed') return 'stage-gray'
  if (props.Stage === 'Cancelled') return 'stage-red'
  return 'stage-gray'
})
</script>

<template>
  <span class="stage-badge" :class="statusClass">{{ Stage }}</span>
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
