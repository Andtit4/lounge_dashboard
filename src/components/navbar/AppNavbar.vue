<template>
  <VaNavbar class="app-layout-navbar py-2 px-4 custom-navbar">
    <template #left>
      <div class="left">
        <Transition v-if="isMobile" name="icon-fade" mode="out-in">
          <VaIcon
            color="primary"
            :name="isSidebarMinimized ? 'menu' : 'close'"
            size="24px"
            class="menu-icon"
            @click="isSidebarMinimized = !isSidebarMinimized"
          />
        </Transition>
        <RouterLink to="/" aria-label="Visit home page" class="logo-link">
          <VuesticLogo />
        </RouterLink>
      </div>
    </template>
    <template #right>
      <div class="search-bar">
        <VaInput
          placeholder="Rechercher..."
          color="primary"
          size="small"
          class="search-input"
          aria-label="Search"
          icon="search"
          iconRight="clear"
        />
      </div>
      <AppNavbarActions class="app-navbar__actions" :is-mobile="isMobile" />
    </template>
  </VaNavbar>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '../../stores/global-store'
import AppNavbarActions from './components/AppNavbarActions.vue'
import VuesticLogo from '../VuesticLogo.vue'

defineProps({
  isMobile: { type: Boolean, default: false },
})

const GlobalStore = useGlobalStore()

const { isSidebarMinimized } = storeToRefs(GlobalStore)
</script>

<style lang="scss" scoped>
.custom-navbar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-color: var(--va-background-secondary);
  border-bottom: 1px solid var(--va-background-border);
}

.va-navbar {
  z-index: 2;

  @media screen and (max-width: 950px) {
    .left {
      width: 100%;
    }

    .app-navbar__actions {
      display: flex;
      justify-content: space-between;
    }

    .search-bar {
      display: none;
    }
  }
}

.left {
  display: flex;
  align-items: center;

  & > * {
    margin-right: 1rem;
  }

  & > *:last-child {
    margin-right: 0;
  }
}

.logo-link {
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 0.85;
  }
}

.menu-icon {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: var(--va-background-element);
  }
}

.search-bar {
  margin-right: 1rem;
  max-width: 300px;
  width: 100%;
  
  @media screen and (max-width: 768px) {
    max-width: 200px;
  }
}

.search-input {
  border-radius: 8px;
  border: 1px solid var(--va-background-border);
  background-color: var(--va-background-primary);
  transition: all 0.3s ease;
  
  &:hover, &:focus {
    border-color: var(--va-primary);
    box-shadow: 0 0 0 2px rgba(130, 113, 39, 0.15);
  }
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: transform 0.5s ease;
}

.icon-fade-enter,
.icon-fade-leave-to {
  transform: scale(0.5);
}
</style>
