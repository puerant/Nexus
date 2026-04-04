所有回答均使用中文，所有代码的中文不能乱码



## 前端UI
1. 用组件化的思维写前端页面， 而不是一口气写完一整个页面，页面拆分成可复用组件
2. 通用的组件放在src/components里，单独的页面组件放在views/xxx/components里
3. 每个页面用一个大写文件夹表示，然后内容写在index.vue里，例如views/Config/index.vue
4. 前端样式，需要做基础的定调例如通用的颜色Color，按钮Button，图标icon，排版Typography，字体font，链接Link等，然后再此基础上封装组件，绘制页面
5. 前端样式使用 @frontend-design skill设计

## UI 组件文件组织规范

通用 UI 组件（`src/components/ui/`）采用**文件夹模块化**组织方式：

```
src/components/ui/
├── Button/
│   ├── UiButton.vue          # 组件实现
│   ├── UiButton.test.ts      # 组件测试
│   ├── index.ts              # 导出
│   └── demo.ts               # 演示数据（可选）
├── Heatmap/
│   ├── UiHeatmap.vue
│   ├── UiHeatmap.test.ts
│   ├── index.ts
│   └── demo.ts
├── MarkdownEditor/
│   ├── UiMarkdownEditor.vue
│   ├── UiMarkdownEditor.test.ts
│   └── index.ts
├── TabGroup/
│   ├── UiTabGroup.vue
│   └── index.ts
└── ...
```

### 命名规范
- **文件夹名称**：PascalCase，不带 `Ui` 前缀（如 `Heatmap`、`MarkdownEditor`）
- **组件文件**：带 `Ui` 前缀（如 `UiHeatmap.vue`、`UiMarkdownEditor.vue`）
- **测试文件**：与组件同名 + `.test.ts`（如 `UiHeatmap.test.ts`）
- **索引文件**：`index.ts`

### index.ts 模板
```typescript
// 导出默认组件
export { default as UiXxx } from './UiXxx.vue'
// 导出类型（如有）
export type { Props as UiXxxProps } from './UiXxx.vue'
// 导出演示数据（如有）
export { generateDemoData } from './demo'
```

### 使用方式
```typescript
// 推荐：从模块目录导入
import { UiHeatmap, UiMarkdownEditor } from '@/components/ui/Heatmap'
import { UiMarkdownEditor } from '@/components/ui/MarkdownEditor'

// 不推荐：直接导入 .vue 文件
import UiHeatmap from '@/components/ui/Heatmap/UiHeatmap.vue'
```

