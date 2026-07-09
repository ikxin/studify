## 注意事项

- 使用当前环境的 MCP 来增强 Agent 能力并且减少幻觉，改完代码之后不要主动跑 dev、build、lint、check 等指令，让用户执行验证结果是否正常。
- 项目使用 OpenNext 来驱动 Next.js 框架，在编写代码之前请先阅读 `node_modules/next/dist/docs/` 和 https://opennext.js.org/cloudflare 中的相关文档。
- 编写样式的时候使用 Tailwind CSS 而不是原生 CSS，尽可能不写任何 CSS 语言，整个项目的 UI 风格尽可能使用 Semi Design 的组件库。
- 修改样式时需要注意适配移动端响应式布局，编写 Tailwind CSS 类名时优先使用 canonical 写法，避免触发 `suggestCanonicalClasses` 警告。
- 远程 Cloudflare D1 数据库已经导入正式数据，除非用户提示词主动要求，否则绝对不能修改现有数据，只能读取和检索数据。
- 所有改动都保留在 Git 工作区，除非用户提示词主动要求，否则绝对不能擅自修改 Git 暂存区以及操作任何 Git 风险操作导致存储库数据丢失。
