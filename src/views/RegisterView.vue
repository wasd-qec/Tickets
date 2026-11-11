<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { mockUsers } from '@/Data/MockData'

const router = useRouter()
const { showToast } = useToast()

const username = ref('')
const password = ref('')
const usernameError = ref('')
const passwordError = ref('')
const serverError = ref('')

function handleRegister() {
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

  const duplicate = mockUsers.some(
    (u) => u.username.toLowerCase() === trimmed.toLowerCase(),
  )
  if (duplicate) {
    serverError.value = 'Username already exists.'
    showToast('Username already exists', 'error')
    return
  }

  mockUsers.push({
    id: Date.now(),
    username: trimmed,
    role: 'CLIENT',
    createdAt: new Date().toISOString(),
  })

  showToast('Account registered successfully. Please log in.', 'success')
  router.push({ path: '/login', query: { registered: '1' } })
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

        <button type="submit" class="btn-submit">Register</button>
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
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.06);
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
  font-size: 1.1rem;
  color: #0f172a;
  text-decoration: none;
  margin-bottom: 1rem;
}

.brand-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  background: #2563eb;
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
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.auth-subtitle {
  color: #64748b;
  font-size: 0.875rem;
}

.alert-error {
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #fef2f2;
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 500;
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
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
}

.form-group input {
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
}

.form-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.field-error {
  color: #dc2626;
  font-size: 0.8rem;
}

.btn-submit {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 8px;
  background-color: #2563eb;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-submit:hover {
  background-color: #1d4ed8;
}

.auth-footer {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.875rem;
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
