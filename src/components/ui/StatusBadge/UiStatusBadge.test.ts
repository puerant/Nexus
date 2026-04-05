import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiStatusBadge from './UiStatusBadge.vue'

describe('UiStatusBadge', () => {
  describe('基础渲染', () => {
    it('应该渲染 span 元素', () => {
      const wrapper = mount(UiStatusBadge)
      expect(wrapper.element.tagName).toBe('SPAN')
    })

    it('应该包含 ui-status-badge class', () => {
      const wrapper = mount(UiStatusBadge)
      expect(wrapper.classes()).toContain('ui-status-badge')
    })

    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(UiStatusBadge, { slots: { default: '进行中' } })
      expect(wrapper.text()).toBe('进行中')
    })
  })

  describe('tone 色调', () => {
    it('默认应该使用 neutral tone', () => {
      const wrapper = mount(UiStatusBadge)
      expect(wrapper.classes()).toContain('ui-status-badge--neutral')
    })

    it('应该支持 info tone', () => {
      const wrapper = mount(UiStatusBadge, { props: { tone: 'info' } })
      expect(wrapper.classes()).toContain('ui-status-badge--info')
    })

    it('应该支持 success tone', () => {
      const wrapper = mount(UiStatusBadge, { props: { tone: 'success' } })
      expect(wrapper.classes()).toContain('ui-status-badge--success')
    })

    it('应该支持 warning tone', () => {
      const wrapper = mount(UiStatusBadge, { props: { tone: 'warning' } })
      expect(wrapper.classes()).toContain('ui-status-badge--warning')
    })
  })
})
