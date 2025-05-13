<template>
  <VaCard class="metric-card">
    <VaCardContent class="metric-card-content">
      <div class="metric-content">
        <div class="metric-icon-container" :style="{ backgroundColor: iconBackground, color: iconColor }">
          <slot name="icon"></slot>
        </div>

        <div class="metric-details">
          <div class="metric-value">{{ value }}</div>
          <div class="metric-title">{{ title }}</div>

          <div class="metric-trend">
            <span class="trend-indicator" :class="{ 'trend-up': up, 'trend-down': !up }" :style="{ color: trendColor }">
              <span class="trend-arrow">{{ up ? '↑' : '↓' }}</span>
              <span class="trend-value">{{ changeText }}</span>
            </span>
            <span class="trend-period">depuis le mois dernier</span>
          </div>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { VaCard } from 'vuestic-ui'

const props = defineProps<{
  title: string
  value: string | number
  changeText: string
  up: boolean
  iconBackground: string
  iconColor: string
  trendColor: string
}>()

const changeClass = computed(() => ({
  'text-success': props.up,
  'text-red-600': !props.up,
}))
</script>

<style scoped>
.metric-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.metric-card-content {
  padding: 1.25rem;
  height: 100%;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.metric-content {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  height: 100%;
}

.metric-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 14px;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.metric-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  height: 100%;
  min-height: 90px;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.25rem;
  color: var(--va-text-primary);
}

.metric-title {
  font-size: 0.95rem;
  color: var(--va-text-secondary);
  margin-bottom: 1rem;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  margin-top: auto;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 100px;
  background-color: rgba(0, 0, 0, 0.04);
}

.trend-up {
  background-color: rgba(75, 192, 128, 0.1);
}

.trend-down {
  background-color: rgba(255, 99, 132, 0.1);
}

.trend-arrow {
  font-size: 0.95rem;
}

.trend-value {
  letter-spacing: 0.5px;
}

.trend-period {
  color: var(--va-text-secondary);
}

@media (max-width: 992px) {
  .metric-card-content {
    padding: 1rem;
  }

  .metric-icon-container {
    width: 48px;
    height: 48px;
  }

  .metric-value {
    font-size: 1.5rem;
  }
}
</style>
