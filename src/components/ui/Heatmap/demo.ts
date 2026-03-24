import type { HeatmapData } from './UiHeatmap.vue'

/**
 * 生成模拟热力图数据
 * @param weeks 周数
 * @param density 数据密度 (0-1)
 */
export function generateDemoData(weeks: number = 24, density: number = 0.3): HeatmapData[] {
  const data: HeatmapData[] = []
  const now = new Date()

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      if (Math.random() < density) {
        const date = new Date(now)
        date.setDate(date.getDate() - (weeks - 1 - w) * 7 - (6 - d))

        data.push({
          week: w,
          day: d,
          level: Math.floor(Math.random() * 4) + 1,
          date: formatDate(date),
          value: Math.floor(Math.random() * 20) + 1,
        })
      }
    }
  }

  return data
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** 空数据集 */
export const emptyData: HeatmapData[] = []

/** 高活跃度数据集 */
export const highActivityData: HeatmapData[] = generateDemoData(24, 0.7)

/** 低活跃度数据集 */
export const lowActivityData: HeatmapData[] = generateDemoData(24, 0.15)

/** 中等活跃度数据集 */
export const mediumActivityData: HeatmapData[] = generateDemoData(24, 0.35)
