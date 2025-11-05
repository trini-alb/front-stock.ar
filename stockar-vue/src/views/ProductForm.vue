<template>
  <div class="product-form-container">
    <div class="form-header">
      <h2>{{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
      <div class="header-actions">
        <button @click="goBack" class="btn btn-secondary">
          ← Volver
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="product-form">
      <div class="form-grid">
        <!-- Información básica -->
        <div class="form-section">
          <h3>Información Básica</h3>
          
          <div class="form-group">
            <label for="codigo">Código del Producto *</label>
            <input
              id="codigo"
              v-model.number="form.codigo"
              type="number"
              class="form-control"
              :class="{ 'error': errors.codigo }"
              placeholder="Ej: 12345"
              required
            />
            <span v-if="errors.codigo" class="error-message">{{ errors.codigo }}</span>
          </div>

          <div class="form-group">
            <label for="nombre">Nombre del Producto *</label>
            <input
              id="nombre"
              v-model="form.nombre"
              type="text"
              class="form-control"
              :class="{ 'error': errors.nombre }"
              placeholder="Ej: Filtro de aceite Toyota"
              required
            />
            <span v-if="errors.nombre" class="error-message">{{ errors.nombre }}</span>
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              v-model="form.descripcion"
              class="form-control"
              rows="3"
              placeholder="Descripción detallada del producto..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="marca">Marca *</label>
            <input
              id="marca"
              v-model="form.marca"
              type="text"
              class="form-control"
              placeholder="Ej: Toyota, Bosch, Mann"
              required
            />
          </div>
        </div>

        <!-- Clasificación -->
        <div class="form-section">
          <h3>Clasificación</h3>
          
          <div class="form-group">
            <label for="idTipoProducto">Tipo de Producto *</label>
            <select
              id="idTipoProducto"
              v-model.number="form.idTipoProducto"
              class="form-control"
              :class="{ 'error': errors.idTipoProducto }"
              required
            >
              <option value="0">Seleccione un tipo</option>
              <option
                v-for="tipo in tiposProducto"
                :key="tipo.idTipoProducto"
                :value="tipo.idTipoProducto"
              >
                {{ tipo.nombre }}
              </option>
            </select>
            <span v-if="errors.idTipoProducto" class="error-message">{{ errors.idTipoProducto }}</span>
          </div>
        </div>

        <!-- Precios y Stock -->
        <div class="form-section">
          <h3>Precios y Stock</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="precioNeto">Precio Neto *</label>
              <div class="input-group">
                <span class="input-prefix">$</span>
                <input
                  id="precioNeto"
                  v-model.number="form.precioNeto"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  :class="{ 'error': errors.precioNeto }"
                  placeholder="0.00"
                  required
                />
              </div>
              <span v-if="errors.precioNeto" class="error-message">{{ errors.precioNeto }}</span>
            </div>

            <div class="form-group">
              <label for="precioVenta">Precio de Venta *</label>
              <div class="input-group">
                <span class="input-prefix">$</span>
                <input
                  id="precioVenta"
                  v-model.number="form.precioVenta"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  :class="{ 'error': errors.precioVenta }"
                  placeholder="0.00"
                  required
                />
              </div>
              <span v-if="errors.precioVenta" class="error-message">{{ errors.precioVenta }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="iva">IVA (%)</label>
              <input
                id="iva"
                v-model.number="form.iva"
                type="number"
                step="0.01"
                min="0"
                max="100"
                class="form-control"
                placeholder="21"
              />
            </div>

            <div class="form-group">
              <label for="ganancia">Ganancia (%)</label>
              <input
                id="ganancia"
                v-model.number="form.ganancia"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                placeholder="30"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="stock">Stock *</label>
            <input
              id="stock"
              v-model.number="form.stock"
              type="number"
              min="0"
              class="form-control"
              :class="{ 'error': errors.stock }"
              placeholder="0"
              required
            />
            <span v-if="errors.stock" class="error-message">{{ errors.stock }}</span>
          </div>

          <!-- Mostrar margen de ganancia -->
          <div v-if="form.precioNeto && form.precioVenta" class="profit-info">
            <div class="profit-margin">
              <strong>Margen de Ganancia:</strong>
              {{ calculateProfitMargin() }}% 
              ({{ formatCurrency(form.precioVenta - form.precioNeto) }})
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions">
        <button type="button" @click="goBack" class="btn btn-secondary">
          Cancelar
        </button>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          <span v-if="loading">Guardando...</span>
          <span v-else>{{ isEditing ? 'Actualizar' : 'Crear' }} Producto</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productoService, type TipoProducto } from '@/services';

// Router
const route = useRoute();
const router = useRouter();

// State
const loading = ref(false);
const tiposProducto = ref<TipoProducto[]>([]);

// Form data
const form = reactive({
  codigo: 0,
  nombre: '',
  descripcion: '',
  marca: '',
  precioNeto: 0,
  precioVenta: 0,
  iva: 21,
  ganancia: 30,
  stock: 0,
  idTipoProducto: 0,
  idMoneda: 1 // USD por defecto
});

// Errores de validación
const errors = reactive<Record<string, string>>({
  nombre: '',
  codigo: '',
  idTipoProducto: '',
  precioNeto: '',
  precioVenta: '',
  stock: ''
});

// Computed
const isEditing = computed(() => route.name === 'ProductEdit');
const productId = computed(() => route.params.id as string);

// Methods
const calculateProfitMargin = (): string => {
  if (!form.precioNeto || !form.precioVenta) return '0';
  const margin = ((form.precioVenta - form.precioNeto) / form.precioNeto) * 100;
  return margin.toFixed(2);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount);
};

const validateForm = (): boolean => {
  // Limpiar errores
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });

  let isValid = true;

  // Validaciones
  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es requerido';
    isValid = false;
  }

  if (!form.idTipoProducto) {
    errors.idTipoProducto = 'Debe seleccionar un tipo de producto';
    isValid = false;
  }

  if (form.precioNeto <= 0) {
    errors.precioNeto = 'El precio neto debe ser mayor a 0';
    isValid = false;
  }

  if (form.precioVenta <= 0) {
    errors.precioVenta = 'El precio de venta debe ser mayor a 0';
    isValid = false;
  }

  if (form.precioVenta <= form.precioNeto) {
    errors.precioVenta = 'El precio de venta debe ser mayor al precio neto';
    isValid = false;
  }

  if (form.stock < 0) {
    errors.stock = 'El stock no puede ser negativo';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) return;

  loading.value = true;
  
  try {
    const productData = {
      ...form,
      idTipoProducto: Number(form.idTipoProducto)
    };

    if (isEditing.value) {
      await productoService.update(Number(productId.value), productData);
      alert('Producto actualizado exitosamente');
    } else {
      await productoService.create(productData);
      alert('Producto creado exitosamente');
    }

    router.push('/productos');
  } catch (error) {
    console.error('Error al guardar producto:', error);
    alert('Error al guardar el producto. Por favor intente nuevamente.');
  } finally {
    loading.value = false;
  }
};

