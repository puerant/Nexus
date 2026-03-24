import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiHeatmap from './UiHeatmap.vue'
import type { HeatmapData } from './UiHeatmap.vue'

describe('UiHeatmap', () => {
  describe('基础渲染', () => {
    it('应该正确渲染默认周数 (24周 x 7天)', () => {
      const wrapper = mount(UiHeatmap, {
        props: { data: [] },
      })

      const columns = wrapper.findAll('.ui-heatmap__column')
      expect(columns).toHaveLength(24)

      const cells = wrapper.findAll('.ui-heatmap__cell')
      expect(cells).toHaveLength(24 * 7)
    })

    it('应该支持自定义周数', () => {
      const wrapper = mount(UiHeatmap, {
        props: { data: [], weeks: 12 },
      })

      const columns = wrapper.findAll('.ui-heatmap__column')
      expect(columns).toHaveLength(12)
    })

    it('应该支持自定义每天天数', () => {
      const wrapper = mount(UiHeatmap, {
        props: { data: [], daysPerWeek: 5 },
      })

      const firstColumn = wrapper.find('.ui-heatmap__column')
      const cells = firstColumn.findAll('.ui-heatmap__cell')
      expect(cells).toHaveLength(5)
    })
  })

  describe('数据显示', () => {
    it('应该根据数据设置正确的 level class', () => {
      const testData: HeatmapData[] = [
        { week: 0, day: 0, level: 1 },
        { week: 0, day: 1, level: 2 },
        { week: 0, day: 2, level: 3 },
        { week: 0, day: 3, level: 4 },
      ]

      const wrapper = mount(UiHeatmap, {
        props: { data: testData, weeks: 1 },
      })

      const cells = wrapper.findAll('.ui-heatmap__cell')
      expect(cells[0].classes()).toContain('ui-heatmap__cell--level-1')
      expect(cells[1].classes()).toContain('ui-heatmap__cell--level-2')
      expect(cells[2].classes()).toContain('ui-heatmap__cell--level-3')
      expect(cells[3].classes()).toContain('ui-heatmap__cell--level-4')
    })

    it('空数据单元格应该有 level-0 class', () => {
      const wrapper = mount(UiHeatmap, {
        props: { data: [], weeks: 1 },
      })

      const cell = wrapper.find('.ui-heatmap__cell')
      expect(cell.classes()).toContain('ui-heatmap__cell--level-0')
    })
  })

  describe('图例显示', () => {
    it('默认应该显示图例', () => {
      const wrapper = mount(UiHeatmap, {
        props: { data: [] },
      })

      expect(wrapper.find('.ui-heatmap__legend').exists()).toBe(true)
    })

    it('showLegend=false 应该隐藏图例', () => {
      const wrapper = mount(UiHeatmap, {
        props: { data: [], showLegend: false },
      })

      expect(wrapper.find('.ui-heatmap__legend').exists()).toBe(false)
    })

    it('应该显示自定义空数据文本', () => {
      const customText = '自定义空数据提示'
      const wrapper = mount(UiHeatmap, {
        props: { data: [], emptyText: customText },
      })

      expect(wrapper.find('.ui-heatmap__legend-label').text()).toBe(customText)
    })
  })

  describe('Tooltip', () => {
    it('空单元格 tooltip 应该显示 "无活动"', () => {
      const wrapper = mount(UiHeatmap, {
        props: { data: [], weeks: 1 },
      })

      const cell = wrapper.find('.ui-heatmap__cell')
      expect(cell.attributes('title')).toBe('无活动')
    })

    it('有数据单元格应该显示日期和值', () => {
      const testData: HeatmapData[] = [
        { week: 0, day: 0, level: 2, date: '2024-01-15', value: 10 },
      ]

      const wrapper = mount(UiHeatmap, {
        props: { data: testData, weeks: 1, valueUnit: '次提交' },
      })

      const cell = wrapper.find('.ui-heatmap__cell')
      expect(cell.attributes('title')).toBe('2024-01-15: 10 次提交')
    })

    it('没有 value 时应该显示活跃度等级', () => {
      const testData: HeatmapData[] = [
        { week: 0, day: 0, level: 3 },
      ]

      const wrapper = mount(UiHeatmap, {
        props: { data: testData, weeks: 1 },
      })

      const cell = wrapper.find('.ui-heatmap__cell')
      expect(cell.attributes('title')).toBe('3 级活跃度')
    })
  })

  describe('边界情况', () => {
    it('level 超过最大值应该被限制', () => {
      const testData: HeatmapData[] = [
        { week: 0, day: 0, level: 10 }, // 超过最大 level
      ]

      const wrapper = mount(UiHeatmap, {
        props: { data: testData, weeks: 1, levels: 5 },
      })

      const cell = wrapper.find('.ui-heatmap__cell')
      // level 10 应该被限制为 level-4 (levels-1)
      expect(cell.classes()).toContain('ui-heatmap__cell--level-4')
    })
  })
})
