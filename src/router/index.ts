import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import type { Role } from '@/Data/User'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    roles?: Role[]
  }
}
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { public: true },
    },
    //LOGIN
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/Register',
      name: 'Register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { public: true },
    },
    //ADMIN
    {
      path: '/queue',
      name: 'queue',
      component: () => import('@/views/TicketQueueView.vue'),
      meta: { roles: ['ADMIN', 'TECHNICIAN'] },
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/CategoriesView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/UsersView.vue'),
      meta: { roles: ['ADMIN'] },
    },
    //CLIENT
    {
      path: '/tickets/new',
      name: 'new_ticket',
      component: () => import('@/views/NewTicketView.vue'),
      meta: { roles: ['CLIENT'] },
    },
    {
      path: '/tickets',
      name: 'My_ticket',
      component: () => import('@/views/MyTicketsView.vue'),
      meta: { roles: ['CLIENT'] }
    },
    {
      path: '/tickets/:id',
      name: 'ticket-detail',
      component: () => import('@/views/TicketDetailView.vue'),
      meta: { roles: ['CLIENT', 'ADMIN', 'TECHNICIAN'] },
    },
    //TECHNICIAN
    {
      path: '/claimed_ticket',
      name: 'claimed_ticket',
      component: () => import('@/views/ClaimedTicketsView.vue'),
      meta: { roles: ['TECHNICIAN'] },
    },
  ],
})


router.beforeEach((to) => {
  const auth = useAuthStore()

  // 1. If route is public
  if (to.meta.public) {
    if (auth.isLoggedIn) {
      return auth.homeRoute // Already logged in, send to their dashboard
    }
    return true // Allow guest access
  }

  // 2. If route requires login and user is not logged in
  if (!auth.isLoggedIn) {
    return '/login'
  }

  // 3. If route restricts by role and user's role is not allowed
  const allowedRoles = to.meta.roles
  if (allowedRoles && auth.currentUser && !allowedRoles.includes(auth.currentUser.role)) {
    return auth.homeRoute // Wrong role, send back to their role's home
  }

  // 4. All checks passed
  return true
})
export default router
