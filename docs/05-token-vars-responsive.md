# Step 5：Token / CSS Vars / Responsive 集成

## 目标

在不绑定具体设计系统的前提下，为样式引擎提供 token、CSS variables 和 responsive 的通用接入能力。

这一层是 core 与 design-system adapter 之间的桥梁。

---

## 原则

```txt
web-style-engine 可以提供 token/css-var 机制，但不内置任何具体设计系统 token。
```

也就是说，不应该在 core 中出现：

- antdv token
- antd token
- Arco token
- Naive UI token
- Element Plus token

这些都应该由上层 adapter 提供。

---

## CSS Variables

CSS variables 应作为通用能力。

```ts
engine.vars({
  colorPrimary: '#1677ff',
  borderRadius: '6px',
})
```

输出：

```css
:root {
  --wse-color-primary: #1677ff;
  --wse-border-radius: 6px;
}
```

需要支持：

- prefix
- scope selector
- fallback
- nested token flatten
- SSR extraction
- dark/light scope
- 多主题并存

---

## Scoped Vars

局部主题需要：

```ts
engine.vars('.theme-dark', {
  colorPrimary: '#1668dc',
})
```

输出：

```css
.theme-dark {
  --wse-color-primary: #1668dc;
}
```

这对嵌套主题、多主题并存、低代码预览很重要。

---

## Token Transformer

设计 token 可能需要转换：

- flatten
- alias resolve
- derivative
- unit transform
- diff
- fallback

可以预留：

```ts
createTokenEngine({
  token,
  transformers: [],
})
```

第一阶段可以先只做 CSS vars helper，不做完整 token engine。

---

## Responsive 子模块

`web-responsive` 的核心能力已经迁入 `web-style-engine`，作为一级子模块维护。

推荐边界：

```txt
responsive 不依赖 core engine
core engine 不硬编码 responsive 断点系统
createStyles / framework adapter 可以可选消费 responsive 实例
antdv-style 消费 web-style-engine/responsive
```

示例：

```ts
const responsive = createResponsive({
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1280,
  },
})

const styles = responsive.object({
  base: { padding: 12 },
  up: {
    tablet: { padding: 24 },
  },
})
```

---

## Responsive 在 createStyles 中的位置

`createStylesCore` 的 utils 可以包含：

```ts
{
  responsive,
  cssVar,
  theme,
  css,
  cx,
}
```

但 `responsive` 应该是可选能力。

没有创建 responsive 实例时，style engine 仍然可以工作。

---

## H5 Transformer

H5 场景需要：

- px2rem
- px2vw
- safe-area helper
- viewport unit helper

这些适合通过 transformer/plugin 接入：

```ts
createStyleEngine({
  transformers: [
    px2rem({ rootValue: 37.5 }),
  ],
})
```

---

## RTL / Prefixer

同样适合 transformer：

```ts
createStyleEngine({
  transformers: [
    rtlTransformer(),
    prefixer(),
  ],
})
```

不要把这些硬编码在 core 中。

---

## Accessibility / Color Scheme

可以和 `web-style-engine/responsive` 的 media feature 能力配合：

- prefers-color-scheme
- prefers-reduced-motion
- prefers-contrast
- forced-colors

style engine 不需要重复实现 media query 系统。

---

## 验收标准

完成 Step 5 后，应具备：

- CSS vars helper
- scoped vars injection
- vars SSR extraction
- token flatten 最小能力
- transformer/plugin 协议
- 内置 responsive 子模块
- createResponsive / createResponsiveObserver
- query / object / style adapter 输出
- createStyles utils 能传入 responsive/cssVar
- 不绑定任何具体设计系统 token
