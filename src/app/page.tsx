"use client";

import { Button, Card, Space, Toast, Typography } from "@douyinfe/semi-ui";

const { Title, Paragraph, Text } = Typography;

export default function Home() {
	return (
		<main className="min-h-screen p-8">
			<Card title={<Title heading={3}>Entrant</Title>} style={{ maxWidth: 720, margin: "0 auto" }}>
				<Space vertical align="start" spacing="loose">
					<Paragraph>Semi Design 已接入当前 Next.js / OpenNext Cloudflare 项目。</Paragraph>
					<Text type="tertiary">原始初始化模板内容已替换为项目首页占位内容。</Text>
					<Button theme="solid" type="primary" onClick={() => Toast.success("Semi Design 工作正常")}>
						测试 Semi Design
					</Button>
				</Space>
			</Card>
		</main>
	);
}
