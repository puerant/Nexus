import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

// Mock injectSelectionScript 模块
vi.mock('./injectSelectionScript', () => ({
  prepareHtmlWithSelection: (html: string) => html + '<!-- injected -->',
}))

import IFramePreview from './IFramePreview.vue'

describe('IFramePreview', () => {
  describe('基础渲染', () => {
    it('应该渲染容器 div', () => {
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '<p>Hello</p>', selectionMode: false },
      })
      expect(wrapper.find('.iframe-preview').exists()).toBe(true)
    })

    it('应该渲染 iframe 元素', () => {
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '<p>Hello</p>', selectionMode: false },
      })
      const iframe = wrapper.find('iframe')
      expect(iframe.exists()).toBe(true)
      expect(iframe.classes()).toContain('iframe-preview__frame')
    })

    it('iframe 应该使用 sandbox 属性', () => {
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '<p>Hello</p>', selectionMode: false },
      })
      const iframe = wrapper.find('iframe')
      expect(iframe.attributes('sandbox')).toBe('allow-scripts allow-same-origin')
    })
  })

  describe('htmlContent 处理', () => {
    it('空内容时 srcdoc 应该为空', () => {
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '', selectionMode: false },
      })
      const iframe = wrapper.find('iframe')
      expect(iframe.attributes('srcdoc')).toBe('')
    })

    it('有内容时 srcdoc 应该经过 prepareHtmlWithSelection 处理', () => {
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '<p>Hello</p>', selectionMode: false },
      })
      const iframe = wrapper.find('iframe')
      expect(iframe.attributes('srcdoc')).toContain('<!-- injected -->')
    })

    it('内容变化时 srcdoc 应该更新', async () => {
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '<p>Old</p>', selectionMode: false },
      })

      await wrapper.setProps({ htmlContent: '<p>New</p>' })
      await nextTick()

      const iframe = wrapper.find('iframe')
      expect(iframe.attributes('srcdoc')).toContain('<p>New</p>')
    })
  })

  describe('selectionMode', () => {
    it('selectionMode=false 时不应该显示提示', () => {
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '<p>Test</p>', selectionMode: false },
      })
      expect(wrapper.find('.iframe-preview__hint').exists()).toBe(false)
    })

    it('selectionMode=true 时应该显示提示', () => {
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '<p>Test</p>', selectionMode: true },
      })
      expect(wrapper.find('.iframe-preview__hint').exists()).toBe(true)
      expect(wrapper.find('.iframe-preview__hint').text()).toBe('点击选取元素')
    })

    it('selectionMode 从 false 变为 true 时应该显示提示', async () => {
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '<p>Test</p>', selectionMode: false },
      })
      expect(wrapper.find('.iframe-preview__hint').exists()).toBe(false)

      await wrapper.setProps({ selectionMode: true })
      expect(wrapper.find('.iframe-preview__hint').exists()).toBe(true)
    })
  })

  describe('postMessage 通信', () => {
    let messageHandler: ((e: MessageEvent) => void) | null = null

    beforeEach(() => {
      messageHandler = null
      vi.spyOn(window, 'addEventListener').mockImplementation(
        (event: string, handler: EventListenerOrEventListenerObject) => {
          if (event === 'message') {
            messageHandler = handler as (e: MessageEvent) => void
          }
        },
      )
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('接收到 __element_selected__ 消息应该触发 element-selected 事件', async () => {
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '<p>Test</p>', selectionMode: false },
      })

      const elementData = {
        type: '__element_selected__',
        data: {
          tagName: 'div',
          id: 'test-id',
          className: 'test-class',
          cssSelector: '#test-id',
          outerHTML: '<div id="test-id">Test</div>',
          attributes: {},
          boundingRect: { top: 0, left: 0, width: 100, height: 50 },
        },
      }

      if (messageHandler) {
        messageHandler(new MessageEvent('message', { data: elementData }))
      }

      expect(wrapper.emitted('element-selected')).toBeTruthy()
      expect(wrapper.emitted('element-selected')?.[0][0]).toEqual(elementData.data)
    })

    it('忽略非 __element_selected__ 类型的消息', async () => {
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '<p>Test</p>', selectionMode: false },
      })

      if (messageHandler) {
        messageHandler(new MessageEvent('message', { data: { type: 'other_message' } }))
      }

      expect(wrapper.emitted('element-selected')).toBeFalsy()
    })
  })

  describe('生命周期', () => {
    it('卸载时应该移除 message 事件监听', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener')
      const wrapper = mount(IFramePreview, {
        props: { htmlContent: '<p>Test</p>', selectionMode: false },
      })

      wrapper.unmount()
      expect(removeSpy).toHaveBeenCalledWith('message', expect.any(Function))
    })
  })
})
