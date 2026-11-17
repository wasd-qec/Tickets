<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTickets } from '@/services/api'
import type { Ticket } from '@/Data/Ticket'
  const tickets = ref<Ticket[]>([])
  onMounted(async () => {
    tickets.value = await getTickets()
  })

</script>
<template>
  <div class="queue-page">
    <h2>Ticket Queue</h2>
    <p>Loaded {{ tickets.length }} tickets</p>
  </div>
</template>
