import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE, getGitHubOAuthConfig, verifySessionCookieValue } from "@/lib/auth";
import type { StudentFilterOptions, StudentListData, StudentRecord, StudentSortBy, StudentSortOrder } from "@/types/students";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const UNFILLED_VALUE = "未填写";

type BindValue = string | number | null;

type CountRow = {
	total: number | null;
};

type OptionRow = {
	value: string | null;
};

type FilterConfig = {
	queryKey: string;
	column: string;
};

const filterConfigs: FilterConfig[] = [
	{ queryKey: "campusName", column: "campus_name" },
	{ queryKey: "departmentName", column: "department_name" },
	{ queryKey: "majorName", column: "major_name" },
	{ queryKey: "gradeYear", column: "grade_year" },
	{ queryKey: "registerStatus", column: "register_status" },
	{ queryKey: "checkinStatus", column: "checkin_status" },
	{ queryKey: "preRegisterStatus", column: "pre_register_status" },
];

const sortColumns = {
	studentNumber: "student_number",
	candidateNumber: "candidate_number",
	studentName: "student_name",
	idCardNumber: "id_card_number",
	gender: "gender",
	campusName: "campus_name",
	departmentCode: "department_code",
	departmentName: "department_name",
	majorCode: "major_code",
	majorName: "major_name",
	gradeYear: "grade_year",
	className: "class_name",
	sourcePlace: "source_place",
	studyYears: "study_years",
	studyStatus: "study_status",
	birthDate: "birth_date",
	politicalStatus: "political_status",
	ethnicGroup: "ethnic_group",
	candidateType: "candidate_type",
	freshmanInfoStatus: "freshman_info_status",
	hasAllergen: "has_allergen",
	clothingSize: "clothing_size",
	shoeSize: "shoe_size",
	registerTerm: "register_term",
	registerStatus: "register_status",
	checkinStatus: "checkin_status",
	checkinDate: "checkin_date",
	fromPoorCounty: "from_poor_county",
	subjectType: "subject_type",
	subjectCode: "subject_code",
	subjectName: "subject_name",
	middleSchoolCode: "middle_school_code",
	middleSchoolName: "middle_school_name",
	outsideProvinceSchool: "outside_province_school",
	landlinePhone: "landline_phone",
	mobilePhone: "mobile_phone",
	phoneContact: "phone_contact",
	postalCode: "postal_code",
	mailRecipient: "mail_recipient",
	mailAddress: "mail_address",
	candidateCategory: "candidate_category",
	graduationCategory: "graduation_category",
	admissionMajor: "admission_major",
	admissionProvince: "admission_province",
	familyPhone: "family_phone",
	contactPhone: "contact_phone",
	singleParentFamily: "single_parent_family",
	orphanStatus: "orphan_status",
	familyAnnualIncome: "family_annual_income",
	familyPopulation: "family_population",
	martyrChild: "martyr_child",
	westAidStudent: "west_aid_student",
	preRegisterStatus: "pre_register_status",
	checkinPlan: "checkin_plan",
	lateReason: "late_reason",
	cadreApplyStatus: "cadre_apply_status",
	dormApplyStatus: "dorm_apply_status",
	hardshipApplyStatus: "hardship_apply_status",
} as const satisfies Record<StudentSortBy, string>;

const optionColumns = {
	campuses: "campus_name",
	departments: "department_name",
	majors: "major_name",
	gradeYears: "grade_year",
	registerStatuses: "register_status",
	checkinStatuses: "checkin_status",
	preRegisterStatuses: "pre_register_status",
} as const satisfies Record<keyof StudentFilterOptions, string>;

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
		const searchParams = request.nextUrl.searchParams;
		const currentPage = Math.max(toInteger(searchParams.get("page"), 1), 1);
		const pageSize = clamp(toInteger(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE), 1, MAX_PAGE_SIZE);
		const sortBy = parseSortBy(searchParams.get("sortBy"));
		const sortOrder = parseSortOrder(searchParams.get("sortOrder"));
		const offset = (currentPage - 1) * pageSize;
		const { whereSql, params } = buildWhereClause(searchParams);
		const orderSql = buildOrderSql(sortBy, sortOrder);

		const rowsSql = `
			SELECT
				id,
				student_number AS "studentNumber",
				candidate_number AS "candidateNumber",
				student_name AS "studentName",
				id_card_number AS "idCardNumber",
				gender,
				campus_name AS "campusName",
				department_code AS "departmentCode",
				department_name AS "departmentName",
				major_code AS "majorCode",
				major_name AS "majorName",
				grade_year AS "gradeYear",
				class_name AS "className",
				source_place AS "sourcePlace",
				study_years AS "studyYears",
				study_status AS "studyStatus",
				birth_date AS "birthDate",
				political_status AS "politicalStatus",
				ethnic_group AS "ethnicGroup",
				candidate_type AS "candidateType",
				freshman_info_status AS "freshmanInfoStatus",
				has_allergen AS "hasAllergen",
				clothing_size AS "clothingSize",
				shoe_size AS "shoeSize",
				register_term AS "registerTerm",
				register_status AS "registerStatus",
				checkin_status AS "checkinStatus",
				checkin_date AS "checkinDate",
				from_poor_county AS "fromPoorCounty",
				subject_type AS "subjectType",
				subject_code AS "subjectCode",
				subject_name AS "subjectName",
				middle_school_code AS "middleSchoolCode",
				middle_school_name AS "middleSchoolName",
				outside_province_school AS "outsideProvinceSchool",
				landline_phone AS "landlinePhone",
				mobile_phone AS "mobilePhone",
				phone_contact AS "phoneContact",
				postal_code AS "postalCode",
				mail_recipient AS "mailRecipient",
				mail_address AS "mailAddress",
				candidate_category AS "candidateCategory",
				graduation_category AS "graduationCategory",
				admission_major AS "admissionMajor",
				admission_province AS "admissionProvince",
				family_phone AS "familyPhone",
				contact_phone AS "contactPhone",
				single_parent_family AS "singleParentFamily",
				orphan_status AS "orphanStatus",
				family_annual_income AS "familyAnnualIncome",
				family_population AS "familyPopulation",
				martyr_child AS "martyrChild",
				west_aid_student AS "westAidStudent",
				pre_register_status AS "preRegisterStatus",
				checkin_plan AS "checkinPlan",
				late_reason AS "lateReason",
				cadre_apply_status AS "cadreApplyStatus",
				dorm_apply_status AS "dormApplyStatus",
				hardship_apply_status AS "hardshipApplyStatus"
			FROM entrant
			${whereSql}
			${orderSql}
			LIMIT ? OFFSET ?
		`;

		const countSql = `
			SELECT COUNT(*) AS total
			FROM entrant
			${whereSql}
		`;

		const [rowsResult, count, filterOptions] = await Promise.all([
			prepare(env.DB, rowsSql, [...params, pageSize, offset]).all<StudentRecord>(),
			prepare(env.DB, countSql, params).first<CountRow>(),
			queryFilterOptions(env.DB),
		]);

		const rows = rowsResult.results ?? [];

		const data: StudentListData = {
			rows,
			pagination: {
				currentPage,
				pageSize,
				total: toNumber(count?.total),
			},
			filterOptions,
			updatedAt: new Date().toISOString(),
		};

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to load student data" },
			{ status: 500 },
		);
	}
}

