



## 前端UI
1. 用组件化的思维写前端页面， 而不是一口气写完一整个页面，页面拆分成可复用组件
2. 通用的组件放在src/components里，单独的页面组件放在views/xxx/components里
3. 每个页面用一个大写文件夹表示，然后内容写在index.vue里，例如views/Config/index.vue
3. 前端样式，需要做基础的定调例如通用的颜色Color，按钮Button，图标icon，排版Typography，字体font，链接Link等，然后再此基础上封装组件，绘制页面