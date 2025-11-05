<template>
  <div class="notifications-container">
    <!-- Toast notifications -->
    <transition-group name="notification" tag="div" class="notifications-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', `notification--${notification.type}`]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          {{ getIcon(notification.type) }}
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button class="notification-close" @click.stop="removeNotification(notification.id)">
          ×
        </button>
      </div>
    </transition-group>

    <!-- Modal overlay for important notifications -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalNotification?.title }}</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <p>{{ modalNotification?.message }}</p>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-primary">
            Entendido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

// Props
interface Props {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top-right',
  maxNotifications: 5
});

// State
const notifications = ref<Notification[]>([]);
const showModal = ref(false);
const modalNotification = ref<Notification | null>(null);
const timers = new Map<string, number>();

// Computed
// const notificationClass = computed(() => `notifications-list--${props.position}`);

// Methods
const getIcon = (type: Notification['type']): string => {
  const icons: Record<Notification['type'], string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || 'ℹ️';
};

const addNotification = (notification: Omit<Notification, 'id'>): string => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const newNotification: Notification = {
    ...notification,
    id,
    duration: notification.duration ?? 5000
  };

  // Limitar número de notificaciones
  if (notifications.value.length >= props.maxNotifications) {
    const oldest = notifications.value[0];
    removeNotification(oldest.id);
  }

  notifications.value.push(newNotification);

  // Auto-remove si no es persistente
  if (!newNotification.persistent && (newNotification.duration && newNotification.duration > 0)) {
    const timer = window.setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
    timers.set(id, timer);
  }

  return id;
};

const removeNotification = (id: string): void => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
    
    // Limpiar timer si existe
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
  }
};

const showModalNotification = (notification: Omit<Notification, 'id'>): void => {
  modalNotification.value = {
    ...notification,
    id: Date.now().toString()
  };
  showModal.value = true;
};

const closeModal = (): void => {
  showModal.value = false;
  modalNotification.value = null;
};

const clearAll = (): void => {
  notifications.value.forEach(n => {
    const timer = timers.get(n.id);
    if (timer) {
      clearTimeout(timer);
    }
  });
  notifications.value = [];
  timers.clear();
};

// Métodos de conveniencia
const success = (title: string, message: string, options?: Partial<Notification>): string => {
  return addNotification({ ...options, type: 'success', title, message });
};

const error = (title: string, message: string, options?: Partial<Notification>): string => {
  return addNotification({ ...options, type: 'error', title, message, persistent: true });
};

const warning = (title: string, message: string, options?: Partial<Notification>): string => {
  return addNotification({ ...options, type: 'warning', title, message });
};

const info = (title: string, message: string, options?: Partial<Notification>): string => {
  return addNotification({ ...options, type: 'info', title, message });
};

// Exponer métodos para el componente padre
defineExpose({
  addNotification,
  removeNotification,
  showModalNotification,
  clearAll,
  success,
  error,
  warning,
  info
});

// Cleanup en unmount
onUnmounted(() => {
  timers.forEach(timer => clearTimeout(timer));
  timers.clear();
});
</script>

<style scoped>
.notifications-container {
  position: relative;
  z-index: 9999;
}

.notifications-list {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

.notifications-list--top-right {
  top: 20px;
  right: 20px;
}

.notifications-list--top-left {
  top: 20px;
  left: 20px;
}

.notifications-list--bottom-right {
  bottom: 20px;
  right: 20px;
}

.notifications-list--bottom-left {
  bottom: 20px;
  left: 20px;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  min-width: 300px;
  max-width: 400px;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.3s ease;
}

.notification:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.notification--success {
  border-left-color: #10b981;
  background: linear-gradient(to right, #ecfdf5, white);
}

.notification--error {
  border-left-color: #ef4444;
  background: linear-gradient(to right, #fef2f2, white);
}

.notification--warning {
  border-left-color: #f59e0b;
  background: linear-gradient(to right, #fffbeb, white);
}

.notification--info {
  border-left-color: #3b82f6;
  background: linear-gradient(to right, #eff6ff, white);
}

.notification-icon {
  font-size: 1.5rem;
  line-height: 1;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.notification-message {
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.notification-close:hover {
  color: #374151;
}

/* Animaciones */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.4s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.4s ease;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .notifications-list {
    left: 10px !important;
    right: 10px !important;
  }
  
  .notification {
    min-width: auto;
    max-width: none;
  }
  
  .modal-content {
    margin: 20px;
    width: auto;
  }
}
</style>