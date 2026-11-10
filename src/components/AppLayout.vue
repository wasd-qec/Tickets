<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const navLinks = computed(() => {
  const role = auth.currentUser?.role

  if (role === 'CLIENT') {
    return [
      { label: 'My Tickets', to: '/tickets' },
      { label: 'New Ticket', to: '/tickets/new' },
    ]
  }

  if (role === 'TECHNICIAN') {
    return [
      { label: 'Ticket Queue', to: '/queue' },
      { label: 'My Claimed Tickets', to: '/claimed_ticket' },
    ]
  }

  if (role === 'ADMIN') {
    return [
      { label: 'Ticket Queue', to: '/queue' },
      { label: 'Categories', to: '/categories' },
      { label: 'Users', to: '/user' },
    ]
  }

  return []
})
</script>

<template>
  <div class="layout">
    <!-- 1. Top Navbar -->
    <header class="navbar">
      <RouterLink :to="auth.homeRoute" class="logo">HelpDesk</RouterLink>
      <div class="user-info">
        <span class="username">{{ auth.currentUser?.username }}</span>
        <button class="logout-btn" @click="auth.clearUser()">Logout</button>
      </div>
    </header>

    <div class="body">
      <!-- 2. Left Sidebar -->
      <aside class="sidebar">
        //the for loop is in the tag RouterLink so it'll print the link label one by one
        <RouterLink
          v-for="link in navLinks"  
          :key="link.to"
          :to="link.to"
          class="nav-link"
        >
          {{ link.label }}
        </RouterLink>
      </aside>

      <!-- 3. Page Content -->
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>