<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { api } from '@/services/api'

const router = useRouter()
const { showToast } = useToast()

const username = ref('')
const password = ref('')
const usernameError = ref('')
const passwordError = ref('')
const serverError = ref('')
const isLoading = ref(false)

async function handleRegister() {
  usernameError.value = ''
  passwordError.value = ''
  serverError.value = ''

  const trimmed = username.value.trim()
  if (trimmed.length < 3 || !/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    usernameError.value = 'Username must be alphanumeric and at least 3 characters.'
  }

  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters.'
  }

  if (usernameError.value || passwordError.value) return

  isLoading.value = true
  try {
    const users = await api.getUsers()
    const duplicate = users.some(
      (u) => u.username.toLowerCase() === trimmed.toLowerCase(),
    )
    if (duplicate) {
      serverError.value = 'Username already exists.'
      showToast('Username already exists', 'error')
      return
    }

    const newUser = {
      id: Date.now(),
      username: trimmed,
      role: 'CLIENT' as const,
      createdAt: new Date().toISOString(),
    }

    await api.createUser(newUser)

    showToast('Account registered successfully. Please log in.', 'success')
    router.push({ path: '/login', query: { registered: '1' } })
  } catch (err) {
    serverError.value = 'Failed to create account. Please ensure mock API server is running.'
    showToast('Registration failed', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <RouterLink to="/" class="brand-logo">
          <span class="brand-icon">HD</span>
          <span>HelpDesk</span>
        </RouterLink>
        <h1 class="auth-title">Create your account</h1>
        <p class="auth-subtitle">Report and track IT support requests</p>
      </div>

      <div v-if="serverError" class="alert-error">
        {{ serverError }}
      </div>

      <form class="auth-form" @submit.prevent="handleRegister" novalidate>
        <div class="form-group">
          <label for="reg-username">Username</label>
          <input
            id="reg-username"
            v-model="username"
            type="text"
            placeholder="Alphanumeric, min 3 characters"
            required
          />
          <span v-if="usernameError" class="field-error">{{ usernameError }}</span>
        </div>

        <div class="form-group">
          <label for="reg-password">Password</label>
          <input
            id="reg-password"
            v-model="password"
            type="password"
            placeholder="Minimum 6 characters"
            required
          />
          <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
        </div>

        <button type="submit" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? 'Registering...' : 'Register' }}
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
  background-color: #f8fafc;
  padding: 1.5rem;
}

.auth-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  max-width: 420px;
  width: 100%;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.auth-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: #0f172a;
  text-decoration: none;
  margin-bottom: 1rem;
}

.brand-icon {
  background: #2563eb;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.auth-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.auth-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 0.65rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.form-group input {
  padding: 0.6rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
}

.form-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.field-error {
  color: #dc2626;
  font-size: 0.75rem;
}

.btn-submit {
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.15s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 1.5rem;
  margin-bottom: 0;
}

.auth-footer a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
