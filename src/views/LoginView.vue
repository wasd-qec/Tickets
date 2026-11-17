<script setup lang="ts">
import {ref} from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getUsers } from '@/services/api'

  const username = ref("")
  const password = ref("")
  const router = useRouter()
  const auth = useAuthStore()
 async function handleLogin() {
  try {
    const users = await getUsers() // Fetches from db.json (via json-server)
    const trimmed = username.value.trim()
    const foundUser = users.find(u => u.username === trimmed)
    if (!foundUser) {
      alert('User not found! Try: client, tech, or admin')
      return
    }
    // Save user to Pinia auth store
    auth.setUser(foundUser)
    // Redirect to their role dashboard (/tickets for client, /queue for tech/admin)
    router.push(auth.homeRoute)
  } catch (error) {
    alert('Failed to connect to the server. Is json-server running?')
  }
}
</script> 
<template>
  <div>LoginView</div>
  <h2>
    Login
  </h2>
  <p class="title">username</p>
  <input v-model="username" type="text" placeholder="Enter Username">
  <p class="title">Password</p>
  <input v-model="password" type="password" placeholder="Enter your Password">
  <button type="button" @click="handleLogin">Login</button>

</template>
