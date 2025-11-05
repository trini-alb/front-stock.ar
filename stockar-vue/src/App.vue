<template>
  <div id="app">
    <!-- Navigation (solo en páginas autenticadas) -->
    <Navigation v-if="showNavigation" />
    
    <!-- Main content -->
    <main :class="{ 'with-nav': showNavigation }">
      <router-view />
    </main>
    
    <!-- Global notifications -->
    <Notifications />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { authService } from '@/services';
import Navigation from '@/components/Navigation.vue';
import Notifications from '@/components/Notifications.vue';

const route = useRoute();

// Mostrar navegación solo en páginas autenticadas
const showNavigation = computed(() => {
  return authService.isAuthenticated() && 
         route.name !== 'Login' && 
         route.name !== 'Registro';
});
</script>

<style>
/* Importar CSS global */
@import '@/assets/css/global.css';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

main.with-nav {
  margin-left: 250px;
  padding: 20px;
}

@media (max-width: 768px) {
  main.with-nav {
    margin-left: 0;
    padding: 10px;
  }
}
</style>