import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock @iconify/vue
vi.mock('@iconify/vue', () => ({
  Icon: {
    name: 'Icon',
    template: '<span class="mock-icon">{{ icon }}</span>',
    props: ['icon'],
  },
}))

import UiIcon from './UiIcon.vue'

describe('UiIcon', () => {
  describe('基础渲染', () => {
    it('应该渲染 span 元素', () => {
      const wrapper = mount(UiIcon, { props: { icon: 'mdi:home' } })
      expect(wrapper.element.tagName).toBe('SPAN')
    })

    it('应该包含 ui-icon class', () => {
      const wrapper = mount(UiIcon, { props: { icon: 'mdi:home' } })
      expect(wrapper.classes()).toContain('ui-icon')
    })

    it('应该将 icon prop 传递给 Icon 组件', () => {
      const wrapper = mount(UiIcon, { props: { icon: 'mdi:check' } })
      expect(wrapper.find('.mock-icon').text()).toBe('mdi:check')
    })
  })

  describe('size 尺寸', () => {
    it('不传 size 时不应该有 size class', () => {
      const wrapper = mount(UiIcon, { props: { icon: 'mdi:home' } })
      expect(wrapper.classes()).not.toContain('ui-icon--undefined')
      expect(wrapper.classes().some(c => c.startsWith('ui-icon--'))).toBe(false)
    })

    it('应该支持 sm size', () => {
      const wrapper = mount(UiIcon, { props: { icon: 'mdi:home', size: 'sm' } })
      expect(wrapper.classes()).toContain('ui-icon--sm')
    })

    it('应该支持 lg size', () => {
      const wrapper = mount(UiIcon, { props: { icon: 'mdi:home', size: 'lg' } })
      expect(wrapper.classes()).toContain('ui-icon--lg')
    })
  })
})
