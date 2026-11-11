<script setup lang="ts">
import {ref} from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { mockUsers } from '@/Data/MockData'

  const username = ref("")
  const password = ref("")
  const router = useRouter()
  const auth = useAuthStore()
  function handleLogin() {
  // 1. Look up user in mock data
  const trimmed = username.value.trim().toLowerCase()
  const foundUser = mockUsers.find((u) => u.username.toLowerCase() === trimmed)
  // 2. Validate
  if (!foundUser) {
    alert('User not found! Try: alice_client, charlie_tech, or admin_user')
    return
  }
  // 3. Save to store & navigate to role home (/tickets or /queue)
  auth.setUser(foundUser)
  router.push(auth.homeRoute)
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
