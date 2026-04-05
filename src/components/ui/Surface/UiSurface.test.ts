import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiSurface from './UiSurface.vue'

describe('UiSurface', () => {
  describe('基础渲染', () => {
    it('应该渲染 section 元素', () => {
      const wrapper = mount(UiSurface)
      expect(wrapper.element.tagName).toBe('SECTION')
    })

    it('应该包含 ui-surface class', () => {
      const wrapper = mount(UiSurface)
      expect(wrapper.classes()).toContain('ui-surface')
    })

    it('应该渲染默认插槽', () => {
      const wrapper = mount(UiSurface, { slots: { default: '<p>内容</p>' } })
      expect(wrapper.text()).toBe('内容')
    })
  })

  describe('tone 色调', () => {
    it('默认应该使用 default tone', () => {
      const wrapper = mount(UiSurface)
      expect(wrapper.classes()).toContain('ui-surface--default')
    })

    it('应该支持 muted tone', () => {
      const wrapper = mount(UiSurface, { props: { tone: 'muted' } })
      expect(wrapper.classes()).toContain('ui-surface--muted')
    })

    it('应该支持 accent tone', () => {
      const wrapper = mount(UiSurface, { props: { tone: 'accent' } })
      expect(wrapper.classes()).toContain('ui-surface--accent')
    })
  })

  describe('padding 内边距', () => {
    it('默认应该使用 md padding', () => {
      const wrapper = mount(UiSurface)
      expect(wrapper.classes()).toContain('ui-surface--padding-md')
    })

    it('应该支持 sm padding', () => {
      const wrapper = mount(UiSurface, { props: { padding: 'sm' } })
      expect(wrapper.classes()).toContain('ui-surface--padding-sm')
    })

    it('应该支持 lg padding', () => {
      const wrapper = mount(UiSurface, { props: { padding: 'lg' } })
      expect(wrapper.classes()).toContain('ui-surface--padding-lg')
    })
  })

  describe('rounded 圆角', () => {
    it('默认应该使用 xl rounded', () => {
      const wrapper = mount(UiSurface)
      expect(wrapper.classes()).toContain('ui-surface--rounded-xl')
    })

    it('应该支持 md rounded', () => {
      const wrapper = mount(UiSurface, { props: { rounded: 'md' } })
      expect(wrapper.classes()).toContain('ui-surface--rounded-md')
    })

    it('应该支持 lg rounded', () => {
      const wrapper = mount(UiSurface, { props: { rounded: 'lg' } })
      expect(wrapper.classes()).toContain('ui-surface--rounded-lg')
    })
  })

  describe('组合 props', () => {
    it('应该同时应用多个 props 的 class', () => {
      const wrapper = mount(UiSurface, {
        props: { tone: 'accent', padding: 'lg', rounded: 'md' },
      })
      expect(wrapper.classes()).toContain('ui-surface--accent')
      expect(wrapper.classes()).toContain('ui-surface--padding-lg')
      expect(wrapper.classes()).toContain('ui-surface--rounded-md')
    })
  })
})
