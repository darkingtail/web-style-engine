# Step 1：Style Engine Core 协议

## 目标

定义 `web-style-engine` 的最底层协议。

这一层只关注样式引擎本身，不关心：

- Vue / React / Solid
- antdv / antd / Arco 等设计系统
- DOM 插入细节
- SSR 框架细节
- 具体 token 来源

它应该回答一个问题：

> 一个 Web 样式引擎最基础的能力是什么？

---

## 核心职责

Style Engine Core 负责：

- 接收 CSS object / CSS string / template style input
- 序列化样式
- 生成稳定 className
- 管理 hash
- 管理 label / debug name
- 去重相同样式
- 维护 style registry
- 提供 `css / cx / keyframes / injectGlobal` 等核心 API
- 提供 transformer / plugin 机制的入口
- 将生成后的 rule 交给 renderer

---

## 非职责

Core 不应该负责：

- 创建 Vue Provider
- 创建 React Context
- 读取 antdv token
- 操作具体 DOM container
- 决定 SSR 框架如何 render
- 内置 antdv / antd / tailwind 规则
- 绑定具体 responsive 断点系统

这些都应该在更上层完成。

---

## 初始接口草案

```ts
export interface StyleEngine {
  key: string
  css(input: StyleInput, options?: StyleOptions): string
  cx(...classNames: ClassValue[]): string
  keyframes(input: StyleInput, options?: StyleOptions): string
  injectGlobal(input: StyleInput, options?: GlobalStyleOptions): string | void
  flush?(): void
  dispose?(id: string): void
  getRegistry?(): StyleRegistry
}
```

样式输入：

```ts
export type StyleInput = CSSObject | string | TemplateStringsArray
```

样式选项：

```ts
export interface StyleOptions {
  label?: string
  layer?: string
  specificity?: 'normal' | 'low' | 'high'
  priority?: number
}
```

---

## ClassName 设计

需要支持：

```txt
{key}-{hash}
{key}-{label}-{hash}
```

例如：

```txt
wse-a1b2c3
wse-Button-root-a1b2c3
```

要求：

- 相同输入生成稳定 className
- 不同 engine key 隔离
- dev 环境保留 label
- prod 环境可以压缩
- className 不能依赖运行时随机数

---

## Cache / Registry

Core 应维护 registry：

```ts
interface StyleRegistry {
  has(id: string): boolean
  get(id: string): StyleRule | undefined
  add(rule: StyleRule): void
  remove?(id: string): void
  clear(): void
}
```

用途：

- dedupe
- SSR extraction
- hydration
- debug inspection
- low-code style snapshot
- memory cleanup

---

## Transformer / Plugin

Core 应预留 transformer：

```ts
createStyleEngine({
  transformers: [
    px2rem(),
    rtlTransformer(),
    prefixer(),
  ],
})
```

第一阶段不必实现完整 transformer 生态，但接口要预留。

典型 transformer：

- px2rem
- px2vw
- RTL
- prefixer
- CSS variable fallback
- logical properties transform

---

## 与 Emotion 的关系

第一阶段可以继续借鉴或包装 Emotion 的能力，但不要让公开协议变成 Emotion 协议。

推荐：

```txt
web-style-engine protocol > emotion implementation
```

而不是：

```txt
web-style-engine = emotion wrapper only
```

这样未来可以替换 serializer 或 renderer。

---

## 验收标准

完成 Step 1 后，应具备：

- `createStyleEngine` 最小实现
- `css` 能接收 CSS object 并返回 className
- `cx` 能合并 className
- `keyframes` 有协议定义
- `injectGlobal` 有协议定义
- 相同样式可 dedupe
- className 稳定
- 支持 label
- registry 可查询
- 不依赖任何框架
