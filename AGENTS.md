## 注意事项

- 编写样式的时候应该使用 Tailwind CSS 而不是原生 CSS 语言，尽可能不写任何 CSS 语言，修改样式时需要注意适配移动端响应式布局。
- 当前项目使用 OpenNext 来驱动 Next.js 框架，在编写代码之前请先阅读 `node_modules/next/dist/docs/` 和 https://opennext.js.org/cloudflare 中的相关文档。
- 改完代码之后不要主动跑 `pnpm run dev` 或者 `pnpm run build`，让用户执行验证结果是否正常，如果有问题用户会反馈给你继续修改和完善。
