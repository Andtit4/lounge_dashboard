import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { requireAuth, requireAdmin, requireSubscription, redirectIfAuthenticated, userOnlyAccess } from './guards'
import { useAuthStore } from '../stores/auth'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:catchAll(.*)',
    redirect: { name: '404' },
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('../pages/auth/Login.vue'),
        beforeEnter: redirectIfAuthenticated,
      },
      {
        name: 'signup',
        path: 'signup',
        component: () => import('../pages/auth/Signup.vue'),
        beforeEnter: redirectIfAuthenticated,
      },
      {
        name: 'recover-password',
        path: 'recover-password',
        component: () => import('../pages/auth/RecoverPassword.vue'),
        beforeEnter: redirectIfAuthenticated,
      },
      {
        name: 'logout',
        path: 'logout',
        component: () => import('../pages/auth/Logout.vue'),
      },
      {
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
  {
    path: '/404',
    component: AuthLayout,
    children: [
      {
        name: '404',
        path: '',
        component: () => import('../pages/404.vue'),
      },
    ],
  },

  // Lounges in Africa Routes
  {
    path: '/',
    component: AppLayout,
    beforeEnter: requireAuth,
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../pages/lounges/management/analytics.vue'),
        beforeEnter: requireAdmin,
      },
      {
        name: 'lounges',
        path: 'lounges',
        component: () => import('../pages/lounges/index.vue'),
      },
      {
        name: 'lounges-detail',
        path: 'lounges/:id',
        component: () => import('../pages/lounges/[id].vue'),
      },
      {
        name: 'lounges-management',
        path: 'lounges-management',
        component: () => import('../pages/lounges/management/index.vue'),
        beforeEnter: requireAdmin,
      },
      {
        name: 'lounges-list',
        path: 'lounges-management/list',
        component: () => import('../pages/lounges/management/list.vue'),
        beforeEnter: requireAdmin,
      },
      {
        name: 'lounges-create',
        path: 'lounges-management/create',
        component: () => import('../pages/lounges/management/create.vue'),
        beforeEnter: requireAdmin,
      },
      {
        name: 'lounges-edit',
        path: 'lounges-management/edit/:id',
        component: () => import('../pages/lounges/management/edit.vue'),
        beforeEnter: requireAdmin,
      },
      {
        name: 'lounges-analytics',
        path: 'lounges-management/analytics',
        component: () => import('../pages/lounges/management/analytics.vue'),
        beforeEnter: requireAdmin,
      },
      {
        name: 'bookings',
        path: 'bookings',
        component: () => import('../pages/bookings/index.vue'),
        beforeEnter: userOnlyAccess,
      },
      {
        name: 'bookings-detail',
        path: 'bookings/:id',
        component: () => import('../pages/bookings/[id].vue'),
        beforeEnter: userOnlyAccess,
      },
      {
        name: 'bookings-create',
        path: 'bookings/create',
        component: () => import('../pages/bookings/create.vue'),
        beforeEnter: (to, from, next) => {
          const authStore = useAuthStore();
          authStore.refreshAuth();
          
          if (!authStore.isAuthenticated) {
            next({
              name: 'login',
              query: { redirect: to.fullPath },
            });
            return;
          }
          
          if (!authStore.isAdmin) {
            if (!authStore.hasActiveSubscription) {
              next({ name: 'pricing-plans' });
              return;
            }
            
            next();
            return;
          }
          
          next();
        },
      },
      {
        name: 'subscriptions',
        path: 'subscriptions',
        component: () => import('../pages/subscriptions/index.vue'),
        beforeEnter: userOnlyAccess,
      },
      {
        name: 'subscriptions-detail',
        path: 'subscriptions/:id',
        component: () => import('../pages/subscriptions/[id].vue'),
        beforeEnter: userOnlyAccess,
      },
      {
        name: 'subscription-history',
        path: 'subscription-history',
        component: () => import('../pages/subscriptions/history.vue'),
        beforeEnter: userOnlyAccess,
      },
      {
        name: 'profile',
        path: 'profile',
        component: () => import('../pages/profile/index.vue'),
        beforeEnter: userOnlyAccess,
      },
      {
        name: 'users',
        path: 'users',
        component: () => import('../pages/users/UsersPage.vue'),
        beforeEnter: requireAdmin,
      },
      {
        name: 'users-management',
        path: 'users-management',
        component: () => import('../pages/admin/users/UsersManagement.vue'),
        beforeEnter: requireAdmin,
      },
      {
        name: 'projects',
        path: 'projects',
        component: () => import('../pages/projects/ProjectsPage.vue'),
        beforeEnter: requireAdmin,
      },
      {
        name: 'payment-methods',
        path: 'payment-methods',
        component: () => import('../pages/payments/PaymentsPage.vue'),
        beforeEnter: userOnlyAccess,
      },
      {
        name: 'pricing-plans',
        path: 'pricing-plans',
        component: () => import('../pages/pricing-plans/PricingPlans.vue'),
        beforeEnter: userOnlyAccess,
      },
      {
        name: 'billing',
        path: 'billing',
        component: () => import('../pages/billing/BillingPage.vue'),
        beforeEnter: userOnlyAccess,
      },
      {
        name: 'faq',
        path: 'faq',
        component: () => import('../pages/faq/FaqPage.vue'),
        beforeEnter: userOnlyAccess,
      },
      {
        name: 'preferences',
        path: 'preferences',
        component: () => import('../pages/preferences/Preferences.vue'),
        beforeEnter: requireAdmin,
      },
      {
        name: 'settings',
        path: 'settings',
        component: () => import('../pages/settings/Settings.vue'),
        beforeEnter: userOnlyAccess,
      },
      {
        name: 'admin-bookings',
        path: 'admin-bookings',
        component: () => import('../pages/admin/bookings/BookingsManagement.vue'),
        beforeEnter: requireAdmin,
      },
      {
        name: 'admin-bookings-detail',
        path: 'admin-bookings/:id',
        component: () => import('../pages/bookings/[id].vue'),
        beforeEnter: requireAdmin,
      },
      {
        path: '',
        redirect: { name: 'lounges' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      window.scrollTo(0, 0)
    }
  },
  routes,
})

export default router
