 <template>
  <span class="ui-icon" :class="size ? `ui-icon--${size}` : ''">
    <Icon :icon="icon" />
  </span>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  icon: string
  size?: 'sm' | 'md' | 'lg'
  inline?: boolean
}>()
</script>

<style scoped>
.ui-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  vertical-align: middle;
}

.ui-icon :deep(svg) {
  width: 100%;
    height: 100%;
}

.ui-icon--sm { width: 0.875rem; height: 0.875rem; font-size: 0.875rem;}
.ui-icon--md { width: 1rem; height: 1rem; font-size: 1rem;
}
.ui-icon--lg { width: 1.25rem;
  height: 1.25rem;
  font-size: 1.25rem;
}
</style>
