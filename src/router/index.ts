import { createRouter, createWebHistory } from 'vue-router'

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
      meta: { roles: 'ADMIN' },
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/UsersView.vue'),
      meta: { roles: 'ADMIN' },
    },
    //CLIENT
    {
      path: '/tickets/new',
      name: 'new_ticket',
      component: () => import('@/views/NewTicketView.vue'),
      meta: { roles: 'CLIENT' },
    },
    {
      path: '/tickets',
      name: 'My_ticket',
      component: () => import('@/views/MyTicketsView.vue'),
      meta: { roles: 'CLIENT' }
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
      meta: { roles: 'TECHNICIAN' },
    },
  ],
})

export default router
