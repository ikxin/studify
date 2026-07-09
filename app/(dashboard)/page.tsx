"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, Button, Card, Empty, Typography } from "@douyinfe/semi-ui";
import {
	IconAlertTriangle,
	IconBarChartVStroked,
	IconGridView,
	IconRefresh,
	IconTickCircle,
	IconUserGroup,
} from "@douyinfe/semi-icons";
import type { DashboardData } from "@/types/dashboard";

const { Text, Title } = Typography;

type DashboardState =
	| { status: "loading"; data: null; error: null }
	| { status: "refreshing"; data: DashboardData; error: null }
	| { status: "ready"; data: DashboardData; error: null }
	| { status: "error"; data: DashboardData | null; error: string };

const numberFormatter = new Intl.NumberFormat("zh-CN");

export default function Home() {
	const [state, setState] = useState<DashboardState>({ status: "loading", data: null, error: null });

	const loadDashboard = useCallback(async () => {
		setState((current) =>
			current.data
				? { status: "refreshing", data: current.data, error: null }
				: { status: "loading", data: null, error: null },
		);

		try {
			const response = await fetch("/api/dashboard", {
				cache: "no-store",
				credentials: "same-origin",
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as { error?: string } | null;
				throw new Error(payload?.error ?? `请求失败：${response.status}`);
			}

			const data = (await response.json()) as DashboardData;
			setState({ status: "ready", data, error: null });
		} catch (error) {
			setState((current) => ({
				status: "error",
				data: current.data,
				error: error instanceof Error ? error.message : "仪表盘数据加载失败",
			}));
		}
	}, []);

	useEffect(() => {
		void loadDashboard();
	}, [loadDashboard]);

	const summaryCards = useMemo(() => {
		if (!state.data) {
			return [];
		}

		const { summary } = state.data;

		return [
			{
				label: "新生总数",
				value: summary.total,
				detail: "D1 entrant",
				icon: <IconUserGroup size="large" />,
				color: "light-blue" as const,
			},
			{
				label: "已预注册",
				value: summary.preRegistered,
				detail: `${summary.preRegisterRate}%`,
				icon: <IconGridView size="large" />,
				color: "amber" as const,
			},
			{
				label: "已注册",
				value: summary.registered,
				detail: `${summary.registerRate}%`,
				icon: <IconTickCircle size="large" />,
				color: "green" as const,
			},
			{
				label: "已报到",
				value: summary.checkedIn,
				detail: `${summary.checkinRate}%`,
				icon: <IconBarChartVStroked size="large" />,
				color: "blue" as const,
			},
		];
	}, [state.data]);

	const isLoading = state.status === "loading";

	return (
		<main className="flex w-full flex-col gap-6">
			<header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div className="flex min-w-0 flex-col gap-1">
					<Title heading={3} className="text-center md:text-left">
						仪表盘
					</Title>
					{state.data ? (
						<Text type="secondary" className="text-center md:text-left">
							更新于 {formatDateTime(state.data.updatedAt)}
						</Text>
					) : null}
				</div>
				<Button
					theme="solid"
					type="primary"
					icon={<IconRefresh />}
					loading={state.status === "loading" || state.status === "refreshing"}
					onClick={() => void loadDashboard()}
					className="self-stretch md:self-auto"
				>
					刷新
				</Button>
			</header>

			{state.status === "error" ? (
				<Card>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex min-w-0 items-center gap-3">
							<Avatar color="red" shape="square" size="large" alt="加载失败">
								<IconAlertTriangle size="large" />
							</Avatar>
							<div className="min-w-0">
								<Title heading={5}>数据加载失败</Title>
								<Text type="danger" className="wrap-break-word">
									{state.error}
								</Text>
							</div>
						</div>
						<Button theme="borderless" type="primary" icon={<IconRefresh />} onClick={() => void loadDashboard()}>
							重试
						</Button>
					</div>
				</Card>
			) : null}

			<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{isLoading ? (
					<SummarySkeleton />
				) : (
					summaryCards.map((card) => (
						<Card key={card.label} shadows="hover" className="min-h-32">
							<div className="flex h-full items-center justify-between gap-4">
								<div className="flex min-w-0 flex-col gap-1">
									<Text type="secondary">{card.label}</Text>
									<Title heading={3}>{formatNumber(card.value)}</Title>
									<Text type="tertiary">{card.detail}</Text>
								</div>
								<Avatar color={card.color} shape="square" size="large" alt={card.label}>
									{card.icon}
								</Avatar>
							</div>
						</Card>
					))
				)}
			</section>

			{state.data ? (
				<>
					<section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
						<Card title="办理进度" className="min-h-80">
							<div className="flex flex-col gap-5">
								<ProgressRow
									label="预注册"
									value={state.data.summary.preRegistered}
									total={state.data.summary.total}
									percentage={state.data.summary.preRegisterRate}
								/>
								<ProgressRow
									label="注册"
									value={state.data.summary.registered}
									total={state.data.summary.total}
									percentage={state.data.summary.registerRate}
								/>
								<ProgressRow
									label="报到"
									value={state.data.summary.checkedIn}
									total={state.data.summary.total}
									percentage={state.data.summary.checkinRate}
								/>
								<div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
									<SmallMetric label="待注册" value={state.data.summary.pendingRegister} />
									<SmallMetric label="待报到" value={state.data.summary.pendingCheckin} />
								</div>
							</div>
						</Card>

						<Card title="学院人数 TOP 8" className="min-h-80">
							<DistributionList rows={state.data.distributions.departments} />
						</Card>
					</section>

					<section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<Card title="注册状态" className="min-h-64">
							<DistributionList rows={state.data.distributions.registerStatus} />
						</Card>

						<Card title="报到状态" className="min-h-64">
							<DistributionList rows={state.data.distributions.checkinStatus} />
						</Card>
					</section>

					<section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
						<Card title="校区分布" className="min-h-80">
							<DistributionList rows={state.data.distributions.campuses} />
						</Card>

						<Card title="最近报到" className="min-h-80">
							{state.data.recentCheckins.length > 0 ? (
								<div className="divide-y divide-(--semi-color-border)">
									{state.data.recentCheckins.map((entrant) => (
										<div key={entrant.id} className="grid gap-2 py-3 md:grid-cols-[minmax(120px,0.4fr)_minmax(0,1fr)_auto] md:items-center">
											<div className="flex min-w-0 flex-col">
												<Text strong className="truncate">
													{entrant.studentName}
												</Text>
												<Text type="tertiary">{entrant.checkinDate ?? "未填写"}</Text>
											</div>
											<div className="min-w-0">
												<Text className="block truncate">{entrant.departmentName ?? "未填写"}</Text>
												<Text type="secondary" className="block truncate">
													{entrant.majorName ?? "未填写"}
												</Text>
											</div>
											<Text type="tertiary" className="md:text-right">
												{entrant.campusName ?? "未填写"}
											</Text>
										</div>
									))}
								</div>
							) : (
								<div className="flex min-h-56 items-center justify-center">
									<Empty title="暂无报到记录" description="当前没有已报到的新生记录。" />
								</div>
							)}
						</Card>
					</section>
				</>
			) : null}

		</main>
	);
}

function SummarySkeleton() {
	return Array.from({ length: 4 }, (_, index) => (
		<Card key={index} className="min-h-32">
			<div className="flex h-full animate-pulse items-center justify-between gap-4">
				<div className="flex flex-1 flex-col gap-3">
					<div className="h-4 w-24 rounded bg-(--semi-color-fill-0)" />
					<div className="h-8 w-28 rounded bg-(--semi-color-fill-1)" />
					<div className="h-3 w-16 rounded bg-(--semi-color-fill-0)" />
				</div>
				<div className="size-10 rounded bg-(--semi-color-fill-1)" />
			</div>
		</Card>
	));
}

function SmallMetric({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-md border border-(--semi-color-border) bg-(--semi-color-bg-0) p-4">
			<Text type="secondary">{label}</Text>
			<Title heading={4}>{formatNumber(value)}</Title>
		</div>
	);
}

function ProgressRow({
	label,
	value,
	total,
	percentage,
}: {
	label: string;
	value: number;
	total: number;
	percentage: number;
}) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between gap-3">
				<Text strong>{label}</Text>
				<Text type="secondary">
					{formatNumber(value)} / {formatNumber(total)}
				</Text>
			</div>
			<div className="h-2.5 overflow-hidden rounded-full bg-(--semi-color-fill-0)">
				<div className="h-full rounded-full bg-(--semi-color-primary)" style={{ width: `${Math.min(percentage, 100)}%` }} />
			</div>
			<Text type="tertiary">{percentage}%</Text>
		</div>
	);
}

function DistributionList({
	rows,
}: {
	rows: Array<{
		label: string | null;
		total: number;
		percentage: number;
	}>;
}) {
	if (rows.length === 0) {
		return (
			<div className="flex min-h-56 items-center justify-center">
				<Empty title="暂无数据" description="当前没有可展示的分布数据。" />
			</div>
		);
	}

	const max = Math.max(...rows.map((row) => row.total), 1);

	return (
		<div className="flex flex-col gap-4">
			{rows.map((row) => (
				<div key={row.label ?? "empty"} className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-3">
						<Text className="truncate">{row.label ?? "未填写"}</Text>
						<Text type="secondary" className="shrink-0">
							{formatNumber(row.total)}
						</Text>
					</div>
					<div className="h-2.5 overflow-hidden rounded-full bg-(--semi-color-fill-0)">
						<div className="h-full rounded-full bg-(--semi-color-primary)" style={{ width: `${(row.total / max) * 100}%` }} />
					</div>
					<Text type="tertiary">{row.percentage}%</Text>
				</div>
			))}
		</div>
	);
}

function formatNumber(value: number) {
	return numberFormatter.format(value);
}

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(value));
}
