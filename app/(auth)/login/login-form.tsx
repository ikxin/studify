"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@douyinfe/semi-ui";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

const modeCopy = {
	"sign-in": {
		title: "欢迎回来",
		description: "输入账户信息以继续。",
		action: "登录",
		alternatePrompt: "还没有账户？",
		alternateAction: "创建账户",
	},
	"sign-up": {
		title: "创建账户",
		description: "创建后将直接登录管理工作台。",
		action: "注册并登录",
		alternatePrompt: "已有账户？",
		alternateAction: "使用已有账户登录",
	},
} as const;

export function LoginForm() {
	const router = useRouter();
	const [mode, setMode] = useState<AuthMode>("sign-in");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const copy = modeCopy[mode];

	const switchMode = () => {
		setMode((currentMode) => (currentMode === "sign-in" ? "sign-up" : "sign-in"));
		setError(null);
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		if (mode === "sign-up" && !name.trim()) {
			setError("请输入显示名称。");
			return;
		}

		setIsSubmitting(true);

		try {
			const result =
				mode === "sign-in"
					? await authClient.signIn.email({ email: email.trim(), password })
					: await authClient.signUp.email({ name: name.trim(), email: email.trim(), password });

			if (result.error) {
				setError(result.error.message ?? "认证失败，请稍后重试。");
				return;
			}

			router.replace("/");
			router.refresh();
		} catch {
			setError("认证失败，请检查网络后重试。");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="space-y-5" onSubmit={handleSubmit}>
			<div>
				<h2 className="text-2xl font-semibold">{copy.title}</h2>
				<p className="mt-2 text-sm text-(--semi-color-text-2)">{copy.description}</p>
			</div>

			{mode === "sign-up" ? (
				<label className="block space-y-2">
					<span className="text-sm font-medium">显示名称</span>
					<Input
						autoComplete="name"
						placeholder="请输入名称"
						value={name}
						onChange={(value) => setName(value)}
					/>
				</label>
			) : null}

			<label className="block space-y-2">
				<span className="text-sm font-medium">邮箱</span>
				<Input
					autoComplete="email"
					type="email"
					placeholder="name@example.com"
					value={email}
					onChange={(value) => setEmail(value)}
				/>
			</label>

			<label className="block space-y-2">
				<span className="text-sm font-medium">密码</span>
				<Input
					autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
					type="password"
					placeholder="至少 8 位"
					value={password}
					onChange={(value) => setPassword(value)}
				/>
			</label>

			{error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">{error}</p> : null}

			<Button block htmlType="submit" loading={isSubmitting} size="large" theme="solid" type="primary">
				{copy.action}
			</Button>

			<p className="text-center text-sm text-(--semi-color-text-2)">
				{copy.alternatePrompt}
				<Button
					className="ml-1 h-auto! p-0! align-baseline!"
					htmlType="button"
					theme="borderless"
					type="tertiary"
					onClick={switchMode}
				>
					{copy.alternateAction}
				</Button>
			</p>
		</form>
	);
}
