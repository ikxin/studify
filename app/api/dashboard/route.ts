import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE, getGitHubOAuthConfig, verifySessionCookieValue } from "@/lib/auth";
import type { DashboardData, DashboardRecentCheckin } from "@/types/dashboard";

export const dynamic = "force-dynamic";

type SummaryRow = {
	total: number | null;
	registered: number | null;
	checkedIn: number | null;
	preRegistered: number | null;
	infoCompleted: number | null;
};

type DistributionRow = {
	label: string | null;
	total: number;
};

export async function GET(request: NextRequest) {
	const config = getGitHubOAuthConfig();

	if (!config) {
		return NextResponse.json({ error: "GitHub OAuth is not configured" }, { status: 503 });
	}

	const user = await verifySessionCookieValue(request.cookies.get(AUTH_SESSION_COOKIE)?.value, config.clientSecret);

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { env } = await getCloudflareContext({ async: true });

		const summary = await env.DB.prepare(
			`
			SELECT
				COUNT(*) AS total,
				COALESCE(SUM(CASE WHEN register_status = '已注册' THEN 1 ELSE 0 END), 0) AS registered,
				COALESCE(SUM(CASE WHEN checkin_status = '已报到' THEN 1 ELSE 0 END), 0) AS checkedIn,
				COALESCE(SUM(CASE WHEN pre_register_status = '已预注册' THEN 1 ELSE 0 END), 0) AS preRegistered,
				COALESCE(SUM(CASE WHEN freshman_info_status IS NOT NULL AND freshman_info_status != '' AND freshman_info_status != '未填写' THEN 1 ELSE 0 END), 0) AS infoCompleted
			FROM entrant
			`,
		).first<SummaryRow>();

		if (!summary) {
			return NextResponse.json({ error: "Dashboard summary query returned no result" }, { status: 500 });
		}

		const total = toNumber(summary.total);

		const [departments, campuses, registerStatus, checkinStatus, recentCheckins] = await Promise.all([
			queryDistribution(
				env.DB,
				`
				SELECT COALESCE(NULLIF(department_name, ''), '未填写') AS label, COUNT(*) AS total
				FROM entrant
				GROUP BY 1
				ORDER BY total DESC
				LIMIT 8
				`,
				total,
			),
			queryDistribution(
				env.DB,
				`
				SELECT COALESCE(NULLIF(campus_name, ''), '未填写') AS label, COUNT(*) AS total
				FROM entrant
				GROUP BY 1
				ORDER BY total DESC
				LIMIT 8
				`,
				total,
			),
			queryDistribution(
				env.DB,
				`
				SELECT COALESCE(NULLIF(register_status, ''), '未填写') AS label, COUNT(*) AS total
				FROM entrant
				GROUP BY 1
				ORDER BY total DESC
				`,
				total,
			),
			queryDistribution(
				env.DB,
				`
				SELECT COALESCE(NULLIF(checkin_status, ''), '未填写') AS label, COUNT(*) AS total
				FROM entrant
				GROUP BY 1
				ORDER BY total DESC
				`,
				total,
			),
			queryRecentCheckins(env.DB),
		]);

		const registered = toNumber(summary.registered);
		const checkedIn = toNumber(summary.checkedIn);
		const preRegistered = toNumber(summary.preRegistered);
		const infoCompleted = toNumber(summary.infoCompleted);

		const data: DashboardData = {
			summary: {
				total,
				registered,
				checkedIn,
				preRegistered,
				infoCompleted,
				pendingRegister: Math.max(total - registered, 0),
				pendingCheckin: Math.max(total - checkedIn, 0),
				registerRate: toPercentage(registered, total),
				checkinRate: toPercentage(checkedIn, total),
				preRegisterRate: toPercentage(preRegistered, total),
				infoCompletionRate: toPercentage(infoCompleted, total),
			},
			distributions: {
				departments,
				campuses,
				registerStatus,
				checkinStatus,
			},
			recentCheckins,
			updatedAt: new Date().toISOString(),
		};

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to load dashboard data" },
			{ status: 500 },
		);
	}
}

async function queryDistribution(db: D1Database, sql: string, total: number) {
	const { results } = await db.prepare(sql).all<DistributionRow>();

	return (results ?? []).map((row) => ({
		label: row.label ?? "未填写",
		total: toNumber(row.total),
		percentage: toPercentage(row.total, total),
	}));
}

async function queryRecentCheckins(db: D1Database) {
	const { results } = await db
		.prepare(
			`
			SELECT
				id,
				student_name AS "studentName",
				department_name AS "departmentName",
				major_name AS "majorName",
				campus_name AS "campusName",
				checkin_date AS "checkinDate"
			FROM entrant
			WHERE checkin_status = '已报到'
			ORDER BY checkin_date DESC, student_name ASC
			LIMIT 8
			`,
		)
		.all<DashboardRecentCheckin>();

	return results ?? [];
}

function toNumber(value: number | null | undefined) {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toPercentage(value: number | null | undefined, total: number) {
	if (total <= 0) {
		return 0;
	}

	return Math.round((toNumber(value) / total) * 1000) / 10;
}
