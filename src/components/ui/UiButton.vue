<template>
  <component :is="componentTag" v-bind="componentProps" :class="buttonClass">
    <span v-if="$slots.icon" class="ui-button__icon"><slot name="icon" /></span>
    <span v-if="$slots.default" class="ui-button__label"><slot /></span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw
    href?: string
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
    size?: 'sm' | 'md' | 'lg'
    block?: boolean
    iconOnly?: boolean
    disabled?: boolean
  }>(),
  {
    type: 'button',
    variant: 'secondary',
    size: 'md',
    block: false,
    iconOnly: false,
    disabled: false,
  },
)

const componentTag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})

const componentProps = computed(() => {
  if (props.to) {
    return { to: props.to }
  }
  if (props.href) {
    return { href: props.href, target: '_blank', rel: 'noreferrer' }
  }
  return { type: props.type, disabled: props.disabled }
})

const buttonClass = computed(() => [
  'ui-button',
  `ui-button--${props.variant}`,
  `ui-button--${props.size}`,
  {
    'ui-button--block': props.block,
    'ui-button--icon-only': props.iconOnly,
    'is-disabled': props.disabled,
  },
])
</script>

<style scoped>
.ui-button {
  --button-bg: var(--color-surface-raised);
  --button-text: var(--color-text-primary);
  --button-border: var(--color-border-soft);
  --button-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  border: 1px solid var(--button-border);
  border-radius: var(--radius-pill);
  background: var(--button-bg);
  color: var(--button-text);
  box-shadow: var(--button-shadow);
  text-decoration: none;
  font: inherit;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition:
    transform var(--motion-fast),
    background var(--motion-fast),
    border-color var(--motion-fast),
    color var(--motion-fast),
    box-shadow var(--motion-fast);
}

.ui-button:hover {
  transform: translateY(-1px);
}

.ui-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-accent) 20%, transparent);
}

.ui-button--sm {
  min-height: 2rem;
  padding: 0 0.8rem;
  font-size: 0.75rem;
}

.ui-button--md {
  min-height: 2.35rem;
  padding: 0 1rem;
  font-size: 0.8125rem;
}

.ui-button--lg {
  min-height: 2.8rem;
  padding: 0 1.2rem;
  font-size: 0.9375rem;
}

.ui-button--block {
  width: 100%;
}

.ui-button--icon-only {
  width: 2.5rem;
  padding: 0;
}

.ui-button--primary {
  --button-bg: var(--color-accent);
  --button-text: var(--color-accent-contrast);
  --button-border: color-mix(in oklab, var(--color-accent) 78%, black 10%);
  --button-shadow: var(--shadow-accent);
}

.ui-button--primary:hover {
  --button-bg: var(--color-accent-strong);
}

.ui-button--secondary {
  --button-bg: var(--color-surface-raised);
  --button-text: var(--color-text-primary);
}

.ui-button--ghost {
  --button-bg: transparent;
  --button-text: var(--color-text-secondary);
  --button-border: transparent;
}

.ui-button--ghost:hover {
  --button-bg: var(--color-surface-soft);
  --button-text: var(--color-text-primary);
}

.ui-button--danger {
  --button-bg: color-mix(in oklab, var(--color-danger) 90%, white 8%);
  --button-text: white;
  --button-border: color-mix(in oklab, var(--color-danger) 85%, black 8%);
}

.ui-button--link {
  --button-bg: transparent;
  --button-text: var(--color-accent);
  --button-border: transparent;
  padding-inline: 0;
}

.ui-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ui-button__label {
  display: inline-flex;
  align-items: center;
}

.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
