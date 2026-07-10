"use client";

import { Avatar, Card, Empty, Typography } from "@douyinfe/semi-ui";
import { IconGridView, IconSemiLogo, IconTickCircle, IconUser } from "@douyinfe/semi-icons";

const { Text, Title } = Typography;

const overviewItems = [
	{
		label: "认证服务",
		value: "已启用",
		detail: "Better Auth",
		icon: <IconTickCircle size="large" />,
		color: "green" as const,
	},
	{
		label: "登录方式",
		value: "邮箱密码",
		detail: "账户自主注册",
		icon: <IconUser size="large" />,
		color: "blue" as const,
	},
	{
		label: "数据库",
		value: "已连接",
		detail: "Cloudflare D1",
		icon: <IconSemiLogo size="large" />,
		color: "cyan" as const,
	},
	{
		label: "业务数据",
		value: "待接入",
		detail: "当前仅展示静态概览",
		icon: <IconGridView size="large" />,
		color: "amber" as const,
	},
] as const;

const systemStatus = [
	{ label: "会话管理", value: "服务端会话" },
	{ label: "数据连接", value: "远程 D1" },
	{ label: "当前模式", value: "静态数据" },
] as const;

export default function Home() {
	return (
		<main className="flex w-full flex-col gap-6">
			<header className="flex flex-col gap-1">
				<Title heading={3}>仪表盘</Title>
				<Text type="secondary">系统概览</Text>
			</header>

			<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{overviewItems.map((item) => (
					<Card key={item.label} shadows="hover" className="min-h-32">
						<div className="flex h-full items-center justify-between gap-4">
							<div className="flex min-w-0 flex-col gap-1">
								<Text type="secondary">{item.label}</Text>
								<Title heading={4}>{item.value}</Title>
								<Text type="tertiary">{item.detail}</Text>
							</div>
							<Avatar color={item.color} shape="square" size="large" alt={item.label}>
								{item.icon}
							</Avatar>
						</div>
					</Card>
				))}
			</section>

			<section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card title="系统状态" className="min-h-64">
					<div className="divide-y divide-(--semi-color-border)">
						{systemStatus.map((item) => (
							<div key={item.label} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
								<Text>{item.label}</Text>
								<Text type="secondary">{item.value}</Text>
							</div>
						))}
					</div>
				</Card>

				<Card title="业务数据" className="min-h-64">
					<div className="flex min-h-48 items-center justify-center">
						<Empty title="暂无业务数据" description="业务模块接入后将在此展示。" />
					</div>
				</Card>
			</section>
		</main>
	);
}
