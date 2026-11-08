<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { showToast } = useToast()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const registeredSuccess = computed(() => route.query.registered === '1')

async function handleSubmit() {
  errorMessage.value = ''
  if (!username.value.trim() || !password.value) {
    errorMessage.value = 'Please enter both username and password.'
    return
  }

  loading.value = true
  try {
    await auth.login(username.value.trim(), password.value)
    showToast('Logged in successfully', 'success')
    router.push(auth.roleHome)
  } catch (err: any) {
    const msg = err?.message || 'Invalid username or password.'
    errorMessage.value = msg
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
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to manage your support tickets</p>
      </div>

      <div v-if="registeredSuccess" class="alert-success">
        Account created successfully. Please log in below.
      </div>

      <div v-if="errorMessage" class="alert-error">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleSubmit" novalidate>
        <div class="form-group">
          <label for="login-username" class="form-label">Username</label>
          <input
            id="login-username"
            v-model="username"
            type="text"
            class="form-input"
            autocomplete="username"
            placeholder="Enter your username"
            required
          />
        </div>

        <div class="form-group">
          <label for="login-password" class="form-label">Password</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            class="form-input"
            autocomplete="current-password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary auth-submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Log in' }}
        </button>
      </form>

      <p class="auth-footer">
        Don't have an account?
        <RouterLink to="/register">Create an account</RouterLink>
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

.alert-success {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--success-light);
  color: var(--success);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1rem;
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

