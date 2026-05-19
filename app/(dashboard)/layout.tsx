"use client";

import { useState } from "react";
import { Avatar, Button, Dropdown, Layout, Nav } from "@douyinfe/semi-ui";
import {
	IconBell,
	IconBytedanceLogo,
	IconHelpCircle,
	IconHistogram,
	IconHome,
	IconLive,
	IconMenu,
	IconSemiLogo,
	IconSetting,
	IconUser,
} from "@douyinfe/semi-icons";

const { Header, Footer, Sider, Content } = Layout;

const sidebarItems = [
	{ itemKey: "Home", text: "首页", icon: <IconHome size="large" /> },
	{ itemKey: "Histogram", text: "基础数据", icon: <IconHistogram size="large" /> },
	{ itemKey: "Live", text: "测试功能", icon: <IconLive size="large" /> },
	{ itemKey: "Setting", text: "设置", icon: <IconSetting size="large" /> },
];

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [mobileNavVisible, setMobileNavVisible] = useState(false);

	return (
		<Layout className="flex h-dvh flex-col overflow-hidden border border-[color:var(--semi-color-border)] bg-[color:var(--semi-color-bg-0)]">
			<Header className="shrink-0 border-b border-[color:var(--semi-color-border)] bg-[color:var(--semi-color-bg-1)]">
				<Nav mode="horizontal" defaultSelectedKeys={["Home"]} className="min-w-0">
					<Nav.Header className="shrink-0">
						<Button
							theme="borderless"
							icon={<IconMenu size="large" />}
							className="mr-2 text-[color:var(--semi-color-text-2)] md:hidden!"
							aria-label="打开侧边栏"
							onClick={() => setMobileNavVisible((visible) => !visible)}
						/>
						<IconSemiLogo className="text-4xl" />
					</Nav.Header>
					<span className="hidden min-w-0 items-center text-[color:var(--semi-color-text-2)] sm:flex">
						<span className="mr-6 whitespace-nowrap font-semibold text-[color:var(--semi-color-text-0)]">模版推荐</span>
						<span className="mr-6 whitespace-nowrap">所有模版</span>
						<span className="whitespace-nowrap">我的模版</span>
					</span>
					<span className="min-w-0 truncate font-semibold text-[color:var(--semi-color-text-0)] sm:hidden">模版推荐</span>
					<Nav.Footer className="ml-auto shrink-0">
						<Button
							theme="borderless"
							icon={<IconBell size="large" />}
							className="mr-1 text-[color:var(--semi-color-text-2)] sm:mr-3"
							aria-label="通知"
						/>
						<Button
							theme="borderless"
							icon={<IconHelpCircle size="large" />}
							className="mr-1 text-[color:var(--semi-color-text-2)] sm:mr-3"
							aria-label="帮助"
						/>
						<Dropdown
							position="bottomRight"
							render={
								<Dropdown.Menu>
									<Dropdown.Item icon={<IconUser />}>ikxin</Dropdown.Item>
									<Dropdown.Item onClick={() => window.location.assign("/api/auth/logout")}>退出登录</Dropdown.Item>
								</Dropdown.Menu>
							}
						>
							<span>
								<Avatar color="orange" size="small">
									IK
								</Avatar>
							</span>
						</Dropdown>
					</Nav.Footer>
				</Nav>
			</Header>

			<Layout className="flex min-h-0 flex-1">
				<Sider className="hidden shrink-0 border-r border-[color:var(--semi-color-border)] bg-[color:var(--semi-color-bg-1)] md:block">
					<Nav
						className="h-full max-w-[220px]"
						defaultSelectedKeys={["Home"]}
						items={sidebarItems}
						footer={{
							collapseButton: true,
						}}
					/>
				</Sider>

				<Content className="flex min-w-0 flex-1 flex-col overflow-auto bg-[color:var(--semi-color-bg-0)] p-4 sm:p-6">
					{children}
				</Content>
			</Layout>

			<Footer className="flex shrink-0 flex-col gap-2 bg-[color:rgb(var(--semi-grey-0))] p-4 text-xs leading-5 text-[color:var(--semi-color-text-2)] sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:text-sm">
				<span className="flex min-w-0 items-center">
					<IconBytedanceLogo size="large" className="mr-2 shrink-0" />
					<span className="truncate">Copyright © 2023 ByteDance. All Rights Reserved.</span>
				</span>
				<span className="flex shrink-0 gap-6">
					<span>平台客服</span>
					<span>反馈建议</span>
				</span>
			</Footer>

			{mobileNavVisible && (
				<div
					className="fixed inset-x-0 bottom-0 top-[60px] z-40 bg-black/30 md:hidden"
					onClick={() => setMobileNavVisible(false)}
					role="presentation"
				/>
			)}

			<div
				className={`fixed left-0 top-[60px] z-50 h-[calc(100dvh-60px)] w-[220px] bg-[color:var(--semi-color-bg-1)] shadow-lg transition-transform duration-200 md:hidden ${
					mobileNavVisible ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<Nav
					className="h-full max-w-[220px]"
					defaultSelectedKeys={["Home"]}
					items={sidebarItems}
					onSelect={() => setMobileNavVisible(false)}
				/>
			</div>
		</Layout>
	);
}
