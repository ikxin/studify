import type { Metadata } from "next";
import Link from "next/link";
import { ALLOWED_GITHUB_LOGIN } from "@/lib/auth";

export const metadata: Metadata = {
	title: "登录 - Entrant",
	description: "登录 Entrant",
};

const errorMessages: Record<string, string> = {
	cancelled: "GitHub 授权已取消，请重新授权。",
	code: "GitHub 授权码已失效，请重新登录。",
	config: "GitHub OAuth 配置缺失，请检查环境变量。",
	oauth: "GitHub OAuth 授权失败，请稍后重试。",
	profile: "无法读取 GitHub 用户信息，请稍后重试。",
	state: "登录状态校验失败，请重新发起登录。",
	unauthorized: `当前 GitHub 账号无权访问，仅允许 ${ALLOWED_GITHUB_LOGIN} 登录。`,
};

type LoginPageProps = {
	searchParams: Promise<{
		error?: string | string[];
	}>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const { error } = await searchParams;
	const errorKey = Array.isArray(error) ? error[0] : error;
	const errorMessage = errorKey ? errorMessages[errorKey] ?? "登录失败，请重新尝试。" : null;

	return (
		<main className="grid min-h-dvh bg-[color:var(--semi-color-bg-0)] text-[color:var(--semi-color-text-0)] lg:grid-cols-[minmax(0,1fr)_480px]">
			<section className="hidden min-h-0 flex-col justify-between border-r border-[color:var(--semi-color-border)] bg-[color:var(--semi-color-bg-1)] p-10 lg:flex">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-semibold text-white">E</div>
					<div>
						<p className="text-base font-semibold">Entrant</p>
						<p className="text-sm text-[color:var(--semi-color-text-2)]">OpenNext Cloudflare 应用</p>
					</div>
				</div>

				<div className="max-w-xl">
					<p className="mb-4 text-sm font-medium text-blue-600">工作台登录</p>
					<h1 className="text-4xl font-semibold leading-tight">管理入口，保持清晰高效。</h1>
					<p className="mt-5 max-w-lg text-base leading-7 text-[color:var(--semi-color-text-2)]">
						使用 GitHub 账号完成授权，仅允许 {ALLOWED_GITHUB_LOGIN} 访问模板、基础数据、测试功能和系统设置。
					</p>
				</div>

				<p className="text-sm text-[color:var(--semi-color-text-2)]">
					Copyright &copy; {new Date().getFullYear()} Entrant. All Rights Reserved.
				</p>
			</section>

			<section className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6 lg:min-h-0 lg:px-10">
				<div className="w-full max-w-sm">
					<div className="mb-8 lg:hidden">
						<div className="mb-5 flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-semibold text-white">E</div>
							<div>
								<p className="text-base font-semibold">Entrant</p>
								<p className="text-sm text-[color:var(--semi-color-text-2)]">OpenNext Cloudflare 应用</p>
							</div>
						</div>
						<h1 className="text-2xl font-semibold">欢迎回来</h1>
						<p className="mt-2 text-sm text-[color:var(--semi-color-text-2)]">使用 GitHub 授权后继续访问管理工作台。</p>
					</div>

					<div className="rounded-lg border border-[color:var(--semi-color-border)] bg-[color:var(--semi-color-bg-1)] p-6 shadow-sm sm:p-8">
						<div className="mb-6 hidden lg:block">
							<h2 className="text-2xl font-semibold">GitHub 登录</h2>
							<p className="mt-2 text-sm text-[color:var(--semi-color-text-2)]">授权后会校验 GitHub 用户名。</p>
						</div>

						{errorMessage ? (
							<div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
								{errorMessage}
							</div>
						) : null}

						<a
							href="/api/auth/github"
							className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500/30"
						>
							<span className="text-base leading-none">GitHub</span>
							<span>授权登录</span>
						</a>

						<p className="mt-4 text-sm leading-6 text-[color:var(--semi-color-text-2)]">
							授权成功后系统会读取 GitHub 基础资料，并仅在用户名为 {ALLOWED_GITHUB_LOGIN} 时放行。
						</p>

						<p className="mt-6 text-center text-sm text-[color:var(--semi-color-text-2)]">
							<Link href="/" className="font-medium text-blue-600 hover:text-blue-700">
								返回首页
							</Link>
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
