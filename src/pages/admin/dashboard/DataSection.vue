<template>
  <div class="metrics-grid">
    <DataSectionItem
      v-for="metric in dashboardMetrics"
      :key="metric.id"
      :title="metric.title"
      :value="metric.value"
      :change-text="metric.changeText"
      :up="metric.changeDirection === 'up'"
      :icon-background="metric.iconBackground"
      :icon-color="metric.iconColor"
      :trend-color="metric.trendColor"
    >
      <template #icon>
        <VaIcon :name="metric.icon" size="large" />
      </template>
    </DataSectionItem>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useColors } from 'vuestic-ui'
import DataSectionItem from './DataSectionItem.vue'

interface DashboardMetric {
  id: string
  title: string
  value: string
  icon: string
  changeText: string
  changeDirection: 'up' | 'down'
  iconBackground: string
  iconColor: string
  trendColor: string
}

const { getColor } = useColors()

const dashboardMetrics = computed<DashboardMetric[]>(() => [
  {
    id: 'openInvoices',
    title: 'Open invoices',
    value: '$35,548',
    icon: 'mso-attach_money',
    changeText: '$1,450',
    changeDirection: 'down',
    iconBackground: getColor('success'),
    iconColor: getColor('on-success'),
    trendColor: getColor('danger'),
  },
  {
    id: 'ongoingProjects',
    title: 'Ongoing project',
    value: '15',
    icon: 'mso-folder_open',
    changeText: '25.36%',
    changeDirection: 'up',
    iconBackground: getColor('info'),
    iconColor: getColor('on-info'),
    trendColor: getColor('success'),
  },
  {
    id: 'employees',
    title: 'Employees',
    value: '25',
    icon: 'mso-account_circle',
    changeText: '2.5%',
    changeDirection: 'up',
    iconBackground: getColor('danger'),
    iconColor: getColor('on-danger'),
    trendColor: getColor('success'),
  },
  {
    id: 'newProfit',
    title: 'New profit',
    value: '27%',
    icon: 'mso-grade',
    changeText: '4%',
    changeDirection: 'up',
    iconBackground: getColor('warning'),
    iconColor: getColor('on-warning'),
    trendColor: getColor('success'),
  },
])
</script>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

/* Option supplémentaire pour assurer des dimensions cohérentes */
:deep(.va-card) {
  height: 100%;
}

/* Breakpoints correspondant aux modifications du dashboard principal */
@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

@media (max-width: 992px) {
  .metrics-grid {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    gap: 1.25rem;
  }
}

@media (max-width: 576px) {
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
