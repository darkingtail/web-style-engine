# Step 3：createStyles Core 抽象

## 目标

将 `createStyles` 中真正通用的逻辑从框架层抽出来。

`createStyles` 的本质不是 Vue 专属，也不是 React 专属，它可以拆成两部分：

```txt
createStylesCore：执行样式工厂、生成 className、缓存
Framework Adapter：读取 theme、props、响应式状态、处理生命周期
```

---

## createStylesCore 职责

`createStylesCore` 应负责：

- 执行 style factory
- 传入 style utils
- 处理 props
- 处理 theme
- 处理 responsive
- 调用 engine.css
- 生成 styles map
- 缓存结果
- 支持 label
- 支持 hash/specificity/priority

它不应该负责：

- Vue inject
- React context
- Solid signal
- 生命周期 hook
- antdv token 获取

---

## 核心接口草案

```ts
export function createStylesCore<Theme, Props>(
  engine: StyleEngine,
  factory: StyleFactory<Theme, Props>,
  options?: CreateStylesCoreOptions,
): (context: CreateStylesRuntimeContext<Theme, Props>) => CreateStylesResult
```

Style factory：

```ts
export type StyleFactory<Theme, Props> = (
  utils: CreateStylesUtils<Theme>,
  props: Props,
) => Record<string, StyleInput | string>
```

Runtime context：

```ts
export interface CreateStylesRuntimeContext<Theme, Props> {
  theme: Theme
  props: Props
  responsive?: Responsive
  cacheKey?: string
}
```

---

## Style Utils

```ts
export interface CreateStylesUtils<Theme> {
  theme: Theme
  token?: unknown
  css: StyleEngine['css']
  cx: StyleEngine['cx']
  keyframes: StyleEngine['keyframes']
  responsive?: Responsive
  cssVar?: Record<string, string>
}
```

注意：

- `theme` 是泛型，不绑定 antdv
- `token` 可选，由 design-system adapter 决定
- `responsive` 可选接入 `web-responsive`
- `cssVar` 是通用能力，不绑定 antdv token

---

## 缓存策略

createStylesCore 需要缓存：

```txt
factory identity + theme identity/hash + props hash + responsive config + options
```

但需要注意：

- 不强制 JSON.stringify 所有对象
- 支持用户传 cacheKey
- 支持 framework adapter 提供依赖追踪
- 避免过度缓存导致 theme 更新不生效

---

## 返回结构

```ts
export interface CreateStylesResult<Styles extends Record<string, string> = Record<string, string>> {
  styles: Styles
  cx: StyleEngine['cx']
  theme: unknown
}
```

框架层可以再包装成：

- Vue reactive object
- React hook result
- Solid signal-friendly object

---

## Label 策略

支持：

```ts
createStyles(factory, {
  label: 'Button',
})
```

输出：

```txt
wse-Button-root-xxxx
wse-Button-icon-xxxx
```

label 应由 core 处理，而不是每个框架重复实现。

---

## Static / Dynamic 分离

未来可以考虑把样式分成：

- 静态样式：与 props/theme 无关，可提前生成
- 动态样式：依赖 props/theme，需要运行时生成

第一阶段可以不做编译期提取，但 API 不要阻碍后续 static extraction。

---

## 与 antdv-style 的关系

当前 `antdv-style` 中的 `createStyles` 可以迁移为：

```txt
createStylesCore
  + Vue inject theme
  + antdv token adapter
  + web-responsive
```

这样未来 React / Solid adapter 可以复用同一个 core。

---

## 验收标准

完成 Step 3 后，应具备：

- `createStylesCore`
- 支持 factory style
- 支持 object style
- 支持 props
- 支持 theme 泛型
- 支持 label
- 支持 cache
- 不依赖任何框架
- Vue/React/Solid adapter 可以复用它
