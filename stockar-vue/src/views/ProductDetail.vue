<template>
  <div class="product-detail-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando producto...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>Error al cargar el producto</h3>
      <p>{{ error }}</p>
      <button @click="loadProduct" class="btn btn-primary">Reintentar</button>
      <button @click="goBack" class="btn btn-secondary">Volver</button>
    </div>

    <!-- Product details -->
    <div v-else-if="producto" class="product-detail">
      <!-- Header -->
      <div class="detail-header">
        <div class="header-info">
          <h1>{{ producto.nombre }}</h1>
          <div class="product-meta">
            <span v-if="producto.codigo" class="product-code">
              Código: {{ producto.codigo }}
            </span>
            <span class="product-status active">
              Activo
            </span>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="goBack" class="btn btn-secondary">
            ← Volver
          </button>
          <button 
            v-if="canEdit" 
            @click="editProduct" 
            class="btn btn-primary"
          >
            ✏️ Editar
          </button>
        </div>
      </div>

      <!-- Product info grid -->
      <div class="product-grid">
        <!-- Basic Information -->
        <div class="info-card">
          <h3>Información Básica</h3>
          <div class="info-list">
            <div class="info-item">
              <label>Nombre:</label>
              <span>{{ producto.nombre }}</span>
            </div>
            <div class="info-item">
              <label>Código:</label>
              <span>{{ producto.codigo }}</span>
            </div>
            <div v-if="producto.descripcion" class="info-item">
              <label>Descripción:</label>
              <span>{{ producto.descripcion }}</span>
            </div>
            <div class="info-item">
              <label>Marca:</label>
              <span>{{ producto.marca }}</span>
            </div>
          </div>
        </div>

        <!-- Classification -->
        <div class="info-card">
          <h3>Clasificación</h3>
          <div class="info-list">
            <div class="info-item">
              <label>Tipo:</label>
              <span>{{ producto.tipoProducto?.nombre || 'No especificado' }}</span>
            </div>
            <div class="info-item">
              <label>Moneda:</label>
              <span>{{ producto.moneda?.nombre || 'No especificado' }}</span>
            </div>
            <div class="info-item">
              <label>Cotización:</label>
              <span>{{ producto.moneda?.cotizacion || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Prices -->
        <div class="info-card highlight">
          <h3>Precios</h3>
          <div class="price-grid">
            <div class="price-item">
              <label>Precio Neto</label>
              <div class="price-value cost">
                {{ formatCurrency(producto.precioNeto) }}
              </div>
            </div>
            <div class="price-item">
              <label>Precio de Venta</label>
              <div class="price-value sale">
                {{ formatCurrency(producto.precioVenta) }}
              </div>
            </div>
            <div class="price-item profit">
              <label>Margen de Ganancia</label>
              <div class="profit-info">
                <div class="profit-percentage">{{ profitMargin }}%</div>
                <div class="profit-amount">{{ formatCurrency(profitAmount) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock -->
        <div class="info-card" :class="{ 'warning': isLowStock }">
          <h3>
            Stock
            <span v-if="isLowStock" class="stock-warning">⚠️ Stock Bajo</span>
          </h3>
          <div class="stock-grid">
            <div class="stock-item">
              <label>Stock Actual</label>
              <div class="stock-value" :class="stockStatusClass">
                {{ producto.stock }} unidades
              </div>
            </div>
            <div class="stock-item">
              <label>Stock Mínimo</label>
              <div class="stock-value">
                5 unidades
              </div>
            </div>
            <div class="stock-item">
              <label>Estado</label>
              <div class="stock-status" :class="stockStatusClass">
                {{ stockStatus }}
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="info-card">
          <h3>Información Adicional</h3>
          <div class="info-list">
            <div class="info-item">
              <label>IVA:</label>
              <span>{{ producto.iva }}%</span>
            </div>
            <div class="info-item">
              <label>Ganancia:</label>
              <span>{{ producto.ganancia }}%</span>
            </div>
            <div class="info-item">
              <label>Estado:</label>
              <span class="status-active">Activo</span>
            </div>
          </div>
        </div>

        <!-- Audit Info - Comentado temporalmente -->
        <!--
        <div class="info-card">
          <h3>Información de Sistema</h3>
          <div class="info-list">
            <div class="info-item">
              <label>ID del Producto:</label>
              <span>{{ producto.idProducto }}</span>
            </div>
          </div>
        </div>
        -->
      </div>

      <!-- Actions -->
      <div class="detail-actions">
        <button @click="goBack" class="btn btn-secondary">
          Volver a la Lista
        </button>
        <button 
          v-if="canEdit" 
          @click="editProduct" 
          class="btn btn-primary"
        >
          Editar Producto
        </button>
        <button 
          v-if="canDelete" 
          @click="confirmDelete" 
          class="btn btn-danger"
        >
          Eliminar Producto
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productoService, authService, type Producto } from '@/services';

// Router
const route = useRoute();
const router = useRouter();

// State
const loading = ref(true);
const error = ref('');
const producto = ref<Producto | null>(null);

// Computed
const productId = computed(() => route.params.id as string);

const canEdit = computed(() => 
  authService.hasPermission('editar_producto') || authService.hasRole('admin')
);

const canDelete = computed(() => 
  authService.hasPermission('eliminar_producto') || authService.hasRole('admin')
);

const profitAmount = computed(() => {
  if (!producto.value) return 0;
  return producto.value.precioVenta - producto.value.precioNeto;
});

const profitMargin = computed(() => {
  if (!producto.value || !producto.value.precioNeto) return '0.00';
  const margin = (profitAmount.value / producto.value.precioNeto) * 100;
  return margin.toFixed(2);
});

const isLowStock = computed(() => {
  if (!producto.value) return false;
  return producto.value.stock <= 5; // Stock mínimo fijo por ahora
});

const stockStatus = computed(() => {
  if (!producto.value) return 'Desconocido';
  
  if (producto.value.stock === 0) return 'Sin Stock';
  if (isLowStock.value) return 'Stock Bajo';
  return 'Stock Normal';
});

const stockStatusClass = computed(() => {
  if (!producto.value) return '';
  
  if (producto.value.stock === 0) return 'no-stock';
  if (isLowStock.value) return 'low-stock';
  return 'normal-stock';
});

// Methods
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
};

// const formatDate = (dateString: string): string => {
//   const date = new Date(dateString);
//   return new Intl.DateTimeFormat('es-AR', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   }).format(date);
// };

const loadProduct = async (): Promise<void> => {
  try {
    loading.value = true;
    error.value = '';
    
    producto.value = await productoService.getById(Number(productId.value));
  } catch (err) {
    console.error('Error al cargar producto:', err);
    error.value = 'No se pudo cargar la información del producto';
  } finally {
    loading.value = false;
  }
};

const editProduct = (): void => {
  router.push(`/productos/${productId.value}/editar`);
};

const confirmDelete = async (): Promise<void> => {
  if (!producto.value) return;

  const confirmed = confirm(
    `¿Está seguro que desea eliminar el producto "${producto.value.nombre}"?\n\nEsta acción no se puede deshacer.`
  );

  if (confirmed) {
    try {
      await productoService.delete(Number(productId.value));
      alert('Producto eliminado exitosamente');
      router.push('/productos');
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Error al eliminar el producto. Por favor intente nuevamente.');
    }
  }
};

const goBack = (): void => {
  router.push('/productos');
};

// Lifecycle
onMounted(() => {
  loadProduct();
});
</script>

<style scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.header-info h1 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 2rem;
}

.product-meta {
  display: flex;
  gap: 15px;
  align-items: center;
}

.product-code {
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #6b7280;
}

.product-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.product-status.active {
  background: #d1fae5;
  color: #065f46;
}

.product-status.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.info-card.highlight {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
}

.info-card.warning {
  border-color: #f59e0b;
  box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);
}

