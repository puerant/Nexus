import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

// Mock md-editor-v3 模块 - 必须在组件导入之前
vi.mock('md-editor-v3', () => {
  const MockMdEditor = defineComponent({
    name: 'MdEditor',
    props: [
      'modelValue',
      'theme',
      'language',
      'previewOnly',
      'previewTheme',
      'codeTheme',
      'toolbars',
      'placeholder',
      'disabled',
      'maxLength',
      'autoFocus',
      'width',
      'height',
      'style',
    ],
    emits: ['update:modelValue', 'onSave', 'onUploadImg'],
    setup(props: any, { emit }: any) {
      return () =>
        h('div', { class: ['mock-md-editor', { 'is-disabled': props.disabled }] }, [
          h('textarea', {
            value: props.modelValue,
            placeholder: props.placeholder,
            disabled: props.disabled,
            onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLTextAreaElement).value),
          }),
        ])
    },
  })

  return {
    MdEditor: MockMdEditor,
    ToolbarNames: {},
  }
})

vi.mock('md-editor-v3/lib/style.css', () => ({}))

import UiMarkdownEditor from './UiMarkdownEditor.vue'

describe('UiMarkdownEditor', () => {
  describe('基础渲染', () => {
    it('应该正确渲染编辑器', () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '# Hello' },
      })

      expect(wrapper.find('.ui-markdown-editor').exists()).toBe(true)
      expect(wrapper.find('.mock-md-editor').exists()).toBe(true)
    })

    it('应该显示传入的内容', () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '# Test Content' },
      })

      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toBe('# Test Content')
    })

    it('应该显示占位符', () => {
      const placeholder = '请输入内容...'
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '', placeholder },
      })

      const textarea = wrapper.find('textarea')
      expect(textarea.element.placeholder).toBe(placeholder)
    })
  })

  describe('v-model 双向绑定', () => {
    it('应该在内容变化时触发 update:modelValue 事件', async () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '' },
      })

      const textarea = wrapper.find('textarea')
      await textarea.setValue('新内容')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['新内容'])
    })

    it('应该响应外部 modelValue 变化', async () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '初始内容' },
      })

      await wrapper.setProps({ modelValue: '更新后的内容' })

      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toBe('更新后的内容')
    })
  })

  describe('只读模式', () => {
    it('readonly=true 时应该禁用编辑器', () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '', readonly: true },
      })

      expect(wrapper.classes()).toContain('is-readonly')
      const textarea = wrapper.find('textarea')
      expect(textarea.element.disabled).toBe(true)
    })

    it('readonly=false 时应该允许编辑', () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '', readonly: false },
      })

      expect(wrapper.classes()).not.toContain('is-readonly')
      const textarea = wrapper.find('textarea')
      expect(textarea.element.disabled).toBe(false)
    })
  })

  describe('仅预览模式', () => {
    it('previewOnly=true 时应该添加 is-preview-only class', () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '# Test', previewOnly: true },
      })

      expect(wrapper.classes()).toContain('is-preview-only')
    })
  })

  describe('事件处理', () => {
    it('应该触发 save 事件', async () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '内容' },
      })

      // 模拟保存事件
      const mockMdEditor = wrapper.findComponent({ name: 'MdEditor' })
      await mockMdEditor.vm.$emit('onSave', '内容')

      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')?.[0]).toEqual(['内容'])
    })
  })

  describe('工具栏配置', () => {
    it('hideToolbar=true 时应该返回空工具栏', async () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '', hideToolbar: true },
      })

      // 工具栏应该为空数组
      const mockMdEditor = wrapper.findComponent({ name: 'MdEditor' })
      expect(mockMdEditor.props('toolbars')).toEqual([])
    })

    it('previewOnly=true 时应该返回空工具栏', async () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '', previewOnly: true },
      })

      const mockMdEditor = wrapper.findComponent({ name: 'MdEditor' })
      expect(mockMdEditor.props('toolbars')).toEqual([])
    })
  })

  describe('Props 默认值', () => {
    it('应该使用默认的中文语言设置', () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '' },
      })

      const mockMdEditor = wrapper.findComponent({ name: 'MdEditor' })
      expect(mockMdEditor.props('language')).toBe('zh-CN')
    })

    it('应该使用默认的 light 主题', () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '' },
      })

      const mockMdEditor = wrapper.findComponent({ name: 'MdEditor' })
      expect(mockMdEditor.props('theme')).toBe('light')
    })
  })

  describe('高度计算', () => {
    it('compact=true 时应该使用紧凑高度', () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '', compact: true },
      })

      const mockMdEditor = wrapper.findComponent({ name: 'MdEditor' })
      expect(mockMdEditor.props('style')).toEqual({ height: '300px' })
    })

    it('指定 height 时应该使用指定高度', () => {
      const wrapper = mount(UiMarkdownEditor, {
        props: { modelValue: '', height: '500px' },
      })

      const mockMdEditor = wrapper.findComponent({ name: 'MdEditor' })
      expect(mockMdEditor.props('style')).toEqual({ height: '500px' })
    })
  })
})
