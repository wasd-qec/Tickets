<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const router = useRouter()
const { showToast } = useToast()

const username = ref('')
const password = ref('')
const usernameError = ref('')
const passwordError = ref('')
const serverError = ref('')
const loading = ref(false)

function validate(): boolean {
  usernameError.value = ''
  passwordError.value = ''
  serverError.value = ''

  const trimmed = username.value.trim()
  if (trimmed.length < 3 || !/^[a-zA-Z0-9]+$/.test(trimmed)) {
    usernameError.value = 'Username must be alphanumeric and at least 3 characters.'
  }

  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters.'
  }

  return !usernameError.value && !passwordError.value
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  try {
    await auth.register(username.value.trim(), password.value)
    showToast('Account registered successfully. Please log in.', 'success')
    router.push({ path: '/login', query: { registered: '1' } })
  } catch (err: any) {
    const msg = err?.message || 'Registration failed.'
    serverError.value = msg
    showToast(msg, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <RouterLink to="/" class="brand-logo">
          <span class="brand-icon">HD</span>
          <span class="brand-text">HelpDesk</span>
        </RouterLink>
        <h1 class="auth-title">Create your account</h1>
        <p class="auth-subtitle">Report and track IT support requests</p>
      </div>

      <div v-if="serverError" class="alert-error">
        {{ serverError }}
      </div>

      <form @submit.prevent="handleSubmit" novalidate>
        <div class="form-group">
          <label for="register-username" class="form-label">Username</label>
          <input
            id="register-username"
            v-model="username"
            type="text"
            class="form-input"
            autocomplete="username"
            placeholder="Alphanumeric, min 3 characters"
            required
          />
          <span v-if="usernameError" class="form-error">{{ usernameError }}</span>
        </div>

        <div class="form-group">
          <label for="register-password" class="form-label">Password</label>
          <input
            id="register-password"
            v-model="password"
            type="password"
            class="form-input"
            autocomplete="new-password"
            placeholder="Minimum 6 characters"
            required
          />
          <span v-if="passwordError" class="form-error">{{ passwordError }}</span>
        </div>

        <button type="submit" class="btn btn-primary auth-submit" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <p class="auth-footer">
        <RouterLink to="/login">Back to login</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--text);
  margin-bottom: 1rem;
  text-decoration: none;
}

.brand-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  background: var(--primary);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.auth-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.auth-subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.alert-error {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--danger-light);
  color: var(--danger);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.auth-submit {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.65rem 1rem;
}

.auth-footer {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-muted);
}
</style>

