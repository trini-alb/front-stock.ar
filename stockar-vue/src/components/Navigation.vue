<template>
  <nav class="sidebar">
    <div class="sidebar-header">
      <img src="/images/logo-Photoroom.png" alt="StockAR" class="logo" />
      <h2>StockAR</h2>
    </div>
    
    <div class="sidebar-user">
      <div class="user-avatar">
        {{ currentUser?.empleado?.nombre?.charAt(0).toUpperCase() }}
      </div>
      <div class="user-info">
        <div class="user-name">{{ currentUser?.empleado?.nombre }} {{ currentUser?.empleado?.apellido }}</div>
        <div class="user-role">{{ currentUser?.empleado?.rol?.nombre }}</div>
      </div>
    </div>
    
    <ul class="sidebar-menu">
      <li>
        <router-link to="/dashboard" class="menu-item" active-class="active">
          <span class="menu-icon">🏠</span>
          <span class="menu-text">Dashboard</span>
        </router-link>
      </li>
      
      <li class="menu-section">
        <span class="section-title">Productos</span>
      </li>
      <li>
        <router-link to="/productos" class="menu-item" active-class="active">
          <span class="menu-icon">📦</span>
          <span class="menu-text">Ver Productos</span>
        </router-link>
      </li>
      <li v-if="canCreateProduct">
        <router-link to="/productos/nuevo" class="menu-item" active-class="active">
          <span class="menu-icon">➕</span>
          <span class="menu-text">Agregar Producto</span>
        </router-link>
      </li>
      
      <li class="menu-section">
        <span class="section-title">Ventas</span>
      </li>
      <li>
        <router-link to="/ventas" class="menu-item" active-class="active">
          <span class="menu-icon">🛒</span>
          <span class="menu-text">Ver Ventas</span>
        </router-link>
      </li>
      <li v-if="canCreateVenta">
        <router-link to="/ventas/nueva" class="menu-item" active-class="active">
          <span class="menu-icon">💳</span>
          <span class="menu-text">Nueva Venta</span>
        </router-link>
      </li>
      
      <li class="menu-section">
        <span class="section-title">Herramientas</span>
      </li>
      <li>
        <router-link to="/calcular-precio" class="menu-item" active-class="active">
          <span class="menu-icon">💰</span>
          <span class="menu-text">Calcular Precio</span>
        </router-link>
      </li>
      
      <li v-if="isAdmin" class="menu-section">
        <span class="section-title">Administración</span>
      </li>
      <li v-if="isAdmin">
        <router-link to="/usuarios" class="menu-item" active-class="active">
          <span class="menu-icon">👥</span>
          <span class="menu-text">Usuarios</span>
        </router-link>
      </li>
    </ul>
    
    <div class="sidebar-footer">
      <button @click="handleLogout" class="logout-btn">
        <span class="menu-icon">🚪</span>
        <span class="menu-text">Cerrar Sesión</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services';
import type { Usuario } from '@/services';

const router = useRouter();
const currentUser = ref<Usuario | null>(null);

// Computed properties para permisos
const canCreateProduct = computed(() => 
  authService.hasPermission('crear_producto') || authService.hasRole('admin')
);

const canCreateVenta = computed(() => 
  authService.hasPermission('crear_venta') || authService.hasRole('admin')
);

const isAdmin = computed(() => 
  authService.hasRole('admin')
);

// Métodos
const handleLogout = async () => {
  if (confirm('¿Está seguro que desea cerrar sesión?')) {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Error en logout:', error);
      authService.clearStorage();
      router.push('/login');
    }
  }
};

// Lifecycle
onMounted(() => {
  currentUser.value = authService.getCurrentUser();
});
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  padding: 0;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.sidebar-user {
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.user-role {
  font-size: 0.8rem;
  opacity: 0.8;
  background: rgba(255,255,255,0.1);
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.sidebar-menu {
  flex: 1;
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}

.menu-section {
  padding: 15px 20px 5px 20px;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: rgba(255,255,255,0.1);
  border-left-color: #60a5fa;
}

.menu-item.active {
  background: rgba(255,255,255,0.15);
  border-left-color: #fbbf24;
  font-weight: 600;
}

.menu-icon {
  width: 20px;
  font-size: 1.2rem;
  margin-right: 12px;
  text-align: center;
}

.menu-text {
  font-size: 0.9rem;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(220, 38, 38, 0.2);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 0.3);
  border-color: rgba(220, 38, 38, 0.5);
}

.logout-btn .menu-icon {
  margin-right: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
</style>