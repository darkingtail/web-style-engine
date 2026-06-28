# Step 6：antdv-style 迁移与多框架验证

## 目标

用真实的 `antdv-style` 验证 `web-style-engine` 抽象是否成立。

这一步不是一开始重写 `antdv-style`，而是逐步迁移底层实现，同时保持现有 API 尽量不变。

---

## 迁移目标

未来 `antdv-style` 可以变成：

```txt
antdv-style
  = web-style-engine
  + web-style-engine/vue
  + web-style-engine/responsive
  + antdv-next token adapter
  + antdv-specific defaults
```

`web-style-engine` 不应该知道 antdv。

`antdv-style` 负责 antdv 相关逻辑：

- antdv-next theme.useToken
- prefixCls
- iconPrefixCls
- antdv token 映射
- antdv css var prefix
- antdv-specific ThemeProvider 默认值
- useAntdToken
- useAntdTheme
- useAntdStylish

---

## 6.1 包装现有 Emotion 实现

第一步不要替换底层行为，只是把当前 Emotion 封装为 StyleEngine 协议。

```ts
const engine = createStyleEngineFromEmotion(emotion)
```

目标：

- 现有测试不变
- 现有 API 不变
- 底层多一层 StyleEngine interface

---

## 6.2 抽出 createStylesCore

把 `antdv-style` 当前 Vue 强相关的 `createStyles` 拆成：

```txt
createStylesCore
createVueCreateStyles
```

Vue adapter 负责：

- inject theme
- inject engine
- reactive/computed

Core 负责：

- 执行 factory
- 调用 engine.css
- 生成 styles
- 处理 cache/label

---

## 6.3 拆 ThemeProvider

拆成三部分：

```txt
theme resolver core
Vue ThemeProvider wrapper
antdv token adapter
```

其中：

- theme resolver core 只做 theme merge/derive
- Vue wrapper 只做 provide/inject/lifecycle
- antdv token adapter 只负责读取 antdv-next token

---

## 6.4 接入 responsive 子模块

用 `web-style-engine/responsive` 替换当前 responsive 实现。

`antdv-style` 内部自己定义 antdv-style preset：

```ts
const preset = defineResponsivePreset({
  name: 'antdv-style',
  breakpoints: {
    xs: token.screenXS,
    sm: token.screenSM,
    md: token.screenMD,
    lg: token.screenLG,
    xl: token.screenXL,
    xxl: token.screenXXL,
  },
})
```

注意：

```txt
web-style-engine/responsive 不内置 antd preset
antdv-style 自己生成 preset
```

---

## 6.5 多框架实验

建立本地验证项目：

```txt
web-style-engine-test
```

验证：

- Vue 3
- React 19
- Solid

要求：

- 三个框架共用同一 StyleEngine Core
- 三个框架复用 createStylesCore
- 三个框架各自通过 adapter 接入 theme/context
- 可以用 Playwright 验证运行结果

---

## 6.6 回归 antdv-style

迁移过程中必须保证：

- antdv-style 现有 API 不破坏
- 现有单测通过
- SSR safety 不退化
- createInstance 多实例能力保留
- ThemeProvider 嵌套能力保留
- useAntdToken/useAntdTheme 保留
- responsive 行为兼容或有明确 migration path

---

## 验收标准

完成 Step 6 后，应具备：

- antdv-style 可以基于 web-style-engine 运行
- antdv-style 现有测试通过
- web-style-engine/responsive 被接入
- Vue adapter 验证通过
- React adapter 验证通过
- Solid adapter 验证通过
- Playwright 本地验证通过
- 文档说明迁移边界和兼容策略
