<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUser } from '@/services/api'

const username = ref("")
const password = ref("")
const router = useRouter()

async function SubmitRegistration() {
  const user = username.value.trim()
  const pass = password.value

  if (!user || !pass) {
    alert('Please enter both username and password.')
    return
  }
  if (user.length < 3) {
    alert('Username must be at least 3 characters long.')
    return
  }
  if (pass.length < 6) {
    alert('Password must be at least 6 characters long.')
    return
  }

  try {
    await createUser({
      username: user,
      password: pass,
      role: 'CLIENT',
    })
    
    alert('Registration successful! Please log in.')
    router.push('/login')
  } catch (error) {
    alert('Failed to register. Is the server running?')
  }
}
</script>
<template>
  <div>RegisterView</div>
  <p>Username</p>
  <input v-model="username" type="text" placeholder="Enter your username">
  <p>Password</p>
  <input v-model="password" type="password" placeholder="Enter your password">
  <button type="button" @click="SubmitRegistration">Register</button>
</template>
