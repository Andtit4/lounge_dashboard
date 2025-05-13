<script lang="ts" setup>
import RevenueUpdates from './cards/RevenueReport.vue'
import ProjectTable from './cards/ProjectTable.vue'
import RevenueByLocationMap from './cards/RevenueByLocationMap.vue'
import DataSection from './DataSection.vue'
import YearlyBreakup from './cards/YearlyBreakup.vue'
import MonthlyEarnings from './cards/MonthlyEarnings.vue'
import RegionRevenue from './cards/RegionRevenue.vue'
import Timeline from './cards/Timeline.vue'
</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1 class="dashboard-title">Dashboard</h1>
      <p class="dashboard-subtitle">Vue d'ensemble de l'activité et des performances</p>
    </header>

    <!-- Section des métriques clés -->
    <DataSection class="metrics-section" />

    <!-- Section principale - Revenus et graphiques -->
    <div class="main-charts-section">
      <div class="revenue-container">
        <RevenueUpdates class="revenue-chart" />
      </div>
      <div class="summary-container">
        <YearlyBreakup class="yearly-breakup" />
        <MonthlyEarnings class="monthly-earnings" />
      </div>
    </div>

    <!-- Section des données par emplacement -->
    <div class="location-section">
      <RevenueByLocationMap class="location-map" />
      <RegionRevenue class="region-revenue" />
    </div>

    <!-- Section des projets et de la chronologie -->
    <div class="projects-section">
      <ProjectTable class="project-table" />
      <Timeline class="timeline" />
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: var(--va-background);
}

.dashboard-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dashboard-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  font-size: 1rem;
  color: var(--va-text-secondary);
}

.metrics-section {
  margin-bottom: 2rem;
}

.main-charts-section {
  display: grid;
  grid-template-columns: 70% 30%;
  gap: 1.5rem;
  margin-bottom: 2rem;
  min-height: 400px;
}

.revenue-container {
  height: 100%;
}

.revenue-chart {
  height: 100%;
}

.summary-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.yearly-breakup,
.monthly-earnings {
  flex: 1;
}

.location-section {
  display: grid;
  grid-template-columns: 70% 30%;
  gap: 1.5rem;
  margin-bottom: 2rem;
  min-height: 350px;
}

.location-map,
.region-revenue {
  height: 100%;
}

.projects-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1rem;
  min-height: 350px;
}

.project-table,
.timeline {
  height: 100%;
}

/* Responsive layout */
@media (max-width: 1200px) {
  .main-charts-section {
    grid-template-columns: 65% 35%;
  }

  .location-section {
    grid-template-columns: 65% 35%;
  }
}

@media (max-width: 992px) {
  .dashboard-container {
    gap: 2rem;
  }

  .main-charts-section,
  .location-section,
  .projects-section {
    grid-template-columns: 1fr;
    gap: 2rem;
    min-height: auto;
  }

  .revenue-container,
  .location-map,
  .project-table,
  .timeline {
    min-height: 300px;
  }

  .summary-container {
    flex-direction: row;
    min-height: 200px;
  }

  .yearly-breakup,
  .monthly-earnings {
    width: 50%;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
    gap: 1.5rem;
  }

  .dashboard-header {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }

  .metrics-section {
    margin-bottom: 1.5rem;
  }

  .main-charts-section,
  .location-section,
  .projects-section {
    gap: 1.5rem;
  }

  .summary-container {
    flex-direction: column;
    gap: 1.5rem;
  }

  .yearly-breakup,
  .monthly-earnings {
    width: 100%;
    min-height: 200px;
  }
}

@media (max-width: 576px) {
  .dashboard-title {
    font-size: 1.5rem;
  }

  .dashboard-subtitle {
    font-size: 0.9rem;
  }
}
</style>
