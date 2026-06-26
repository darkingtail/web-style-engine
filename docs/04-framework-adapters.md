# Step 4：Framework Adapter 协议

## 目标

在 Style Engine Core 和 createStylesCore 之上，为不同框架提供薄适配层。

核心原则：

```txt
Framework Adapter 只做框架接入，不包含样式引擎核心逻辑。
```

需要适配的框架包括但不限于：

- Vue
- React
- Solid
- Svelte
- Lit

第一阶段建议重点验证：

- Vue 3
- React 19
- Solid

---

## Framework Adapter 职责

Framework Adapter 负责：

- theme context
- style engine context
- provider
- hook / composable
- lifecycle
- framework SSR 接入
- 将 framework reactivity 转换成 createStylesCore runtime context

不负责：

- CSS serialization
- className hash
- style rule insertion
- renderer extraction
- antdv token 读取
- design system 特有逻辑

---

## Vue Adapter

可能提供：

```ts
const {
  StyleProvider,
  ThemeProvider,
  createStyles,
  useTheme,
  useStyleEngine,
} = createVueStyleSystem(engine)
```

职责：

- 使用 provide/inject 传递 engine 和 theme
- 使用 computed/reactive 包装 createStylesCore
- 处理组件生命周期
- 适配 Vue SSR

---

## React Adapter

可能提供：

```ts
const {
  StyleProvider,
  ThemeProvider,
  createStyles,
  useTheme,
  useStyleEngine,
} = createReactStyleSystem(engine)
```

职责：

- 使用 React Context
- 使用 hooks 包装 createStylesCore
- 支持 React 19
- 支持 SSR / streaming SSR 预留

---

## Solid Adapter

可能提供：

```ts
const {
  StyleProvider,
  ThemeProvider,
  createStyles,
  useTheme,
  useStyleEngine,
} = createSolidStyleSystem(engine)
```

职责：

- 使用 Solid context
- 使用 signal/memo 包装 createStylesCore
- 处理 fine-grained reactivity

---

## 通用 Adapter 形态

可以抽象：

```ts
interface FrameworkStyleAdapter<Provider, Hook> {
  StyleProvider: Provider
  ThemeProvider: Provider
  createStyles: CreateStylesFn
  useTheme: Hook
  useStyleEngine: Hook
}
```

但不要为了抽象而牺牲各框架自然体验。

框架 adapter 应符合各自生态习惯。

---

## Theme 只做泛型

Framework Adapter 不应该假设 theme 是 antd token。

```ts
createStyles<Theme, Props>((utils, props) => {
  return {
    root: {
      color: utils.theme.colorPrimary,
    },
  }
})
```

具体 theme 类型由上层 design-system adapter 定义。

---

## SSR 注意点

不同框架 SSR 方式不同。

Adapter 需要保证：

- 每次请求独立 engine/renderer 或 request scope
- 能收集 styles
- 能和 hydration 对齐
- 不在服务端访问 DOM

---

## 不必官方适配所有框架

可以先定义协议，再提供高频 adapter。

官方第一阶段：

- Vue
- React
- Solid

其它框架通过文档说明如何基于 core/createStylesCore 接入。

---

## 验收标准

完成 Step 4 后，应具备：

- Vue adapter 最小实现
- React adapter 最小实现
- Solid adapter 最小实现
- 三者复用同一个 StyleEngine Core
- 三者复用同一个 createStylesCore
- adapter 中没有 CSS serializer 逻辑
- adapter 中没有 antdv 专属逻辑
