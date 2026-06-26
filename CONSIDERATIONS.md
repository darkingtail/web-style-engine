# web-style-engine 需要考虑的场景与能力

## 1. 项目定位

`web-style-engine` 是一个面向 Web UI 的框架无关样式引擎。

它的目标不是绑定某一个前端框架，也不是绑定某一个设计系统，而是把样式引擎的底层能力从 `antdv-style` 中下沉出来，形成一个可被 Vue、React、Solid 等框架适配层，以及 antdv、antd、Arco、Naive UI、Element Plus、自研设计系统等上层集成复用的基础库。

推荐定位：

> A framework-agnostic style engine for Web UI.

中文：

> 一个面向 Web UI 的框架无关样式引擎。

需要明确：

```txt
framework-agnostic ≠ platform-agnostic
```

`web-style-engine` 不追求覆盖 React Native、Flutter、iOS、Android、terminal UI 等非 Web 平台。它主要服务：

- 桌面 Web
- 移动 Web
- H5
- WebView
- SSR
- Shadow DOM
- iframe
- 浏览器插件 UI
- 微前端
- 低代码 / 可视化编辑器

---

## 2. 总体分层

建议按四层理解：

```txt
Layer 1：Style Engine Core
Layer 2：Renderer / Runtime Adapter
Layer 3：Framework Adapter
Layer 4：Design System Adapter
```

更具体：

```txt
通用样式引擎核心
  ↓
DOM / SSR / Noop renderer
  ↓
Vue / React / Solid / Svelte / Lit adapter
  ↓
antdv-style / antd-style / Arco style / 自研设计系统 adapter
```

`antdv-style` 未来可以变成：

```txt
antdv-style = web-style-engine + Vue adapter + antdv-next token adapter
```

---

## 3. 最关键的场景 Top 10

如果只保留最核心的优先级，建议先重点考虑这 10 个：

1. Shadow DOM / Web Components
2. iframe / 多 document
3. CSP nonce
4. SSR extraction + hydration
5. 多实例 / 微前端隔离
6. H5 rem/vw transformer + WebView 兼容
7. CSS variables / token scoped injection
8. insertion point / style order
9. debug labels / DevTools 体验
10. memory cleanup / dispose / flush

这 10 个点会直接影响底层架构，不宜后补。

---

## 4. 详细考虑点

### 4.1 Shadow DOM / Web Components

不能默认所有样式都注入 `document.head`。

Web Components 和 Shadow DOM 场景需要支持：

```ts
createStyleEngine({
  container: shadowRoot,
})
```

或者：

```ts
createDOMRenderer({
  container: shadowRoot,
})
```

需要考虑：

- ShadowRoot 样式隔离
- 多 ShadowRoot 多实例
- style tag 插入位置
- 与 CSS variables 的 scope 关系

---

### 4.2 iframe / 多 document

iframe 场景下不能使用当前 window 的 `document.head`。

需要支持：

```ts
createStyleEngine({
  container: iframe.contentDocument!.head,
})
```

同时 responsive / media query 也应该能注入环境：

```ts
createResponsiveObserver(responsive, {
  matchMedia: iframe.contentWindow!.matchMedia,
})
```

适用场景：

- 低代码平台
- 可视化编辑器
- iframe 沙箱
- 嵌入式 SDK
- 微前端

---

### 4.3 浏览器插件 / Extension UI

Chrome Extension / Edge Extension 场景有特殊约束：

- CSP 严格
- popup 和 content script 是不同 document
- content script 常使用 Shadow DOM 隔离
- style 注入环境复杂

需要预留：

```ts
createStyleEngine({
  container,
  nonce,
  insertionPoint,
})
```

---

### 4.4 CSP / nonce

企业系统常配置 CSP：

```http
Content-Security-Policy: style-src 'nonce-xxx'
```

动态创建的 style tag 需要：

```html
<style nonce="xxx">
```

所以 renderer 应支持：

```ts
createStyleEngine({
  nonce: 'xxx',
})
```

同时要避免框架 adapter 在 CSP 场景下强依赖 inline style attribute。

---

### 4.5 多租户 / 多实例隔离

通用样式引擎必须支持多实例：

```ts
const engineA = createStyleEngine({ key: 'app-a' })
const engineB = createStyleEngine({ key: 'app-b' })
```

需要隔离：

- cache
- className prefix
- style tag
- insertion order
- SSR extraction
- theme context
- CSS variable scope

这对微前端、多主题、多应用嵌入很关键。

---

### 4.6 CSS Cascade Layers

现代 CSS 中 `@layer` 可以更系统地控制样式优先级。

可以预留：

