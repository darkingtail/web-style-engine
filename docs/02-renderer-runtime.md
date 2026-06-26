# Step 2：Renderer / Runtime 抽象

## 目标

将“样式生成”和“样式插入运行环境”拆开。

Style Engine Core 负责生成 rule，Renderer 负责把 rule 放到目标环境中。

这样可以支持：

- DOM runtime
- SSR runtime
- Noop / test runtime
- Shadow DOM
- iframe
- browser extension
- micro-frontend

---

## Renderer 协议

```ts
export interface StyleRenderer {
  insert(rule: StyleRule): void
  remove?(id: string): void
  flush?(): void
  hydrate?(source?: unknown): void
  extract?(): ExtractedStyle
}
```

其中：

```ts
export interface StyleRule {
  id: string
  className?: string
  cssText: string
  layer?: string
  priority?: number
  metadata?: Record<string, unknown>
}
```

---

## DOM Renderer

DOM Renderer 负责真实浏览器环境。

```ts
createDOMRenderer({
  container: document.head,
  nonce,
  insertionPoint,
})
```

需要支持：

- 创建 style tag
- 插入 rule
- 去重 rule
- 维护插入顺序
- 支持 nonce
- 支持 insertionPoint
- 支持 ShadowRoot
- 支持 iframe document
- 支持多个 engine 实例

---

## container

不能默认只支持 `document.head`。

需要支持：

```ts
container: document.head
container: shadowRoot
container: iframe.contentDocument!.head
```

这直接影响：

- Shadow DOM
- Web Components
- 微前端
- browser extension
- 低代码 iframe preview

---

## nonce / CSP

企业系统常有 CSP：

```http
Content-Security-Policy: style-src 'nonce-xxx'
```

Renderer 创建 style tag 时应支持：

```html
<style nonce="xxx">
```

API：

```ts
createDOMRenderer({
  nonce: 'xxx',
})
```

---

## insertionPoint / Style Order

样式顺序必须可控。

```ts
createDOMRenderer({
  insertionPoint: document.querySelector('#style-insertion-point'),
})
```

用途：

- 控制与第三方 CSS 的优先级
- 控制与组件库 CSS 的插入顺序
- 微前端隔离
- SSR hydration 对齐

---

## SSR Renderer

SSR Renderer 不操作 DOM，只收集 rule。

```ts
const renderer = createSSRRenderer()
const engine = createStyleEngine({ renderer })

const html = renderToString(app)
const styles = renderer.extract()
```

需要支持：

- 收集 CSS text
- 输出 style tags
- 保持 style order
- 支持 nonce
- 支持 layer
- 支持 CSS variables
- 支持 keyframes/global styles
- request scoped cache

---

## Hydration / Rehydration

SSR 后客户端需要识别已存在的 style tag，避免重复插入。

预留：

```ts
renderer.hydrate(document.querySelectorAll('style[data-wse]'))
```

或：

```ts
engine.hydrate()
```

---

## Streaming SSR 预留

第一阶段可以只支持普通 SSR extraction，但 renderer 协议要给 streaming 留空间。

未来可能需要：

- chunk 级 style flush
- 已 flush rule 记录
- 避免重复输出
- request scoped renderer

---

## Noop Renderer

Noop Renderer 用于：

- 单元测试
- Node 环境
- 只计算 className
- 不插入样式

```ts
createNoopRenderer()
```

---

## Mock Renderer

测试环境可以提供 Mock Renderer：

```ts
const renderer = createMockRenderer()
expect(renderer.rules).toEqual([...])
```

用于测试：

- rule order
- cssText
- dedupe
- metadata
- removal

---

## 验收标准

完成 Step 2 后，应具备：

- Renderer interface
- DOM Renderer 最小实现
- SSR Renderer 最小实现
- Noop/Mock Renderer
- 支持 container
- 支持 nonce
- 支持 insertionPoint
- 支持 extract
- 支持 hydrate 协议预留
- Core 不直接依赖 document.head
