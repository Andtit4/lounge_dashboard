export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon?: string; adminOnly?: boolean }
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
        adminOnly: true,
      },
    },
    {
      name: 'users',
      displayName: 'menu.users',
      meta: {
        icon: 'group',
        adminOnly: true,
      },
      children: [
        {
          name: 'users',
          displayName: 'menu.users.list',
          meta: {},
        },
        {
          name: 'users-management',
          displayName: 'menu.users.management',
          meta: {},
        },
      ],
    },
    {
      name: 'subscription-history',
      displayName: 'menu.subscription-history',
      meta: {
        icon: 'history',
      },
    },
    {
      name: 'lounges-management',
      displayName: 'menu.lounges-management',
      meta: {
        icon: 'airline_seat_individual_suite',
        adminOnly: true,
      },
      children: [
        {
          name: 'lounges-list',
          displayName: 'menu.lounges.list',
          meta: {},
        },
        {
          name: 'lounges-create',
          displayName: 'menu.lounges.create',
          meta: {},
        },
        {
          name: 'lounges-analytics',
          displayName: 'menu.lounges.analytics',
          meta: {},
        },
      ],
    },
    {
      name: 'admin-bookings',
      displayName: 'menu.admin-bookings',
      meta: {
        icon: 'event_available',
        adminOnly: true,
      },
    },
    {
      name: 'lounges',
      displayName: 'menu.lounges',
      meta: {
        icon: 'airline_seat_individual_suite',
      },
    },
    {
      name: 'bookings',
      displayName: 'menu.bookings',
      meta: {
        icon: 'event_note',
      },
    },
    {
      name: 'preferences',
      displayName: 'menu.preferences',
      meta: {
        icon: 'manage_accounts',
      },
    },
    {
      name: 'settings',
      displayName: 'menu.settings',
      meta: {
        icon: 'settings',
      },
    },
  ] as INavigationRoute[],
}