.info-card h3 {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stock-warning {
  font-size: 0.875rem;
  color: #f59e0b;
}

.info-list {
  space-y: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 600;
  color: #6b7280;
  min-width: 120px;
}

.info-item span {
  color: #1f2937;
  text-align: right;
  flex: 1;
}

.price-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.price-item {
  text-align: center;
}

.price-item.profit {
  grid-column: 1 / -1;
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.price-item label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 8px;
  font-weight: 600;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  padding: 10px;
  border-radius: 8px;
}

.price-value.cost {
  background: #fef3c7;
  color: #92400e;
}

.price-value.sale {
  background: #d1fae5;
  color: #065f46;
}

.profit-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.profit-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
}

.profit-amount {
  font-size: 1rem;
  color: #6b7280;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  text-align: center;
}

.stock-item label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 8px;
  font-weight: 600;
}

.stock-value, .stock-status {
  font-weight: 700;
  padding: 8px;
  border-radius: 6px;
}

.normal-stock {
  background: #d1fae5;
  color: #065f46;
}

.low-stock {
  background: #fef3c7;
  color: #92400e;
}

.no-stock {
  background: #fee2e2;
  color: #991b1b;
}

.status-active {
  color: #059669;
  font-weight: 600;
}

.status-inactive {
  color: #dc2626;
  font-weight: 600;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .price-grid {
    grid-template-columns: 1fr;
  }

  .stock-grid {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>