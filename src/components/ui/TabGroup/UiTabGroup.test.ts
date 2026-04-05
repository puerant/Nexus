import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock UiIcon 依赖
vi.mock('../Icon', () => ({
  UiIcon: {
    name: 'UiIcon',
    template: '<span class="mock-icon">{{ icon }}</span>',
    props: ['icon', 'size'],
  },
}))

import UiTabGroup from './UiTabGroup.vue'
import type { TabItem } from './UiTabGroup.vue'

const sampleTabs: TabItem[] = [
  { key: 'tab1', label: '标签一' },
  { key: 'tab2', label: '标签二' },
  { key: 'tab3', label: '标签三' },
]

const iconTabs: TabItem[] = [
  { key: 'home', label: '首页', icon: 'mdi:home' },
  { key: 'settings', label: '设置', icon: 'mdi:cog' },
]

describe('UiTabGroup', () => {
  describe('基础渲染', () => {
    it('应该渲染容器', () => {
      const wrapper = mount(UiTabGroup, {
        props: { tabs: sampleTabs, modelValue: 'tab1' },
      })
      expect(wrapper.find('.ui-tab-group').exists()).toBe(true)
    })

    it('应该渲染所有 tab 按钮', () => {
      const wrapper = mount(UiTabGroup, {
        props: { tabs: sampleTabs, modelValue: 'tab1' },
      })
      const buttons = wrapper.findAll('.ui-tab-group__tab')
      expect(buttons).toHaveLength(3)
    })

    it('应该渲染 tab 的 label 文本', () => {
      const wrapper = mount(UiTabGroup, {
        props: { tabs: sampleTabs, modelValue: 'tab1' },
      })
      const buttons = wrapper.findAll('.ui-tab-group__tab')
      expect(buttons[0].text()).toContain('标签一')
      expect(buttons[1].text()).toContain('标签二')
      expect(buttons[2].text()).toContain('标签三')
    })

    it('应该渲染默认插槽', () => {
      const wrapper = mount(UiTabGroup, {
        props: { tabs: sampleTabs, modelValue: 'tab1' },
        slots: { default: '<div class="panel-content">面板内容</div>' },
      })
      expect(wrapper.find('.panel-content').exists()).toBe(true)
    })
  })

  describe('激活状态', () => {
    it('modelValue 对应的 tab 应该有 active class', () => {
      const wrapper = mount(UiTabGroup, {
        props: { tabs: sampleTabs, modelValue: 'tab2' },
      })
      const buttons = wrapper.findAll('.ui-tab-group__tab')
      expect(buttons[0].classes()).not.toContain('ui-tab-group__tab--active')
      expect(buttons[1].classes()).toContain('ui-tab-group__tab--active')
      expect(buttons[2].classes()).not.toContain('ui-tab-group__tab--active')
    })

    it('切换 modelValue 应该更新 active class', async () => {
      const wrapper = mount(UiTabGroup, {
        props: { tabs: sampleTabs, modelValue: 'tab1' },
      })

      await wrapper.setProps({ modelValue: 'tab3' })

      const buttons = wrapper.findAll('.ui-tab-group__tab')
      expect(buttons[0].classes()).not.toContain('ui-tab-group__tab--active')
      expect(buttons[2].classes()).toContain('ui-tab-group__tab--active')
    })
  })

  describe('点击切换', () => {
    it('点击 tab 应该触发 update:modelValue 事件', async () => {
      const wrapper = mount(UiTabGroup, {
        props: { tabs: sampleTabs, modelValue: 'tab1' },
      })

      const buttons = wrapper.findAll('.ui-tab-group__tab')
      await buttons[1].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['tab2'])
    })
  })

  describe('带图标的 tab', () => {
    it('tab 有 icon 时应该渲染 UiIcon', () => {
      const wrapper = mount(UiTabGroup, {
        props: { tabs: iconTabs, modelValue: 'home' },
      })

      const icons = wrapper.findAll('.mock-icon')
      expect(icons).toHaveLength(2)
      expect(icons[0].text()).toBe('mdi:home')
      expect(icons[1].text()).toBe('mdi:cog')
    })

    it('tab 无 icon 时不应该渲染 UiIcon', () => {
      const wrapper = mount(UiTabGroup, {
        props: { tabs: sampleTabs, modelValue: 'tab1' },
      })
      expect(wrapper.find('.mock-icon').exists()).toBe(false)
    })
  })

  describe('TabItem 类型', () => {
    it('应该支持只有 key 和 label 的 tab', () => {
      const minimalTabs: TabItem[] = [
        { key: 'a', label: 'A' },
      ]
      const wrapper = mount(UiTabGroup, {
        props: { tabs: minimalTabs, modelValue: 'a' },
      })
      expect(wrapper.findAll('.ui-tab-group__tab')).toHaveLength(1)
    })
  })
})
