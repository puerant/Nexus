<template>
  <header class="ui-page-intro">
    <div class="ui-page-intro__copy">
      <div v-if="eyebrow" class="ui-page-intro__eyebrow">{{ eyebrow }}</div>
      <h1 class="ui-page-intro__title">{{ title }}</h1>
      <p v-if="description" class="ui-page-intro__description">{{ description }}</p>
      <div v-if="$slots.meta" class="ui-page-intro__meta"><slot name="meta" /></div>
    </div>
    <div v-if="$slots.aside" class="ui-page-intro__aside"><slot name="aside" /></div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<style scoped>
.ui-page-intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
}

.ui-page-intro__copy {
  min-width: 0;
  max-width: 44rem;
}

.ui-page-intro__eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 0.38rem 0.7rem;
  margin-bottom: 0.8rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.ui-page-intro__title {
  font-size: var(--type-display-sm);
  line-height: 1.02;
  letter-spacing: -0.045em;
}

.ui-page-intro__description {
  margin-top: 0.7rem;
  color: var(--color-text-secondary);
  font-size: var(--type-body-md);
  line-height: 1.65;
}

.ui-page-intro__meta {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.ui-page-intro__aside {
  flex-shrink: 0;
}

@media (max-width: 960px) {
  .ui-page-intro {
    flex-direction: column;
  }
}
</style>