```ts
createStyleEngine({
  layer: 'app',
})
```

或：

```ts
engine.css({
  layer: 'components',
  style: {},
})
```

输出：

```css
@layer components {
  .xxx {}
}
```

这可以作为比单纯 hashPriority 更现代的优先级控制方式。

---

### 4.7 specificity 控制 / `:where()`

`antdv-style` 当前已有类似 `hashPriority: low` 的需求。

底层可以抽象为：

```ts
createStyleEngine({
  specificity: 'normal' | 'low' | 'high',
})
```

其中 low 可以考虑用：

```css
:where(.className)
```

但 H5 / WebView 兼容性要考虑，因此必须允许关闭或降级。

---

### 4.8 CSS Variables / Token 输出

CSS variables 应成为一级能力。

需要考虑：

- token flatten
- token to CSS vars
- prefix
- scope selector
- fallback value
- dark/light mode
- nested theme
- SSR extraction

示例：

```ts
engine.vars({
  colorPrimary: '#1677ff',
})
```

输出：

```css
:root {
  --app-color-primary: #1677ff;
}
```

也要支持局部 scope：

```ts
engine.vars('.theme-dark', darkToken)
```

---

### 4.9 主题隔离 / 嵌套主题

同一个页面可能存在多个主题区域：

```html
<div class="theme-a">
  <Button />
</div>

<div class="theme-b">
  <Button />
</div>
```

因此需要考虑：

- CSS vars scoped injection
- 最近 theme 上下文读取
- 多主题 SSR extraction
- className 与 theme 的关系
- 避免全局 theme 污染

---

### 4.10 Color Scheme / Dark Mode

除了框架层的 `themeMode`，还要考虑原生 CSS 能力：

```css
color-scheme: light dark;
```

以及：

```css
@media (prefers-color-scheme: dark)
```

这可以和 `web-responsive` 的 media feature 能力协作。

---

### 4.11 Print 样式

企业后台、报表、文档类应用可能需要：

```css
@media print
```

不一定第一阶段做，但 media 系统或 style output 不能把 query 写死成 viewport width。

---

### 4.12 Accessibility Media Features

可访问性相关媒体特性：

```css
prefers-reduced-motion
prefers-contrast
forced-colors
prefers-reduced-transparency
```

未来可以通过 media helper 暴露：

```ts
media.reducedMotion()
media.highContrast()
media.forcedColors()
```

---

### 4.13 RTL / Direction

设计系统常需要 RTL：

```ts
direction: 'ltr' | 'rtl'
```

或 transformer：

```ts
rtlTransformer()
```

用于将：

```css
margin-left
```

转换为：

```css
margin-right
```

这个对 antd / antdv 生态很重要。

---

### 4.14 Prefixer / 浏览器兼容

不建议第一版内置完整 autoprefixer，但应支持 transformer/plugin：

```ts
createStyleEngine({
  transformers: [prefixer()],
})
```

H5 / WebView 对浏览器兼容更敏感。

---

### 4.15 Static Extraction / 编译期提取

未来可以考虑：

- runtime mode
- compile-time mode
- hybrid mode

例如把 `createStyles` 中静态部分构建期提取成 CSS 文件。

第一阶段不做，但 API 不要完全绑定运行时。

---

### 4.16 SSR Extraction

样式引擎需要支持 SSR：

```ts
const html = renderToString(app)
const styles = engine.extractStyle()
```

需要考虑：

- request scoped cache
- style order
- critical CSS
- CSS vars extraction
- global styles extraction
- keyframes extraction
- 多实例 extraction

---

### 4.17 Streaming SSR

React/Vue/Solid 都有 streaming SSR 趋势。

未来要考虑：

- 边渲染边收集
- 已 flush 样式不重复输出
- chunk 级 style output
- request scoped cache

第一阶段可以只做普通 SSR，但 renderer 抽象要给 streaming 留空间。

---

### 4.18 Hydration / Rehydration

SSR 后客户端需要识别已有 style tag，避免重复插入。

可预留：

```ts
engine.hydrate()
```

或：

```ts
engine.hydrate(document.querySelectorAll('style[data-wse]'))
```

---

### 4.19 Insertion Point / Style Order

样式插入顺序非常重要。

需要支持：

```ts
createStyleEngine({
  insertionPoint: document.querySelector('#style-insertion-point'),
})
```

用于和第三方 CSS、组件库 CSS、用户 CSS 控制优先级关系。

---

### 4.20 DevTools / Debug Labels

开发体验要考虑：

- readable className
- label
- source map
- debug metadata
- duplicate style diagnostics

示例：

```ts
engine.css({
  label: 'Button-root',
  color: 'red',
})
```

