# Confirm Modal Component (`ConfirmModal.vue`)

This document explains the reusable confirmation modal pattern, its props and emits, and how to use it inside any view component.

---

## 1. Component Props & Emits

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | **Required** | Controls visibility (`v-if="open"`). |
| `title` | `string` | **Required** | Modal header text (e.g. `"Cancel Ticket"`). |
| `message` | `string` | **Required** | Body description of the action. |
| `confirmLabel` | `string` | `"Confirm"` | Text on the confirmation button. |
| `danger` | `boolean` | `false` | When `true`, styles the confirm button red (`.btn-danger`). |

### Emits
| Event | Description |
| :--- | :--- |
| `@confirm` | Fired when the user clicks the confirm button. |
| `@cancel` | Fired when the user clicks Cancel or clicks the dark backdrop outside the box. |

---

## 2. How to Use in a Page Component

### Step 1: Import the Component and Set Up State
Inside your view's `<script setup lang="ts">`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

// Reactive state controlling whether the modal is visible
const showCancelModal = ref(false)

function onCancelConfirmed() {
  console.log('Action confirmed!')
  // Perform your action (e.g., call API, update ticket status)
  showCancelModal.value = false
}
</script>
```

### Step 2: Add the Modal to the Template
Place the `<ConfirmModal />` anywhere inside your `<template>`:

```vue
<template>
  <div>
    <!-- Button that opens the modal -->
    <button @click="showCancelModal = true">
      Cancel Ticket
    </button>

    <!-- Confirmation Modal -->
    <ConfirmModal
      :open="showCancelModal"
      title="Cancel Ticket"
      message="Are you sure you want to cancel this ticket? This action cannot be undone."
      confirm-label="Yes, Cancel"
      :danger="true"
      @confirm="onCancelConfirmed"
      @cancel="showCancelModal = false"
    />
  </div>
</template>
```

---

## 3. Key Features
- **Backdrop click-to-dismiss**: Clicking the darkened background outside the modal triggers `@cancel` via `@click.self="emit('cancel')"`.
- **Dynamic button styling**: Passing `:danger="true"` makes the primary action red instead of blue.

