<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="landing-container">
    <div class="button-group">
      <RouterLink to="/login" class="btn btn-login">
        Log In
      </RouterLink>
      <RouterLink to="/Register" class="btn btn-register">
        Register
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.landing-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: 1px solid transparent;
}

.btn-login {
  background-color: #ffffff;
  color: #0f172a;
  border-color: #cbd5e1;
}

.btn-login:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

.btn-register {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-register:hover {
  background-color: #1d4ed8;
}
</style>
