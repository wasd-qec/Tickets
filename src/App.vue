<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'

const route = useRoute()
const auth = useAuthStore()

// If the page is not public and the user is logged in, show the AppLayout frame
const showLayout = computed(() => !route.meta.public && auth.isLoggedIn)
</script>

<template>
  <AppLayout v-if="showLayout">
    <RouterView />
  </AppLayout>
  <RouterView v-else />
</template>