const loadProduct = async (): Promise<void> => {
  if (!isEditing.value) return;

  try {
    loading.value = true;
    const producto = await productoService.getById(Number(productId.value));
    
    // Llenar el formulario
    Object.assign(form, {
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      marca: producto.marca || '',
      precioNeto: producto.precioNeto,
      precioVenta: producto.precioVenta,
      iva: producto.iva,
      ganancia: producto.ganancia,
      stock: producto.stock,
      idTipoProducto: producto.tipoProducto.idTipoProducto,
      idMoneda: producto.moneda.idMoneda
    });
  } catch (error) {
    console.error('Error al cargar producto:', error);
    alert('Error al cargar el producto');
    router.push('/productos');
  } finally {
    loading.value = false;
  }
};

const loadTiposProducto = async (): Promise<void> => {
  try {
    // Si tienes un servicio para tipos de producto, úsalo aquí
    // tiposProducto.value = await tipoProductoService.getTiposProducto();
    
    // Por ahora, usar datos estáticos
    tiposProducto.value = [
      { idTipoProducto: 1, nombre: 'Repuesto Original', descripcion: 'Repuestos originales de fábrica' },
      { idTipoProducto: 2, nombre: 'Repuesto Alternativo', descripcion: 'Repuestos alternativos' },
      { idTipoProducto: 3, nombre: 'Herramienta', descripcion: 'Herramientas y equipos' },
      { idTipoProducto: 4, nombre: 'Lubricante', descripcion: 'Aceites y lubricantes' },
      { idTipoProducto: 5, nombre: 'Accesorio', descripcion: 'Accesorios varios' }
    ];
  } catch (error) {
    console.error('Error al cargar tipos de producto:', error);
  }
};

const goBack = (): void => {
  router.push('/productos');
};

// Lifecycle
onMounted(async () => {
  await loadTiposProducto();
  if (isEditing.value) {
    await loadProduct();
  }
});
</script>

<style scoped>
.product-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.form-header h2 {
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.product-form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-grid {
  display: grid;
  gap: 30px;
  padding: 30px;
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 1.1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-control.error {
  border-color: #ef4444;
}

.input-group {
  position: relative;
}

.input-prefix {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 500;
  z-index: 1;
}

.input-group .form-control {
  padding-left: 35px;
}

.form-checkbox {
  margin-right: 8px;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
}

.profit-info {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
  padding: 15px;
  margin-top: 15px;
}

.profit-margin {
  color: #0c4a6e;
  font-size: 0.9rem;
}

.form-actions {
  padding: 20px 30px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
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
  min-width: 120px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

/* Responsive */
@media (max-width: 768px) {
  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>