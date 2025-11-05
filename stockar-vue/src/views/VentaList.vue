<template>
  <!-- Basado en Lista-ventas.html con funcionalidad completa -->
  <div class="venta-list-container">
    <!-- Header con navegación -->
    <header class="u-black u-clearfix u-header u-header" id="header">
      <div class="u-clearfix u-sheet u-valign-middle u-sheet-1">
        <div class="custom-expanded u-clearfix u-custom-html u-custom-html-1">
          <div class="menu-usuario">
            <div class="menu-desplegable">
              <span>{{ currentUser?.empleado?.nombre }}</span>
              <a @click="handleLogout" href="#">Cerrar sesión</a>
            </div>
          </div>
        </div>
        <p class="u-text u-text-default u-text-1">
          <span style="font-size: 1.875rem;">Lista Ventas</span>
        </p>
        
        <!-- Navegación simplificada -->
        <nav class="drawer-nav">
          <router-link to="/dashboard">Inicio</router-link>
          <router-link to="/productos">Lista de repuestos</router-link>
          <router-link to="/productos/nuevo">Agregar repuesto</router-link>
          <router-link to="/ventas/nueva">Registrar venta</router-link>
          <router-link to="/calcular-precio">Calcular precio</router-link>
        </nav>
      </div>
    </header>

    <!-- Sección principal -->
    <section class="u-clearfix u-section-1" id="block-2">
      <div class="u-clearfix u-sheet u-sheet-1">
        
        <!-- Filtros y búsqueda -->
        <div class="u-form u-form-1">
          <div class="filters-container">
            <div class="filter-row">
              <div class="filter-group">
                <label class="u-label">Filtrar por fecha:</label>
                <input 
                  v-model="filters.fechaDesde"
                  type="date" 
                  class="u-input u-input-rectangle filter-input"
                  placeholder="Fecha desde"
                />
                <input 
                  v-model="filters.fechaHasta"
                  type="date" 
                  class="u-input u-input-rectangle filter-input"
                  placeholder="Fecha hasta"
                />
              </div>
              
              <div class="filter-group">
                <label class="u-label">Empleado:</label>
                <select 
                  v-model="filters.empleado" 
                  class="u-input u-input-rectangle filter-select"
                >
                  <option value="">Todos los empleados</option>
                  <option 
                    v-for="empleado in empleados" 
                    :key="empleado.idEmpleado" 
                    :value="empleado.idEmpleado"
                  >
                    {{ empleado.nombre }} {{ empleado.apellido }}
                  </option>
                </select>
              </div>
              
              <div class="filter-actions">
                <button 
                  @click="applyFilters"
                  class="u-btn u-btn-submit filter-btn"
                  :disabled="loading"
                >
                  🔍 Filtrar
                </button>
                <button 
                  @click="clearFilters"
                  class="u-btn u-btn-secondary filter-btn"
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-number">{{ totalVentas }}</div>
            <div class="stat-label">Total Ventas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${{ totalMonto.toFixed(2) }}</div>
            <div class="stat-label">Monto Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ ventasHoy }}</div>
            <div class="stat-label">Ventas Hoy</div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-container">
          <div class="loading">Cargando ventas...</div>
        </div>

        <!-- Tabla de ventas -->
        <div v-else-if="paginatedVentas.length > 0" class="table-container">
          <table class="u-table u-table-1">
            <thead class="u-table-header">
              <tr class="u-table-row">
                <th class="u-table-cell">ID</th>
                <th class="u-table-cell">Fecha</th>
                <th class="u-table-cell">Empleado</th>
                <th class="u-table-cell">Items</th>
                <th class="u-table-cell">Total</th>
                <th class="u-table-cell">Acciones</th>
              </tr>
            </thead>
            <tbody class="u-table-body">
              <tr 
                v-for="venta in paginatedVentas" 
                :key="venta.idVenta"
                class="u-table-row"
              >
                <td class="u-table-cell">
                  <span class="venta-id">#{{ venta.idVenta }}</span>
                </td>
                <td class="u-table-cell">
                  <div class="date-info">
                    <span class="date">{{ formatDate(venta.fechaHora) }}</span>
                    <span class="time">{{ formatTime(venta.fechaHora) }}</span>
                  </div>
                </td>
                <td class="u-table-cell">
                  <div class="employee-info">
                    <span class="name">{{ venta.empleado.nombre }} {{ venta.empleado.apellido }}</span>
                    <span class="role">{{ venta.empleado.rol.nombre }}</span>
                  </div>
                </td>
                <td class="u-table-cell">
                  <div class="items-summary">
                    <span class="item-count">{{ venta.detalles.length }} productos</span>
                    <span class="total-quantity">{{ getTotalQuantity(venta.detalles) }} unidades</span>
                  </div>
                </td>
                <td class="u-table-cell">
                  <span class="total-amount">${{ venta.total.toFixed(2) }}</span>
                </td>
                <td class="u-table-cell acciones">
                  <div class="action-buttons">
                    <button 
                      @click="viewVenta(venta)"
                      class="btn-accion btn-ver"
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    <button 
                      @click="downloadVenta(venta)"
                      class="btn-accion btn-download"
                      title="Descargar recibo"
                    >
                      📄
                    </button>
                    <button 
                      @click="deleteVenta(venta)"
                      class="btn-accion btn-eliminar"
                      title="Eliminar venta"
                      v-if="canDelete(venta)"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sin datos -->
        <div v-else class="no-data">
          <div class="no-data-content">
            <h3>No se encontraron ventas</h3>
            <p>No hay ventas que coincidan con los filtros seleccionados.</p>
            <router-link to="/ventas/nueva" class="u-btn u-btn-primary">
              ➕ Registrar Primera Venta
            </router-link>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="filteredVentas.length > itemsPerPage" class="pagination">
          <button 
            @click="currentPage = 1" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            ⏮️ Primera
          </button>
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            ⏪ Anterior
          </button>
          <span class="pagination-info">
            Página {{ currentPage }} de {{ totalPages }} 
            ({{ filteredVentas.length }} ventas total)
          </span>
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Siguiente ⏩
          </button>
          <button 
            @click="currentPage = totalPages" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Última ⏭️
          </button>
        </div>

        <!-- Botón Nueva Venta -->
        <div class="action-section">
          <router-link 
            to="/ventas/nueva" 
            class="u-border-2 u-border-black u-btn u-button-style u-custom-color-1 u-hover-palette-2-base u-btn-3"
          >
            ➕ Registrar Venta
          </router-link>
        </div>

        <!-- Mensajes -->
        <div v-if="message" class="message" :class="messageType">
          {{ message }}
        </div>

      </div>
    </section>

    <!-- Footer -->
    <footer class="u-align-center u-black u-clearfix u-container-align-center u-footer u-footer" id="footer">
      <div class="u-clearfix u-sheet u-valign-middle u-sheet-1">
        <router-link to="/dashboard" class="u-image u-logo u-image-1">
          <img src="/images/logo-Photoroom.png" class="u-logo-image u-logo-image-1" alt="StockAR">
        </router-link>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService, ventaService } from '@/services';
