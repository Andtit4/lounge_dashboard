<template>
  <VaSidebar v-model="writableVisible" :width="sidebarWidth" :color="color" minimized-width="0" class="custom-sidebar">
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <VaIcon name="dashboard" size="24px" color="primary" />
        <span class="sidebar-brand-text font-bold">Lounge Dashboard</span>
      </div>
    </div>
    <VaAccordion v-model="value" multiple>
      <VaCollapse v-for="(route, index) in filteredRoutes" :key="index" class="sidebar-collapse">
        <template #header="{ value: isCollapsed }">
          <VaSidebarItem
            :to="route.children ? undefined : { name: route.name }"
            :active="routeHasActiveChild(route)"
            :active-color="activeColor"
            :text-color="textColor(route)"
            :aria-label="`${route.children ? 'Open category ' : 'Visit'} ${t(route.displayName)}`"
            role="button"
            hover-opacity="0.15"
            class="custom-sidebar-item"
          >
            <VaSidebarItemContent class="py-3 pr-2 pl-4">
              <VaIcon
                v-if="route.meta.icon"
                aria-hidden="true"
                :name="route.meta.icon"
                size="20px"
                :color="iconColor(route)"
              />
              <VaSidebarItemTitle class="flex justify-between items-center leading-5 font-semibold">
                {{ t(route.displayName) }}
                <VaIcon v-if="route.children" :name="arrowDirection(isCollapsed)" size="20px" />
              </VaSidebarItemTitle>
            </VaSidebarItemContent>
          </VaSidebarItem>
        </template>
        <template #body>
          <div v-for="(childRoute, index2) in route.children" :key="index2">
            <VaSidebarItem
              :to="{ name: childRoute.name }"
              :active="isActiveChildRoute(childRoute)"
              :active-color="activeColor"
              :text-color="textColor(childRoute)"
              :aria-label="`Visit ${t(childRoute.displayName)}`"
              hover-opacity="0.15"
              class="custom-sidebar-subitem"
            >
              <VaSidebarItemContent class="py-3 pr-2 pl-11">
                <VaSidebarItemTitle class="leading-5 font-semibold">
                  {{ t(childRoute.displayName) }}
                </VaSidebarItemTitle>
              </VaSidebarItemContent>
            </VaSidebarItem>
          </div>
        </template>
      </VaCollapse>
    </VaAccordion>
  </VaSidebar>
</template>
<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'

import navigationRoutes, { type INavigationRoute } from './NavigationRoutes'
import { useAuthStore } from '../../stores/auth'

export default defineComponent({
  name: 'Sidebar',
  props: {
    visible: { type: Boolean, default: true },
    mobile: { type: Boolean, default: false },
  },
  emits: ['update:visible'],

  setup: (props, { emit }) => {
    const { getColor, colorToRgba } = useColors()
    const route = useRoute()
    const { t } = useI18n()
    const authStore = useAuthStore()

    const value = ref<boolean[]>([])

    const writableVisible = computed({
      get: () => props.visible,
      set: (v: boolean) => emit('update:visible', v),
    })

    const isActiveChildRoute = (child: INavigationRoute) => route.name === child.name

    const routeHasActiveChild = (section: INavigationRoute) => {
      if (!section.children) {
        return route.path.endsWith(`${section.name}`)
      }

      return section.children.some(({ name }) => route.path.endsWith(`${name}`))
    }

    const filteredRoutes = computed(() => {
      // Filtrer les routes en fonction du rôle de l'utilisateur
      return navigationRoutes.routes.filter((route: INavigationRoute) => {
        // Si la route est marquée adminOnly, ne l'afficher que pour les admins
        if (route.meta.adminOnly) {
          // Vérifier à la fois isAdmin et le champ role
          const isUserAdmin = authStore.isAdmin || authStore.currentUser?.role === 'admin'
          return isUserAdmin
        }
        // Sinon, l'afficher pour tout le monde
        return true
      })
    })

    const setActiveExpand = () =>
      (value.value = filteredRoutes.value.map((route: INavigationRoute) => routeHasActiveChild(route)))

    const sidebarWidth = computed(() => (props.mobile ? '100vw' : '280px'))
    const color = computed(() => getColor('background-secondary'))
    const activeColor = computed(() => colorToRgba(getColor('primary'), 0.15))

    const iconColor = (route: INavigationRoute) => (routeHasActiveChild(route) ? 'primary' : 'secondary')
    const textColor = (route: INavigationRoute) => (routeHasActiveChild(route) ? 'primary' : 'textPrimary')
    const arrowDirection = (state: boolean) => (state ? 'va-arrow-up' : 'va-arrow-down')

    watch(() => route.fullPath, setActiveExpand, { immediate: true })

    return {
      writableVisible,
      sidebarWidth,
      value,
      color,
      activeColor,
      navigationRoutes,
      filteredRoutes,
      routeHasActiveChild,
      isActiveChildRoute,
      t,
      iconColor,
      textColor,
      arrowDirection,
    }
  },
})
</script>

<style lang="scss" scoped>
// Prevent icon jump on animation
.va-sidebar {
  width: unset !important;
  min-width: unset !important;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.07);
}

.custom-sidebar {
  border-right: 1px solid var(--va-background-border);
  
  .sidebar-header {
    padding: 1.5rem 1rem;
    border-bottom: 1px solid var(--va-background-border);
  }
  
  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &-text {
      color: var(--va-primary);
      font-size: 1.125rem;
    }
  }
  
  .sidebar-collapse {
    margin-bottom: 0.25rem;
  }

  .custom-sidebar-item {
    transition: all 0.3s ease;
    margin: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    
    &:hover {
      background-color: var(--va-background-element);
    }
  }
  
  .custom-sidebar-subitem {
    transition: all 0.3s ease;
    margin: 0.125rem 0.5rem 0.125rem 1.5rem;
    border-radius: 0.5rem;
    
    &:hover {
      background-color: var(--va-background-element);
    }
  }
}
</style>
