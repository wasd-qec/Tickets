<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { mockUsers } from '@/Data/MockData'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { showToast } = useToast()

const registeredSuccess = computed(() => route.query.registered === '1')

function handleLogin() {
  errorMessage.value = ''
  if (!username.value.trim() || !password.value) {
    errorMessage.value = 'Please enter both username and password.'
    return
  }

  const trimmed = username.value.trim().toLowerCase()
  const foundUser = mockUsers.find((u) => u.username.toLowerCase() === trimmed)

  if (!foundUser) {
    errorMessage.value = 'User not found. Try: alice_client, charlie_tech, or admin_user.'
    showToast('Invalid username or password', 'error')
    return
  }

  auth.setUser(foundUser)
  showToast(`Welcome back, ${foundUser.username}!`, 'success')
  router.push(auth.homeRoute)
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
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to manage your support tickets</p>
      </div>

      <div v-if="registeredSuccess" class="alert-success">
        Account created successfully. Please log in below.
      </div>

      <div v-if="errorMessage" class="alert-error">
        {{ errorMessage }}
      </div>

      <form class="auth-form" @submit.prevent="handleLogin" novalidate>
        <div class="form-group">
          <label for="login-username">Username</label>
          <input
            id="login-username"
            v-model="username"
            type="text"
            placeholder="alice_client, charlie_tech, or admin_user"
            required
          />
        </div>

        <div class="form-group">
          <label for="login-password">Password</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" class="btn-submit">Log in</button>
      </form>

      <p class="auth-footer">
        Don't have an account?
        <RouterLink to="/Register">Create an account</RouterLink>
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

.alert-success {
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #f0fdf4;
  color: #16a34a;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1rem;
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
  color: #64748b;
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