import type { Usuario, Venta, DetalleVenta } from '@/services';

const router = useRouter();

// Interfaces
interface VentaFilter {
  fechaDesde: string;
  fechaHasta: string;
  empleado: string;
}

interface Empleado {
  idEmpleado: number;
  nombre: string;
  apellido: string;
  rol: {
    nombre: string;
  };
}

// Estado reactivo
const currentUser = ref<Usuario | null>(null);
const loading = ref(false);
const ventas = ref<Venta[]>([]);
const empleados = ref<Empleado[]>([]);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

// Filtros
const filters = ref<VentaFilter>({
  fechaDesde: '',
  fechaHasta: '',
  empleado: ''
});

// Paginación
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Computed properties
const filteredVentas = computed(() => {
  let result = ventas.value;

  // Filtro por fecha
  if (filters.value.fechaDesde) {
    result = result.filter(venta => 
      new Date(venta.fechaHora) >= new Date(filters.value.fechaDesde)
    );
  }
  
  if (filters.value.fechaHasta) {
    result = result.filter(venta => 
      new Date(venta.fechaHora) <= new Date(filters.value.fechaHasta + 'T23:59:59')
    );
  }

  // Filtro por empleado
  if (filters.value.empleado) {
    result = result.filter(venta => 
      venta.empleado.idEmpleado === parseInt(filters.value.empleado)
    );
  }

  // Ordenar por fecha más reciente
  return result.sort((a, b) => 
    new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
  );
});

const totalPages = computed(() => {
  return Math.ceil(filteredVentas.value.length / itemsPerPage.value);
});

const paginatedVentas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredVentas.value.slice(start, end);
});

const totalVentas = computed(() => filteredVentas.value.length);

const totalMonto = computed(() => {
  return filteredVentas.value.reduce((sum, venta) => sum + venta.total, 0);
});

const ventasHoy = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return filteredVentas.value.filter(venta => 
    venta.fechaHora.toString().startsWith(today)
  ).length;
});

