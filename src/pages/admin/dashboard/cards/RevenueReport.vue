<template>
  <VaCard class="revenue-card">
    <VaCardTitle class="revenue-card-header">
      <h1 class="revenue-title">Revenue Report</h1>
      <div class="revenue-controls">
        <VaSelect v-model="selectedMonth" preset="small" :options="monthsWithCurrentYear" class="month-select" />
        <VaButton size="small" preset="primary" class="export-button" @click="exportAsCSV">Export</VaButton>
      </div>
    </VaCardTitle>
    <VaCardContent class="revenue-card-content">
      <section class="revenue-info">
        <div class="total-earnings">
          <p class="earnings-value">{{ formatMoney(totalEarnings) }}</p>
          <p class="earnings-label">Total earnings</p>
        </div>
        <div class="earnings-breakdown">
          <div class="earnings-item">
            <div class="item-header">
              <span class="color-indicator" :style="{ backgroundColor: earningsColor }"></span>
              <span class="item-label">Earnings this month</span>
            </div>
            <div class="item-value">{{ formatMoney(earningsForSelectedMonth.earning) }}</div>
          </div>
          <div class="earnings-item">
            <div class="item-header">
              <span class="color-indicator" :style="{ backgroundColor: expensesColor }"></span>
              <span class="item-label">Expense this month</span>
            </div>
            <div class="item-value">{{ formatMoney(earningsForSelectedMonth.expenses) }}</div>
          </div>
        </div>
      </section>
      <div class="chart-container">
        <RevenueReportChart class="revenue-chart" :revenues="revenues" :months="months" />
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { VaCard } from 'vuestic-ui'
import RevenueReportChart from './RevenueReportChart.vue'
import { downloadAsCSV } from '../../../../services/toCSV'
import {
  earningsColor,
  expensesColor,
  months,
  generateRevenues,
  getRevenuePerMonth,
  formatMoney,
} from '../../../../data/charts/revenueChartData'

const revenues = generateRevenues(months)

const currentYear = new Date().getFullYear()
const monthsWithCurrentYear = months.map((month) => `${month} ${currentYear}`)

const selectedMonth = ref(monthsWithCurrentYear[0])

const earningsForSelectedMonth = computed(() => getRevenuePerMonth(selectedMonth.value.split(' ')[0], revenues))
const totalEarnings = computed(() => {
  return earningsForSelectedMonth.value.earning + earningsForSelectedMonth.value.expenses
})

const exportAsCSV = () => {
  downloadAsCSV(revenues, 'revenue-report')
}
</script>

<style scoped>
.revenue-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.revenue-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.revenue-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.revenue-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.month-select {
  min-width: 130px;
}

.revenue-card-content {
  display: flex;
  height: 100%;
  padding: 1.5rem;
}

.revenue-info {
  display: flex;
  flex-direction: column;
  width: 25%;
  padding-right: 1.5rem;
}

.total-earnings {
  margin-bottom: 2rem;
}

.earnings-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--va-text-primary);
}

.earnings-label {
  font-size: 0.9rem;
  color: var(--va-text-secondary);
}

.earnings-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.earnings-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.item-label {
  font-size: 0.9rem;
  color: var(--va-text-secondary);
}

.item-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--va-text-primary);
}

.chart-container {
  width: 75%;
  height: 100%;
  min-height: 300px;
}

.revenue-chart {
  height: 100%;
  width: 100%;
}

@media (max-width: 1200px) {
  .revenue-info {
    width: 30%;
  }

  .chart-container {
    width: 70%;
  }
}

@media (max-width: 992px) {
  .revenue-card-content {
    flex-direction: column;
  }

  .revenue-info {
    width: 100%;
    padding-right: 0;
    padding-bottom: 1.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    flex-direction: row;
    gap: 2rem;
  }

  .total-earnings {
    margin-bottom: 0;
  }

  .chart-container {
    width: 100%;
    min-height: 250px;
  }
}

@media (max-width: 768px) {
  .revenue-card-header {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .revenue-card-content {
    padding: 1rem;
  }

  .revenue-info {
    flex-direction: column;
    gap: 1.5rem;
  }

  .chart-container {
    min-height: 200px;
  }
}
</style>
