<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="toast-container" aria-live="polite">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast-item"
      :class="toast.type === 'error' ? 'toast-error' : 'toast-success'"
    >
      <span class="toast-message">{{ toast.message }}</span>
      <button type="button" class="toast-close" @click="removeToast(toast.id)">&times;</button>
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 360px;
  width: calc(100vw - 3rem);
}

.toast-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;
  font-weight: 500;
  background: #ffffff;
  border-left: 4px solid #2563eb;
}

.toast-success {
  border-left-color: #16a34a;
  color: #0f172a;
}

.toast-error {
  border-left-color: #dc2626;
  color: #dc2626;
}

.toast-message {
  flex: 1;
}

.toast-close {
  background: transparent;
  border: none;
  font-size: 1.125rem;
  color: #64748b;
  cursor: pointer;
  padding: 0 0.25rem;
}
</style>