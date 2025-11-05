// Router principal de la aplicación
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { authService } from '@/services';

// Importar vistas
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Dashboard from '@/views/Dashboard.vue';
import ProductList from '@/views/ProductList.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, hideForAuth: true }
  },
  {
    path: '/registro',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, hideForAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/productos',
    name: 'ProductList',
    component: ProductList,
    meta: { requiresAuth: true }
  },
  {
    path: '/productos/nuevo',
    name: 'ProductCreate',
    component: () => import('@/views/ProductForm.vue'),
    meta: { requiresAuth: true, requiredPermission: 'crear_producto' }
  },
  {
    path: '/productos/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/productos/:id/editar',
    name: 'ProductEdit',
    component: () => import('@/views/ProductForm.vue'),
    meta: { requiresAuth: true, requiredPermission: 'editar_producto' }
  },
  // Comentadas temporalmente hasta crear los componentes
  {
    path: '/calcular-precio',
    name: 'CalcularPrecio',
    component: () => import('@/views/CalcularPrecio.vue'),
    meta: { requiresAuth: true }
  },
  /*
  {
    path: '/ventas',
    name: 'VentaList',
    component: () => import('@/views/VentaList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ventas/nueva',
    name: 'VentaCreate',
    component: () => import('@/views/VentaForm.vue'),
    meta: { requiresAuth: true, requiredPermission: 'crear_venta' }
  },
  {
    path: '/ventas/:id',
    name: 'VentaDetail',
    component: () => import('@/views/VentaDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/usuarios',
    name: 'UsuarioList',
    component: () => import('@/views/UsuarioList.vue'),
    meta: { requiresAuth: true, requiredRole: 'admin' }
  },
  */
  {
    // Catch all 404
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/dashboard' // Redirigir al dashboard temporalmente
  }
];

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

// Guard de autenticación global
router.beforeEach((to, _from, next) => {
  const isAuthenticated = authService.isAuthenticated();
  const requiresAuth = to.meta.requiresAuth;
  const hideForAuth = to.meta.hideForAuth;
  const requiredPermission = to.meta.requiredPermission as string;
  const requiredRole = to.meta.requiredRole as string;

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  // Si el usuario está autenticado y trata de acceder a login/registro
  if (hideForAuth && isAuthenticated) {
    next('/dashboard');
    return;
  }

  // Verificar permisos específicos
  if (requiredPermission && !authService.hasPermission(requiredPermission)) {
    alert('No tiene permisos para acceder a esta página');
    next('/dashboard');
    return;
  }

  // Verificar rol específico
  if (requiredRole && !authService.hasRole(requiredRole)) {
    alert('No tiene el rol necesario para acceder a esta página');
    next('/dashboard');
    return;
  }

  next();
});

// Guard de salida para confirmar cambios no guardados
router.beforeResolve((_to, _from, next) => {
  // Aquí puedes agregar lógica para verificar formularios sin guardar
  next();
});

export default router;