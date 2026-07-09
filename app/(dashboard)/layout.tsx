"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Button, Dropdown, Layout, Nav } from "@douyinfe/semi-ui";
import {
	IconBell,
	IconHelpCircle,
	IconHome,
	IconMenu,
	IconMoon,
	IconSemiLogo,
	IconSun,
	IconUser,
	IconUserGroup,
} from "@douyinfe/semi-icons";

const { Header, Sider, Content, Footer } = Layout;

const sideMenuItems = [
	{ itemKey: "dashboard", text: "仪表盘", icon: <IconHome size="large" /> },
	{ itemKey: "manager", text: "学生管理", icon: <IconUserGroup size="large" /> },
];

const routeMap: Record<string, string> = {
	dashboard: "/",
	manager: "/manager",
};

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();
	const pathname = usePathname();
	const [siderVisible, setSiderVisible] = useState(false);
	const [theme, setTheme] = useState<"light" | "dark">(() =>
		typeof document !== "undefined" && document.body.getAttribute("theme-mode") === "dark" ? "dark" : "light",
	);

	const currentKey = Object.entries(routeMap).find(([, path]) => pathname === path)?.[0] ?? "dashboard";

	const toggleTheme = () => {
		const nextTheme = theme === "dark" ? "light" : "dark";
		setTheme(nextTheme);

		if (nextTheme === "dark") {
			document.body.setAttribute("theme-mode", "dark");
		} else {
			document.body.removeAttribute("theme-mode");
		}
	};

	const handleNavSelect = (data: { itemKey: string | number }) => {
		const path = routeMap[String(data.itemKey)];

		if (path && path !== pathname) {
			router.push(path);
		}

		setSiderVisible(false);
	};

	return (
		<Layout className="h-dvh overflow-hidden">
			<Header className="shrink-0 border-b border-(--semi-color-border) bg-(--semi-color-bg-1)">
				<Nav mode="horizontal">
					<Nav.Header>
						<Button
							theme="borderless"
							icon={<IconMenu size="large" />}
							className="mr-2 md:hidden!"
							style={{ color: "var(--semi-color-text-2)" }}
							aria-label="打开侧边栏"
							onClick={() => setSiderVisible((visible) => !visible)}
						/>
						<IconSemiLogo className="text-(--semi-color-text-0)" style={{ height: "36px", fontSize: 36 }} />
						<span className="ml-2 hidden text-lg font-semibold text-(--semi-color-text-0) md:inline">
							Entrant Roster
						</span>
					</Nav.Header>
					<Nav.Footer>
						<Button
							theme="borderless"
							icon={theme === "dark" ? <IconSun size="large" /> : <IconMoon size="large" />}
							style={{ color: "var(--semi-color-text-2)", marginRight: "12px" }}
							aria-label="切换主题"
							onClick={toggleTheme}
						/>
						<Button
							theme="borderless"
							icon={<IconBell size="large" />}
							style={{ color: "var(--semi-color-text-2)", marginRight: "12px" }}
							aria-label="通知"
						/>
						<Button
							theme="borderless"
							icon={<IconHelpCircle size="large" />}
							style={{ color: "var(--semi-color-text-2)", marginRight: "12px" }}
							aria-label="帮助中心"
						/>
						<Dropdown
							position="bottomRight"
							render={
								<Dropdown.Menu>
									<Dropdown.Item icon={<IconUser />}>个人信息</Dropdown.Item>
									<Dropdown.Item onClick={() => window.location.assign("/api/auth/logout")}>退出登录</Dropdown.Item>
								</Dropdown.Menu>
							}
						>
							<span>
								<Avatar color="orange" size="small" alt="Entrant Roster">
									ER
								</Avatar>
							</span>
						</Dropdown>
					</Nav.Footer>
				</Nav>
			</Header>

			<Layout className="min-h-0 flex-1 overflow-hidden">
				<Sider className="hidden! shrink-0 bg-(--semi-color-bg-1) md:block!">
					<Nav
						style={{ maxWidth: 220, height: "100%" }}
						selectedKeys={[currentKey]}
						items={sideMenuItems}
						onSelect={handleNavSelect}
						footer={{
							collapseButton: true,
							collapseText: (collapsed) => (collapsed ? "展开侧边栏" : "收起侧边栏"),
						}}
					/>
				</Sider>

				<Content className="overflow-auto bg-(--semi-color-bg-0) p-4 md:p-6">{children}</Content>
			</Layout>

			<Footer className="flex shrink-0 flex-col items-center justify-between gap-2 border-t border-(--semi-color-border) bg-(--semi-color-bg-1) px-5 py-4 text-(--semi-color-text-2) sm:flex-row">
				<span className="text-sm">Copyright &copy; 2026 Entrant Roster. All Rights Reserved.</span>
				<span className="flex gap-6 text-sm">
					<span>帮助中心</span>
					<span>反馈建议</span>
				</span>
			</Footer>

			{siderVisible ? (
				<div
					className="fixed inset-0 top-15 z-40 bg-black/30 md:hidden"
					onClick={() => setSiderVisible(false)}
					role="presentation"
				/>
			) : null}

			<div
				className={`fixed left-0 top-15 z-50 h-[calc(100dvh-60px)] w-55 bg-(--semi-color-bg-1) shadow-lg transition-transform duration-200 md:hidden ${
					siderVisible ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<Nav
					style={{ maxWidth: 220, height: "100%" }}
					selectedKeys={[currentKey]}
					items={sideMenuItems}
					onSelect={handleNavSelect}
				/>
			</div>
		</Layout>
	);
}
