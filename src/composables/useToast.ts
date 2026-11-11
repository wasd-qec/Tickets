import { ref } from 'vue'

export interface ToastItem {
    id: number
    message: string
    type: 'success' | 'error'
}

const toasts = ref<ToastItem[]>([])
let nextId = 1

export function useToast() {
    function showToast(message: string, type: 'success' | 'error' = 'success') {
        const id = nextId++
        toasts.value.push({ id, message, type })

        // Auto-remove after 3.5 seconds
        setTimeout(() => {
            removeToast(id)
        }, 3500)
    }

    function removeToast(id: number) {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    return { toasts, showToast, removeToast }
}