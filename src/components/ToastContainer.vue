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
      <span class="toast-text">{{ toast.message }}</span>
      <button type="button" class="toast-close" @click="removeToast(toast.id)" aria-label="Close">
        &times;
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 360px;
  width: calc(100vw - 2.5rem);
}

.toast-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--surface);
  border-left: 4px solid var(--primary);
}

.toast-success {
  border-left-color: var(--success);
  background: #ffffff;
  color: var(--text);
}

.toast-error {
  border-left-color: var(--danger);
  background: #ffffff;
  color: var(--danger);
}

.toast-text {
  flex: 1;
}

.toast-close {
  background: transparent;
  border: none;
  font-size: 1.125rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
}
</style>

