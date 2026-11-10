<script setup lang="ts">
import { computed } from 'vue'
import type { Role } from '@/Data/User'

const props = defineProps<{
  role: Role
}>()

const badgeClass = computed(() => {
  if (props.role === 'ADMIN') return 'badge-purple'
  if (props.role === 'TECHNICIAN') return 'badge-blue'
  return 'badge-gray'
})
</script>
<style scoped>
/* src/assets/main.css */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-gray   { background-color: #f1f5f9; color: #475569; }
.badge-blue   { background-color: #dbeafe; color: #1d4ed8; }
.badge-purple { background-color: #f3e8ff; color: #7e22ce; }
.badge-orange { background-color: #ffedd5; color: #c2410c; }
.badge-green  { background-color: #dcfce7; color: #15803d; }
.badge-red    { background-color: #fee2e2; color: #b91c1c; }
.badge-yellow { background-color: #fef9c3; color: #a16207; }
</style>
<template>
  <span class="badge" :class="badgeClass">{{ role }}</span>
</template>