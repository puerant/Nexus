import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiPageIntro from './UiPageIntro.vue'

describe('UiPageIntro', () => {
  describe('基础渲染', () => {
    it('应该渲染 header 元素', () => {
      const wrapper = mount(UiPageIntro, { props: { title: '测试标题' } })
      expect(wrapper.element.tagName).toBe('HEADER')
    })

    it('应该渲染 title', () => {
      const wrapper = mount(UiPageIntro, { props: { title: '项目概览' } })
      expect(wrapper.find('.ui-page-intro__title').text()).toBe('项目概览')
    })

    it('title 是必填项', () => {
      const wrapper = mount(UiPageIntro, { props: { title: '标题' } })
      expect(wrapper.find('.ui-page-intro__title').exists()).toBe(true)
    })
  })

  describe('可选字段', () => {
    it('没有 eyebrow 时不应该渲染 eyebrow 元素', () => {
      const wrapper = mount(UiPageIntro, { props: { title: '标题' } })
      expect(wrapper.find('.ui-page-intro__eyebrow').exists()).toBe(false)
    })

    it('传入 eyebrow 应该渲染 eyebrow', () => {
      const wrapper = mount(UiPageIntro, {
        props: { title: '标题', eyebrow: '阶段标签' },
      })
      expect(wrapper.find('.ui-page-intro__eyebrow').text()).toBe('阶段标签')
    })

    it('没有 description 时不应该渲染描述', () => {
      const wrapper = mount(UiPageIntro, { props: { title: '标题' } })
      expect(wrapper.find('.ui-page-intro__description').exists()).toBe(false)
    })

    it('传入 description 应该渲染描述', () => {
      const wrapper = mount(UiPageIntro, {
        props: { title: '标题', description: '描述文本' },
      })
      expect(wrapper.find('.ui-page-intro__description').text()).toBe('描述文本')
    })
  })

  describe('插槽', () => {
    it('meta 插槽应该渲染在 __meta 区域', () => {
      const wrapper = mount(UiPageIntro, {
        props: { title: '标题' },
        slots: { meta: '<span class="test-meta">Meta</span>' },
      })
      expect(wrapper.find('.ui-page-intro__meta .test-meta').exists()).toBe(true)
    })

    it('aside 插槽应该渲染在 __aside 区域', () => {
      const wrapper = mount(UiPageIntro, {
        props: { title: '标题' },
        slots: { aside: '<div class="test-aside">操作区</div>' },
      })
      expect(wrapper.find('.ui-page-intro__aside .test-aside').exists()).toBe(true)
    })

    it('没有 aside 插槽时不应该渲染 __aside 区域', () => {
      const wrapper = mount(UiPageIntro, { props: { title: '标题' } })
      expect(wrapper.find('.ui-page-intro__aside').exists()).toBe(false)
    })
  })
})