// Métodos
const loadVentas = async () => {
  loading.value = true;
  try {
    ventas.value = await ventaService.getAll();
    
    // Extraer empleados únicos
    const empleadosUnicos = new Map();
    ventas.value.forEach(venta => {
      if (!empleadosUnicos.has(venta.empleado.idEmpleado)) {
        empleadosUnicos.set(venta.empleado.idEmpleado, venta.empleado);
      }
    });
    empleados.value = Array.from(empleadosUnicos.values());
    
  } catch (error) {
    console.error('Error cargando ventas:', error);
    showMessage('Error al cargar las ventas', 'error');
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  currentPage.value = 1; // Resetear a primera página
  showMessage('Filtros aplicados', 'success');
};

const clearFilters = () => {
  filters.value = {
    fechaDesde: '',
    fechaHasta: '',
    empleado: ''
  };
  currentPage.value = 1;
  showMessage('Filtros limpiados', 'success');
};

const viewVenta = (venta: Venta) => {
  router.push(`/ventas/${venta.idVenta}`);
};

const downloadVenta = (venta: Venta) => {
  // Implementar descarga de recibo
  showMessage('Función de descarga en desarrollo', 'error');
  console.log('Descargar venta:', venta.idVenta);
};

const deleteVenta = async (venta: Venta) => {
  if (!confirm(`¿Está seguro que desea eliminar la venta #${venta.idVenta}?`)) {
    return;
  }

  try {
    await ventaService.delete(venta.idVenta);
    ventas.value = ventas.value.filter(v => v.idVenta !== venta.idVenta);
    showMessage('Venta eliminada correctamente', 'success');
  } catch (error) {
    console.error('Error eliminando venta:', error);
    showMessage('Error al eliminar la venta', 'error');
  }
};

const canDelete = (venta: Venta): boolean => {
  // Solo permitir eliminar ventas del mismo día o si es admin
  const today = new Date().toISOString().split('T')[0];
  const ventaDate = venta.fechaHora.toString().split('T')[0];
  
  return ventaDate === today || currentUser.value?.empleado?.rol?.nombre === 'admin';
};

const getTotalQuantity = (detalles: DetalleVenta[]): number => {
  return detalles.reduce((total, detalle) => total + detalle.cantidad, 0);
};

const formatDate = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleDateString('es-AR');
};

const formatTime = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

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
  loadVentas();
});
</script>

<style>
/* Importar CSS originales */
@import '/css/nicepage.css';
@import '/css/Lista-ventas.css';

/* Estilos adicionales para la funcionalidad de ventas */
.filters-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
}

.filter-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.u-btn-submit {
  background: #1e40af;
  color: white;
}

.u-btn-secondary {
  background: #6b7280;
  color: white;
}

.stats-container {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  min-width: 120px;
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1e40af;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
}

.table-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.u-table-1 {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

.u-table-1 th,
.u-table-1 td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.u-table-1 th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.u-table-row:hover {
  background: #f9fafb;
}

.venta-id {
  font-weight: bold;
  color: #1e40af;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date {
  font-weight: 500;
}

.time {
  font-size: 0.8rem;
  color: #6b7280;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-weight: 500;
}

.role {
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

.items-summary {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-count {
  font-weight: 500;
}

.total-quantity {
  font-size: 0.8rem;
  color: #6b7280;
}

.total-amount {
  font-weight: bold;
  color: #059669;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.btn-accion {
  background: none;
  border: 1px solid transparent;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.btn-ver {
  background: #e0f2fe;
  border-color: #0ea5e9;
}

.btn-ver:hover {
  background: #bae6fd;
}

.btn-download {
  background: #f0fdf4;
  border-color: #22c55e;
}

.btn-download:hover {
  background: #dcfce7;
}

.btn-eliminar {
  background: #fef2f2;
  border-color: #ef4444;
}

.btn-eliminar:hover {
  background: #fecaca;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 30px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #1e40af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  margin: 0 15px;
  font-weight: 500;
  color: #374151;
}

.action-section {
  text-align: center;
  margin: 30px 0;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 20px 0;
}

.no-data-content h3 {
  color: #374151;
  margin: 0 0 10px 0;
}

.no-data-content p {
  color: #6b7280;
  margin: 0 0 20px 0;
}

.loading-container {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.loading {
  font-size: 1.1rem;
  color: #6b7280;
}

.message {
  padding: 12px 20px;
  border-radius: 6px;
  margin: 20px 0;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.message.error {
  background: #fecaca;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* Navegación simplificada */
.drawer-nav {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.drawer-nav a {
  color: white;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 3px;
  transition: background 0.3s ease;
}

.drawer-nav a:hover {
  background: rgba(255,255,255,0.1);
}

.menu-usuario {
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
}

.menu-desplegable {
  display: flex;
  gap: 15px;
  align-items: center;
}

.menu-desplegable a {
  color: white;
  text-decoration: none;
  cursor: pointer;
}

.menu-desplegable a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .drawer-nav {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .stats-container {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .pagination-info {
    width: 100%;
    text-align: center;
    margin: 10px 0;
  }
  
  .u-table-1 {
    font-size: 0.9rem;
  }
  
  .u-table-1 th,
  .u-table-1 td {
    padding: 8px 4px;
  }
}
</style>