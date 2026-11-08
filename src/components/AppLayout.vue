<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import RoleBadge from './RoleBadge.vue'

const auth = useAuthStore()
const route = useRoute()
const mobileMenuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)

const navItems = computed(() => {
  const role = auth.user?.role
  if (role === 'CLIENT') {
    return [
      { label: 'My Tickets', to: '/tickets' },
      { label: 'New Ticket', to: '/tickets/new' },
    ]
  }
  if (role === 'TECHNICIAN') {
    return [
      { label: 'Ticket Queue', to: '/queue' },
      { label: 'My Tickets', to: '/my-claims' },
    ]
  }
  if (role === 'ADMIN') {
    return [
      { label: 'Ticket Queue', to: '/queue' },
      { label: 'Categories', to: '/categories' },
      { label: 'Users', to: '/users' },
    ]
  }
  return []
})

const pageTitle = computed(() => (route.meta.title as string) || 'HelpDesk')
</script>

<template>
  <div class="layout-shell">
    <header class="top-navbar">
      <div class="navbar-left">
        <button
          type="button"
          class="hamburger-btn"
          aria-label="Toggle navigation"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round" />
          </svg>
        </button>
        <RouterLink :to="auth.roleHome" class="brand-logo">
          <span class="brand-icon">HD</span>
          <span class="brand-text">HelpDesk</span>
        </RouterLink>
        <span class="navbar-divider"></span>
        <h1 class="navbar-page-title">{{ pageTitle }}</h1>
      </div>

      <div v-if="auth.user" class="navbar-user">
        <span class="navbar-username">{{ auth.user.username }}</span>
        <RoleBadge :role="auth.user.role" />
        <button type="button" class="btn btn-secondary btn-sm" @click="auth.logout()">
          Logout
        </button>
      </div>
    </header>

    <div class="layout-body">
      <div
        v-if="mobileMenuOpen"
        class="sidebar-backdrop"
        @click="mobileMenuOpen = false"
      ></div>

      <aside class="left-sidebar" :class="{ open: mobileMenuOpen }">
        <nav class="sidebar-nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="sidebar-link"
            :class="{ active: route.path === item.to }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <main class="main-content">
        <div class="content-container">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-navbar {
  height: 60px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
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
  color: var(--text);
  cursor: pointer;
  padding: 0.25rem;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text);
  text-decoration: none;
}

.brand-logo:hover {
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

.navbar-divider {
  width: 1px;
  height: 20px;
  background: var(--border);
}

.navbar-page-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.navbar-username {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
}

.layout-body {
  display: flex;
  flex: 1;
  position: relative;
}

.left-sidebar {
  width: 230px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 1rem 0.75rem;
  flex-shrink: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-link {
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}

.sidebar-link:hover {
  background: #f1f5f9;
  color: var(--text);
  text-decoration: none;
}

.sidebar-link.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

.main-content {
  flex: 1;
  min-width: 0;
  padding: 1.5rem;
}

.content-container {
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

  .navbar-divider,
  .navbar-page-title,
  .navbar-username {
    display: none;
  }

  .left-sidebar {
    position: fixed;
    top: 60px;
    bottom: 0;
    left: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .left-sidebar.open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    top: 60px;
    inset: 60px 0 0 0;
    background: rgba(15, 23, 42, 0.35);
    z-index: 45;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>

