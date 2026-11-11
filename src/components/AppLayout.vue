<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import RoleBadge from '@/components/RoleBadge.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)

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

function handleLogout() {
  auth.clearUser()
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <header class="navbar">
      <div class="navbar-left">
        <button
          type="button"
          class="hamburger-btn"
          aria-label="Toggle menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          &#9776;
        </button>
        <RouterLink :to="auth.homeRoute" class="logo">
          <span class="logo-icon">HD</span>
          <span>HelpDesk</span>
        </RouterLink>
      </div>

      <div v-if="auth.currentUser" class="user-info">
        <span class="username">{{ auth.currentUser.username }}</span>
        <RoleBadge :role="auth.currentUser.role" />
        <button type="button" class="logout-btn" @click="handleLogout">Logout</button>
      </div>
    </header>

    <div class="body">
      <div
        v-if="mobileMenuOpen"
        class="sidebar-backdrop"
        @click="mobileMenuOpen = false"
      ></div>

      <aside class="sidebar" :class="{ open: mobileMenuOpen }">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ active: route.path === link.to }"
        >
          {{ link.label }}
        </RouterLink>
      </aside>

      <main class="content">
        <div class="content-inner">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

.navbar {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  position: sticky;
  top: 0;
  z-index: 40;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.hamburger-btn {
  display: none;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #0f172a;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #0f172a;
  text-decoration: none;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  background-color: #2563eb;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.username {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.logout-btn {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  color: #0f172a;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #f1f5f9;
}

.body {
  display: flex;
  flex: 1;
  position: relative;
}

.sidebar {
  width: 230px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-shrink: 0;
}

.nav-link {
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}

.nav-link:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.nav-link.active {
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.content {
  flex: 1;
  min-width: 0;
  padding: 1.5rem;
}

.content-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 768px) {
  .hamburger-btn {
    display: inline-flex;
  }

  .username {
    display: none;
  }

  .sidebar {
    position: fixed;
    top: 60px;
    bottom: 0;
    left: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 60px 0 0 0;
    background-color: rgba(15, 23, 42, 0.35);
    z-index: 45;
  }

  .content {
    padding: 1rem;
  }
}
</style>
