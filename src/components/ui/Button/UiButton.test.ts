import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import UiButton from './UiButton.vue'

describe('UiButton', () => {
  describe('基础渲染', () => {
    it('应该渲染为 button 元素', () => {
      const wrapper = mount(UiButton)
      expect(wrapper.element.tagName).toBe('BUTTON')
    })

    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(UiButton, { slots: { default: '点击我' } })
      expect(wrapper.text()).toBe('点击我')
    })

    it('应该渲染 icon 插槽', () => {
      const wrapper = mount(UiButton, {
        slots: { icon: '<span class="test-icon">✓</span>' },
      })
      expect(wrapper.find('.test-icon').exists()).toBe(true)
    })
  })

  describe('variant 样式', () => {
    it('默认应该使用 secondary variant', () => {
      const wrapper = mount(UiButton)
      expect(wrapper.classes()).toContain('ui-button--secondary')
    })

    it('应该支持 primary variant', () => {
      const wrapper = mount(UiButton, { props: { variant: 'primary' } })
      expect(wrapper.classes()).toContain('ui-button--primary')
    })

    it('应该支持 ghost variant', () => {
      const wrapper = mount(UiButton, { props: { variant: 'ghost' } })
      expect(wrapper.classes()).toContain('ui-button--ghost')
    })

    it('应该支持 danger variant', () => {
      const wrapper = mount(UiButton, { props: { variant: 'danger' } })
      expect(wrapper.classes()).toContain('ui-button--danger')
    })

    it('应该支持 link variant', () => {
      const wrapper = mount(UiButton, { props: { variant: 'link' } })
      expect(wrapper.classes()).toContain('ui-button--link')
    })
  })

  describe('size 尺寸', () => {
    it('默认应该使用 md size', () => {
      const wrapper = mount(UiButton)
      expect(wrapper.classes()).toContain('ui-button--md')
    })

    it('应该支持 sm size', () => {
      const wrapper = mount(UiButton, { props: { size: 'sm' } })
      expect(wrapper.classes()).toContain('ui-button--sm')
    })

    it('应该支持 lg size', () => {
      const wrapper = mount(UiButton, { props: { size: 'lg' } })
      expect(wrapper.classes()).toContain('ui-button--lg')
    })
  })

  describe('链接渲染', () => {
    it('传入 to prop 应该渲染为 RouterLink', () => {
      const wrapper = mount(UiButton, {
        props: { to: '/test' },
        global: { stubs: { RouterLink: true } },
      })
      expect(wrapper.findComponent({ name: 'RouterLink' }).exists()).toBe(true)
    })

    it('传入 href prop 应该渲染为 <a> 元素', () => {
      const wrapper = mount(UiButton, {
        props: { href: 'https://example.com' },
      })
      expect(wrapper.element.tagName).toBe('A')
      expect(wrapper.attributes('href')).toBe('https://example.com')
      expect(wrapper.attributes('target')).toBe('_blank')
    })
  })

  describe('disabled 状态', () => {
    it('disabled 时应该添加 is-disabled class', () => {
      const wrapper = mount(UiButton, { props: { disabled: true } })
      expect(wrapper.classes()).toContain('is-disabled')
    })

    it('disabled 时 button 应该有 disabled 属性', () => {
      const wrapper = mount(UiButton, { props: { disabled: true } })
      expect(wrapper.attributes('disabled')).toBeDefined()
    })
  })

  describe('block 模式', () => {
    it('block=true 应该添加 ui-button--block class', () => {
      const wrapper = mount(UiButton, { props: { block: true } })
      expect(wrapper.classes()).toContain('ui-button--block')
    })
  })

  describe('iconOnly 模式', () => {
    it('iconOnly=true 应该添加 ui-button--icon-only class', () => {
      const wrapper = mount(UiButton, { props: { iconOnly: true } })
      expect(wrapper.classes()).toContain('ui-button--icon-only')
    })
  })
})
