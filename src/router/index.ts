import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    roles?: Role[]
    title?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { public: true, title: 'HelpDesk' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true, title: 'Log in' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { public: true, title: 'Register' },
    },
    {
      path: '/tickets',
      name: 'my-tickets',
      component: () => import('@/views/MyTicketsView.vue'),
      meta: { roles: ['CLIENT'], title: 'My Tickets' },
    },
    {
      path: '/tickets/new',
      name: 'new-ticket',
      component: () => import('@/views/NewTicketView.vue'),
      meta: { roles: ['CLIENT'], title: 'New Ticket' },
    },
    {
      path: '/tickets/:id',
      name: 'ticket-detail',
      component: () => import('@/views/TicketDetailView.vue'),
      meta: { roles: ['CLIENT', 'TECHNICIAN', 'ADMIN'], title: 'Ticket Detail' },
    },
    {
      path: '/queue',
      name: 'ticket-queue',
      component: () => import('@/views/TicketQueueView.vue'),
      meta: { roles: ['TECHNICIAN', 'ADMIN'], title: 'Ticket Queue' },
    },
    {
      path: '/my-claims',
      name: 'claimed-tickets',
      component: () => import('@/views/ClaimedTicketsView.vue'),
      meta: { roles: ['TECHNICIAN'], title: 'My Claimed Tickets' },
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/CategoriesView.vue'),
      meta: { roles: ['ADMIN'], title: 'Categories' },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: { roles: ['ADMIN'], title: 'Users' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    if (auth.isAuthenticated) {
      return auth.roleHome
    }
    return true
  }

  if (!auth.isAuthenticated) {
    return '/login'
  }

  const allowedRoles = to.meta.roles
  if (allowedRoles && auth.user && !allowedRoles.includes(auth.user.role)) {
    return auth.roleHome
  }

  return true
})

export default router