开发环境输出：

```txt
wse-Button-root-abc123
```

生产环境再压缩。

---

### 4.21 Memory Cleanup / 生命周期

CSS-in-JS 常见问题是只插入不删除。

在 SPA 长时间运行、低代码编辑器、频繁挂载卸载场景下，需要考虑：

```ts
engine.dispose(className)
engine.flush()
engine.gc()
```

不一定默认启用，但底层 registry 应该能支持。

---

### 4.22 Atomic CSS 模式

未来可以支持：

```ts
mode: 'block' | 'atomic'
```

block：

```css
.a { color: red; padding: 4px; }
```

atomic：

```css
.c1 { color: red; }
.c2 { padding: 4px; }
```

Atomic 模式复用率更高，但实现复杂。第一版不建议做，但结构上不要封死。

---

### 4.23 Design Token Transformer

设计 token 不只是 CSS vars，还可能涉及：

- token alias
- token derivative
- token diff
- token flatten
- token fallback
- token unit transform

未来可以有：

```ts
createTokenEngine({
  token,
  derivative,
  transformers,
})
```

这更适合放在 style engine 上层或 design-system adapter 层。

---

### 4.24 低代码 / 可视化编辑器

低代码场景通常需要：

- iframe preview
- 实时修改 token
- 实时插入/移除样式
- 样式隔离
- style snapshot
- undo/redo
- 可序列化 style rules
- inspect 某个 className 来源

因此底层最好有 rules registry 和 debug metadata。

---

### 4.25 多版本共存

微前端里可能同时存在：

```txt
web-style-engine v1
web-style-engine v2
```

需要避免 style tag key 冲突。

建议支持：

```ts
key: 'wse'
```

并在 style tag 上标记：

```html
<style data-wse="app-a">
```

---

### 4.26 Server-only / Edge Runtime

SSR 可能运行在：

- Node.js
- Vercel Edge
- Cloudflare Workers
- Deno Deploy

Core 不应该硬依赖 Node API，应优先使用 Web Standard 能力。

---

### 4.27 Test Environment

JSDOM / happy-dom / node 测试环境下：

- 没有完整 CSSOM
- matchMedia 需要 mock
- DOM insertion 需要 mock/noop

需要支持：

```ts
createNoopRenderer()
createMockRenderer()
```

---

### 4.28 CSS Nesting

需要定义 CSS object 的嵌套能力边界：

```ts
{
  '&:hover': {},
  '.child': {},
  '@media (...)': {},
}
```

如果底层先用 Emotion，可以先继承 Emotion 能力，但协议层要明确 style input 的能力范围。

---

### 4.29 Keyframes / Font-face / Global Style

不能只考虑普通 className。

还要支持：

```ts
engine.keyframes(...)
engine.fontFace(...)
engine.injectGlobal(...)
```

这些在 H5、SSR、设计系统中都很常见。

---

### 4.30 ESM / CJS / Tree-shaking

包导出要拆细：

```txt
web-style-engine
web-style-engine/core
web-style-engine/dom
web-style-engine/ssr
web-style-engine/vue
web-style-engine/react
web-style-engine/solid
```

Core 不能因为用户 import 一个函数就拉入 Vue/React/Solid。

---

## 5. 与 web-responsive 的关系

`web-responsive` 应该保持独立。

关系建议：

```txt
web-responsive 不依赖 web-style-engine
web-style-engine 可以选择性集成 web-responsive
antdv-style 可以同时消费两者
```

例如：

```ts
const responsive = createResponsive(...)
const engine = createStyleEngine({ responsive })
```

但 responsive 的核心 query/observer 协议不应绑定 style engine。

---

## 6. 与 antdv-style 的关系

`antdv-style` 未来可以逐步变成上层集成：

```txt
antdv-style
  = web-style-engine
  + web-style-engine/vue
  + web-responsive
  + antdv-next token adapter
  + antdv-specific defaults
```

不应该把 antdv token、Vue provide/inject、antdv prefixCls 等逻辑放进 `web-style-engine` core。

---

## 7. 初期建议

不要一开始就做全部 30 个点。

建议第一阶段只确定协议和边界，优先考虑会影响架构的点：

1. StyleEngine interface
2. Renderer interface
3. DOM renderer container / nonce / insertionPoint
4. SSR renderer extraction / hydration 预留
5. cache / registry / className 生成
6. CSS object / CSS string input
7. debug label
8. transformer/plugin 机制
9. CSS variables scoped injection
10. 多实例隔离

后续再逐步补齐 H5 transformer、RTL、atomic、streaming SSR、framework adapter 等能力。
