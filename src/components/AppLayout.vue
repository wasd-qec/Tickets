<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import RoleBadge from '@/components/RoleBadge.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

function handleLogout() {
  auth.clearUser()
  router.push('/login')
}

// Current section title for breadcrumb in top nav
const pageTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/tickets/new')) return 'New Ticket'
  if (path.startsWith('/tickets/')) return 'Ticket Details'
  if (path.startsWith('/tickets')) return 'My Tickets'
  if (path.startsWith('/queue')) return 'Ticket Queue'
  if (path.startsWith('/claimed_ticket')) return 'My Claimed Tickets'
  if (path.startsWith('/categories')) return 'Categories'
  if (path.startsWith('/user')) return 'Users'
  return ''
})

interface NavItem {
  label: string
  to: string
}

const navLinks = computed<NavItem[]>(() => {
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
  <div class="app-layout">
    <!-- Top Navbar -->
    <header class="top-navbar">
      <div class="nav-left">
        <RouterLink :to="auth.homeRoute" class="brand-link">
          <span class="brand-title">HelpDesk</span>
        </RouterLink>

        <span v-if="pageTitle" class="breadcrumb-divider">|</span>
        <span v-if="pageTitle" class="breadcrumb-current">{{ pageTitle }}</span>
      </div>

      <div class="nav-right">
        <!-- User identity pill -->
        <div class="user-pill">
          <span class="user-name">{{ auth.currentUser?.username }}</span>
          <RoleBadge v-if="auth.currentUser" :role="auth.currentUser.role" />
        </div>

        <!-- Logout button -->
        <button type="button" class="logout-btn" @click="handleLogout">
          Logout
        </button>
      </div>
    </header>

    <!-- Shell Body -->
    <div class="layout-body">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-nav">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="nav-item"
            :class="{ active: route.path === link.to || (link.to !== '/tickets' && route.path.startsWith(link.to)) }"
          >
            <span class="nav-label">{{ link.label }}</span>
          </RouterLink>
        </div>
      </aside>

      <!-- Main Content Slot -->
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Top-level Layout Frame */
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #0f172a;
}

/* 1. Top Navbar */
.top-navbar {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.brand-link {
  text-decoration: none;
  color: inherit;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #2563eb;
}

.breadcrumb-divider {
  color: #cbd5e1;
  font-size: 1.1rem;
  font-weight: 300;
}

.breadcrumb-current {
  font-size: 0.95rem;
  font-weight: 500;
  color: #475569;
}

/* Top Navbar Right */
.nav-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.logout-btn {
  padding: 0.45rem 0.85rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.logout-btn:hover {
  background-color: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
}

/* 2. Layout Body (Sidebar + Content) */
.layout-body {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 64px);
}

/* Left Sidebar */
.sidebar {
  width: 220px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 1.25rem 0.875rem;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.65rem 0.875rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  transition: all 0.15s ease-in-out;
}

.nav-item:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.nav-item.active {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}

/* 3. Main Content Container */
.main-content {
  flex: 1;
  background-color: #f8fafc;
  overflow-y: auto;
}
</style>
