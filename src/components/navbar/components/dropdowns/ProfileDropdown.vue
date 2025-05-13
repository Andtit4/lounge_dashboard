<template>
  <div class="profile-dropdown-wrapper">
    <VaDropdown v-model="isShown" :offset="[9, 0]" class="profile-dropdown" stick-to-edges>
      <template #anchor>
        <VaButton preset="secondary" color="textPrimary">
          <span class="profile-dropdown__anchor min-w-max">
            <slot />
            <VaAvatar :size="32" color="#626364"> </VaAvatar>
          </span>
        </VaButton>
      </template>
      <VaDropdownContent
        class="profile-dropdown__content md:w-60 px-0 py-4 w-full"
        :style="{ '--hover-color': hoverColor }"
      >
        <VaList v-for="group in menuItems" :key="group.name">
          <header v-if="group.name" class="uppercase text-[var(--va-secondary)] opacity-80 font-bold text-xs px-4">
            {{ t(`user.${group.name}`) }}
          </header>
          <VaListItem
            v-for="item in group.list"
            :key="item.name"
            class="menu-item px-4 text-base cursor-pointer h-8"
            v-bind="resolveLinkAttribute(item)"
          >
            <VaIcon :name="item.icon" class="pr-1" color="secondary" />
            {{ t(`user.${item.name}`) }}
          </VaListItem>
          <VaListSeparator v-if="group.separator" class="mx-3 my-2" />
        </VaList>
      </VaDropdownContent>
    </VaDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useColors } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../../stores/auth'

const { colors, setHSLAColor } = useColors()
const hoverColor = computed(() => setHSLAColor(colors.focus, { a: 0.1 }))
const router = useRouter()
const authStore = useAuthStore()

const { t } = useI18n()

type ProfileListItem = {
  name: string
  to?: string
  href?: string
  icon: string
  itemKey?: string
}

// Type pour définir la structure des groupes de menu
type MenuItem = {
  name: string
  separator: boolean
  list: ProfileListItem[]
}

// Fonction de déconnexion
const handleLogout = () => {
  // Déconnecter l'utilisateur en utilisant le store
  authStore.logout()

  // Rediriger vers la page de connexion
  router.push({ name: 'login' })
}

// Définir les options du menu séparément de defineProps
const menuItems: MenuItem[] = [
  {
    name: 'account',
    separator: true,
    list: [
      {
        name: 'profile',
        to: 'preferences',
        icon: 'mso-account_circle',
      },
      {
        name: 'settings',
        to: 'settings',
        icon: 'mso-settings',
      },
      {
        name: 'billing',
        to: 'billing',
        icon: 'mso-receipt_long',
      },
      {
        name: 'projects',
        to: 'projects',
        icon: 'mso-favorite',
      },
    ],
  },
  {
    name: 'explore',
    separator: true,
    list: [
      {
        name: 'faq',
        to: 'faq',
        icon: 'mso-quiz',
      },
      {
        name: 'helpAndSupport',
        href: 'https://discord.gg/u7fQdqQt8c',
        icon: 'mso-error',
      },
    ],
  },
  {
    name: '',
    separator: false,
    list: [
      {
        name: 'logout',
        icon: 'mso-logout',
        itemKey: 'logout',
      },
    ],
  },
]

const isShown = ref(false)

const resolveLinkAttribute = (item: ProfileListItem) => {
  // Gérer l'action de déconnexion
  if (item.itemKey === 'logout') {
    return { onClick: handleLogout }
  }

  // Sinon, retourner les attributs de lien habituels
  return item.to ? { to: { name: item.to } } : item.href ? { href: item.href, target: '_blank' } : {}
}
</script>

<style lang="scss">
.profile-dropdown {
  cursor: pointer;

  &__content {
    .menu-item:hover {
      background: var(--hover-color);
    }
  }

  &__anchor {
    display: inline-block;
  }
}
</style>