function buildWhereClause(searchParams: URLSearchParams) {
	const conditions: string[] = [];
	const params: BindValue[] = [];
	const keyword = normalizeInput(searchParams.get("keyword"));

	if (keyword) {
		const keywordParam = `%${escapeLike(keyword.toLowerCase())}%`;
		const keywordColumns = Object.values(sortColumns);

		conditions.push(
			`(${keywordColumns.map((column) => `LOWER(COALESCE(${column}, '')) LIKE ? ESCAPE '\\'`).join(" OR ")})`,
		);
		params.push(...keywordColumns.map(() => keywordParam));
	}

	for (const filter of filterConfigs) {
		const value = normalizeInput(searchParams.get(filter.queryKey));

		if (!value) {
			continue;
		}

		if (value === UNFILLED_VALUE) {
			conditions.push(`(${filter.column} IS NULL OR ${filter.column} = '' OR ${filter.column} = ?)`);
			params.push(UNFILLED_VALUE);
		} else {
			conditions.push(`${filter.column} = ?`);
			params.push(value);
		}
	}

	return {
		whereSql: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
		params,
	};
}

async function queryFilterOptions(db: D1Database): Promise<StudentFilterOptions> {
	const entries = await Promise.all(
		Object.entries(optionColumns).map(async ([key, column]) => {
			const { results } = await db
				.prepare(
					`
					SELECT COALESCE(NULLIF(${column}, ''), ?) AS value
					FROM entrant
					GROUP BY 1
					ORDER BY
						CASE WHEN COALESCE(NULLIF(${column}, ''), ?) = ? THEN 1 ELSE 0 END,
						COALESCE(NULLIF(${column}, ''), ?) COLLATE NOCASE ASC
					LIMIT 200
					`,
				)
				.bind(UNFILLED_VALUE, UNFILLED_VALUE, UNFILLED_VALUE, UNFILLED_VALUE)
				.all<OptionRow>();

			return [key, (results ?? []).map((row) => row.value).filter(isPresentString)] as const;
		}),
	);

	return Object.fromEntries(entries) as StudentFilterOptions;
}

function prepare(db: D1Database, sql: string, params: BindValue[]) {
	const statement = db.prepare(sql);

	return params.length > 0 ? statement.bind(...params) : statement;
}

function buildOrderSql(sortBy: StudentSortBy, sortOrder: StudentSortOrder) {
	const column = sortColumns[sortBy];
	const direction = sortOrder === "ascend" ? "ASC" : "DESC";

	return `ORDER BY (${column} IS NULL OR ${column} = '') ASC, ${column} COLLATE NOCASE ${direction}, student_name COLLATE NOCASE ASC`;
}

function parseSortBy(value: string | null): StudentSortBy {
	return value && value in sortColumns ? (value as StudentSortBy) : "candidateNumber";
}

function parseSortOrder(value: string | null): StudentSortOrder {
	return value === "descend" ? "descend" : "ascend";
}

function normalizeInput(value: string | null) {
	return value?.trim() ?? "";
}

function toInteger(value: string | null, fallback: number) {
	const parsed = Number.parseInt(value ?? "", 10);

	return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, minimum: number, maximum: number) {
	return Math.min(Math.max(value, minimum), maximum);
}

function toNumber(value: number | null | undefined) {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function escapeLike(value: string) {
	return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function isPresentString(value: string | null): value is string {
	return typeof value === "string" && value.length > 0;
}
