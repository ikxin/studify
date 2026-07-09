"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Select, SideSheet, Table, Tag, Typography } from "@douyinfe/semi-ui";
import { IconAlertTriangle, IconClear, IconEyeOpened, IconRefresh, IconSearch } from "@douyinfe/semi-icons";
import type { ColumnProps, OnChange } from "@douyinfe/semi-ui/lib/es/table/interface";
import type {
	StudentFieldKey,
	StudentFilterOptions,
	StudentFilters,
	StudentListData,
	StudentListQuery,
	StudentRecord,
	StudentSortBy,
} from "@/types/students";

const { Text, Title } = Typography;

type StudentState =
	| { status: "loading"; data: null; error: null }
	| { status: "refreshing"; data: StudentListData; error: null }
	| { status: "ready"; data: StudentListData; error: null }
	| { status: "error"; data: StudentListData | null; error: string };

type SelectFilterKey = Exclude<keyof StudentFilters, "keyword">;

const emptyFilters: StudentFilters = {
	keyword: "",
	campusName: "",
	departmentName: "",
	majorName: "",
	gradeYear: "",
	registerStatus: "",
	checkinStatus: "",
	preRegisterStatus: "",
};

const filterKeys: Array<keyof StudentFilters> = [
	"keyword",
	"campusName",
	"departmentName",
	"majorName",
	"gradeYear",
	"registerStatus",
	"checkinStatus",
	"preRegisterStatus",
];

const defaultFilterOptions: StudentFilterOptions = {
	campuses: [],
	departments: [],
	majors: [],
	gradeYears: [],
	registerStatuses: [],
	checkinStatuses: [],
	preRegisterStatuses: [],
};

const defaultQuery: StudentListQuery = {
	...emptyFilters,
	currentPage: 1,
	pageSize: 20,
	sortBy: "candidateNumber",
	sortOrder: "ascend",
};

const numberFormatter = new Intl.NumberFormat("zh-CN");

type StudentFieldDefinition = {
	key: StudentFieldKey;
	label: string;
	width: number;
	fixed?: "left";
	strong?: boolean;
	ellipsis?: boolean;
	statusTag?: boolean;
};

const studentTableFields: StudentFieldDefinition[] = [
	{ key: "candidateNumber", label: "考生号", width: 180, fixed: "left" },
	{ key: "studentName", label: "姓名", width: 120, fixed: "left", strong: true },
	{ key: "studentNumber", label: "学号", width: 140 },
	{ key: "idCardNumber", label: "身份证号", width: 190 },
	{ key: "gender", label: "性别", width: 90 },
	{ key: "campusName", label: "所在校区", width: 140 },
	{ key: "departmentCode", label: "院系代码", width: 120 },
	{ key: "departmentName", label: "院系", width: 220, ellipsis: true },
	{ key: "majorCode", label: "专业代码", width: 120 },
	{ key: "majorName", label: "专业", width: 220, ellipsis: true },
	{ key: "gradeYear", label: "年级", width: 100 },
	{ key: "className", label: "班级", width: 180, ellipsis: true },
	{ key: "sourcePlace", label: "生源地", width: 160, ellipsis: true },
	{ key: "studyYears", label: "学制", width: 90 },
	{ key: "studyStatus", label: "就读状况", width: 120 },
	{ key: "birthDate", label: "出生日期", width: 130 },
	{ key: "politicalStatus", label: "政治面貌", width: 140 },
	{ key: "ethnicGroup", label: "民族", width: 100 },
	{ key: "candidateType", label: "考生类型", width: 140 },
	{ key: "freshmanInfoStatus", label: "新生是否已填写信息", width: 170, statusTag: true },
	{ key: "hasAllergen", label: "是否有过敏源", width: 140 },
	{ key: "clothingSize", label: "衣服码数", width: 110 },
	{ key: "shoeSize", label: "鞋码", width: 90 },
	{ key: "registerTerm", label: "注册学期", width: 120 },
	{ key: "registerStatus", label: "是否已注册", width: 120, statusTag: true },
	{ key: "checkinStatus", label: "报到状态", width: 120, statusTag: true },
	{ key: "checkinDate", label: "报到时间", width: 150 },
	{ key: "fromPoorCounty", label: "是否来自贫困县", width: 150 },
	{ key: "subjectType", label: "科类", width: 100 },
	{ key: "subjectCode", label: "科类号", width: 110 },
	{ key: "subjectName", label: "科类名称", width: 130 },
	{ key: "middleSchoolCode", label: "毕业中学号", width: 140 },
	{ key: "middleSchoolName", label: "毕业中学名称", width: 220, ellipsis: true },
	{ key: "outsideProvinceSchool", label: "是否外省中学", width: 140 },
	{ key: "landlinePhone", label: "固定电话", width: 150 },
	{ key: "mobilePhone", label: "移动电话", width: 150 },
	{ key: "phoneContact", label: "电话联系人", width: 130 },
	{ key: "postalCode", label: "邮政编码", width: 120 },
	{ key: "mailRecipient", label: "收件人", width: 120 },
	{ key: "mailAddress", label: "邮件地址", width: 260, ellipsis: true },
	{ key: "candidateCategory", label: "考生类别名称", width: 150 },
	{ key: "graduationCategory", label: "毕业类别名称", width: 150 },
	{ key: "admissionMajor", label: "录取专业名称", width: 220, ellipsis: true },
	{ key: "admissionProvince", label: "录取省份", width: 120 },
	{ key: "familyPhone", label: "家庭电话", width: 150 },
	{ key: "contactPhone", label: "联系电话", width: 150 },
	{ key: "singleParentFamily", label: "是否单亲家庭", width: 140 },
	{ key: "orphanStatus", label: "是否孤儿", width: 110 },
	{ key: "familyAnnualIncome", label: "家庭年均收入", width: 140 },
	{ key: "familyPopulation", label: "人口", width: 90 },
	{ key: "martyrChild", label: "是否革命烈士子女", width: 170 },
	{ key: "westAidStudent", label: "是否西部大开发助学工程学生", width: 230 },
	{ key: "preRegisterStatus", label: "预注册情况", width: 130, statusTag: true },
	{ key: "checkinPlan", label: "计划报到时间", width: 150 },
	{ key: "lateReason", label: "非准时报到原因", width: 200, ellipsis: true },
	{ key: "cadreApplyStatus", label: "是否申请学生干部", width: 160, statusTag: true },
	{ key: "dormApplyStatus", label: "是否申请特殊住宿", width: 160, statusTag: true },
	{ key: "hardshipApplyStatus", label: "是否申请困难家庭", width: 160, statusTag: true },
];

const studentFieldByKey = Object.fromEntries(
	studentTableFields.map((field) => [field.key, field]),
) as Record<StudentFieldKey, StudentFieldDefinition>;

const studentDetailSections: Array<{ title: string; fields: StudentFieldKey[] }> = [
	{
		title: "基本信息",
		fields: [
			"candidateNumber",
			"studentName",
			"studentNumber",
			"idCardNumber",
			"gender",
			"birthDate",
			"ethnicGroup",
			"politicalStatus",
		],
	},
	{
		title: "学籍信息",
		fields: [
			"campusName",
			"departmentCode",
			"departmentName",
			"majorCode",
			"majorName",
			"gradeYear",
			"className",
			"studyYears",
			"studyStatus",
			"sourcePlace",
		],
	},
	{
		title: "招生信息",
		fields: [
			"candidateType",
			"candidateCategory",
			"graduationCategory",
			"subjectType",
			"subjectCode",
			"subjectName",
			"admissionMajor",
			"admissionProvince",
			"middleSchoolCode",
			"middleSchoolName",
			"outsideProvinceSchool",
			"fromPoorCounty",
		],
	},
	{
		title: "联系方式",
		fields: [
			"mobilePhone",
			"contactPhone",
			"phoneContact",
			"landlinePhone",
			"familyPhone",
			"postalCode",
			"mailRecipient",
			"mailAddress",
		],
	},
	{
		title: "报到注册",
		fields: [
			"freshmanInfoStatus",
			"preRegisterStatus",
			"registerTerm",
			"registerStatus",
			"checkinStatus",
			"checkinDate",
			"checkinPlan",
			"lateReason",
		],
	},
	{
		title: "生活与资助",
		fields: [
			"hasAllergen",
			"clothingSize",
			"shoeSize",
			"singleParentFamily",
			"orphanStatus",
			"familyAnnualIncome",
			"familyPopulation",
			"martyrChild",
			"westAidStudent",
			"cadreApplyStatus",
			"dormApplyStatus",
			"hardshipApplyStatus",
		],
	},
];

const sortableFields = new Set<StudentSortBy>(studentTableFields.map((field) => field.key));
const tableScrollX = studentTableFields.reduce((sum, field) => sum + field.width, 96);
const studentTableClassName = [
	"[&_.semi-table-thead_.semi-table-row-head]:!whitespace-nowrap",
	"[&_.semi-table-thead_.semi-table-row-head]:[overflow-wrap:normal]",
	"[&_.semi-table-thead_.semi-table-header-column]:!whitespace-nowrap",
	"[&_.semi-table-thead_.semi-table-row-head-title]:!whitespace-nowrap",
].join(" ");

export default function ManagerPage() {
	const [draftFilters, setDraftFilters] = useState<StudentFilters>(emptyFilters);
	const [query, setQuery] = useState<StudentListQuery>(defaultQuery);
	const [refreshKey, setRefreshKey] = useState(0);
	const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
	const [state, setState] = useState<StudentState>({ status: "loading", data: null, error: null });

	useEffect(() => {
		const controller = new AbortController();

		void fetch(`/api/students?${buildSearchParams(query)}`, {
			cache: "no-store",
			credentials: "same-origin",
			signal: controller.signal,
		})
			.then(async (response) => {
				if (!response.ok) {
					const payload = (await response.json().catch(() => null)) as { error?: string } | null;
					throw new Error(payload?.error ?? `请求失败：${response.status}`);
				}

				return (await response.json()) as StudentListData;
			})
			.then((data) => {
				setState({ status: "ready", data, error: null });
			})
			.catch((error) => {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}

				setState((current) => ({
					status: "error",
					data: current.data,
					error: error instanceof Error ? error.message : "学生数据加载失败",
				}));
			});

		return () => controller.abort();
	}, [query, refreshKey]);

	const beginRequest = useCallback(() => {
		setState((current) =>
			current.data
				? { status: "refreshing", data: current.data, error: null }
				: { status: "loading", data: null, error: null },
		);
	}, []);

	const filterOptions = state.data?.filterOptions ?? defaultFilterOptions;
	const total = state.data?.pagination.total ?? 0;
	const activeFilterCount = countActiveFilters(query);
	const isInitialLoading = state.status === "loading";
	const isRefreshing = state.status === "refreshing";

	const updateDraftFilter = useCallback(<K extends keyof StudentFilters>(field: K, value: StudentFilters[K]) => {
		setDraftFilters((current) => ({ ...current, [field]: value }));
	}, []);

	const applyFilters = useCallback(() => {
		beginRequest();
		setQuery((current) => ({
			...current,
			...draftFilters,
			currentPage: 1,
		}));
	}, [beginRequest, draftFilters]);

	const resetFilters = useCallback(() => {
		beginRequest();
		setDraftFilters(emptyFilters);
		setQuery((current) => ({
			...defaultQuery,
			pageSize: current.pageSize,
		}));
	}, [beginRequest]);

	const handleSelectFilterChange = useCallback(
		(field: SelectFilterKey) => (value: unknown) => {
			updateDraftFilter(field, toSelectString(value));
		},
		[updateDraftFilter],
	);

	const handleTableChange = useCallback<OnChange<StudentRecord>>((changeInfo) => {
		if (changeInfo.extra?.changeType !== "sorter") {
			return;
		}

		const sorter = changeInfo.sorter;

		if (!sorter?.dataIndex) {
			return;
		}

		const nextSortBy = String(sorter.dataIndex) as StudentSortBy;

		if (!sortableFields.has(nextSortBy)) {
			return;
		}

		const nextSortOrder =
			sorter.sortOrder === "ascend" || sorter.sortOrder === "descend" ? sorter.sortOrder : defaultQuery.sortOrder;

		if (query.sortBy === nextSortBy && query.sortOrder === nextSortOrder) {
			return;
		}

		beginRequest();
		setQuery((current) => {
			if (current.sortBy === nextSortBy && current.sortOrder === nextSortOrder) {
				return current;
			}

			return {
				...current,
				currentPage: 1,
				sortBy: nextSortBy,
				sortOrder: nextSortOrder,
			};
		});
	}, [beginRequest, query.sortBy, query.sortOrder]);

	const columns = useMemo<ColumnProps<StudentRecord>[]>(
		() => [
			...studentTableFields.map((field): ColumnProps<StudentRecord> => ({
				title: field.label,
				dataIndex: field.key,
				width: field.width,
				fixed: field.fixed,
				sorter: true,
				sortOrder: getSortOrder(query, field.key),
				ellipsis: field.ellipsis ? { showTitle: true } : undefined,
				render: (value: string | null) => renderStudentCell(value, field),
			})),
			{
				title: "操作",
				dataIndex: "operation",
				width: 96,
				fixed: "right",
				render: (_value: unknown, record) => (
					<Button theme="borderless" type="primary" icon={<IconEyeOpened />} onClick={() => setSelectedStudent(record)}>
						查看
					</Button>
				),
			},
		],
		[query],
	);

	const pagination = useMemo(
		() => ({
			currentPage: query.currentPage,
			pageSize: query.pageSize,
			total,
			showSizeChanger: false,
			showQuickJumper: false,
			onPageChange: (currentPage: number) => {
				if (query.currentPage === currentPage) {
					return;
				}

				beginRequest();
				setQuery((current) => ({ ...current, currentPage }));
			},
		}),
		[beginRequest, query.currentPage, query.pageSize, total],
	);

	return (
		<main className="flex w-full flex-col gap-4">
			{state.status === "error" ? (
				<div className="flex flex-col gap-3 rounded-md border border-(--semi-color-danger-light-default) px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex min-w-0 items-start gap-2">
						<Text type="danger" className="shrink-0 leading-6">
							<IconAlertTriangle />
						</Text>
						<div className="min-w-0">
							<Title heading={6} className="m-0">
								数据加载失败
							</Title>
							<Text type="danger" className="wrap-break-word">
								{state.error}
							</Text>
						</div>
					</div>
					<Button
						theme="borderless"
						type="primary"
						icon={<IconRefresh />}
						onClick={() => {
							beginRequest();
							setRefreshKey((current) => current + 1);
						}}
					>
						重试
					</Button>
				</div>
			) : null}

			<section className="flex flex-col gap-3">
				<Title heading={5} className="m-0">
					查询条件
				</Title>
				<div className="flex flex-col gap-3">
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
						<label className="flex min-w-0 flex-col gap-1">
							<Text type="secondary">关键词</Text>
							<Input
								prefix={<IconSearch />}
								showClear
								placeholder="姓名 / 学号 / 考生号 / 证件 / 电话"
								value={draftFilters.keyword}
								aria-label="关键词"
								onChange={(value) => updateDraftFilter("keyword", value)}
								onEnterPress={applyFilters}
							/>
						</label>
						<FilterSelect
							label="校区"
							value={draftFilters.campusName}
							options={filterOptions.campuses}
							onChange={handleSelectFilterChange("campusName")}
						/>
						<FilterSelect
							label="院系"
							value={draftFilters.departmentName}
							options={filterOptions.departments}
							onChange={handleSelectFilterChange("departmentName")}
						/>
						<FilterSelect
							label="专业"
							value={draftFilters.majorName}
							options={filterOptions.majors}
							onChange={handleSelectFilterChange("majorName")}
						/>
						<FilterSelect
							label="年级"
							value={draftFilters.gradeYear}
							options={filterOptions.gradeYears}
							onChange={handleSelectFilterChange("gradeYear")}
						/>
						<FilterSelect
							label="注册状态"
							value={draftFilters.registerStatus}
							options={filterOptions.registerStatuses}
							onChange={handleSelectFilterChange("registerStatus")}
						/>
						<FilterSelect
							label="报到状态"
							value={draftFilters.checkinStatus}
							options={filterOptions.checkinStatuses}
							onChange={handleSelectFilterChange("checkinStatus")}
						/>
						<FilterSelect
							label="预注册"
							value={draftFilters.preRegisterStatus}
							options={filterOptions.preRegisterStatuses}
							onChange={handleSelectFilterChange("preRegisterStatus")}
						/>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<Text type="tertiary">{activeFilterCount > 0 ? `已应用 ${activeFilterCount} 个条件` : "未应用筛选条件"}</Text>
						<div className="flex flex-col gap-2 sm:flex-row">
							<Button icon={<IconClear />} onClick={resetFilters} className="sm:w-auto">
								重置
							</Button>
							<Button theme="solid" type="primary" icon={<IconSearch />} onClick={applyFilters} className="sm:w-auto">
								查询
							</Button>
						</div>
					</div>
				</div>
			</section>

			<section className="flex min-w-0 flex-col gap-3">
				<div className="flex items-center justify-between gap-3">
					<Title heading={5} className="m-0">
						学生列表
					</Title>
					<Text type="tertiary">共 {formatNumber(total)} 条</Text>
				</div>
				<Table<StudentRecord>
					bordered
					rowKey="id"
					size="small"
					className={studentTableClassName}
					columns={columns}
					dataSource={state.data?.rows ?? []}
					loading={isInitialLoading || isRefreshing}
					pagination={pagination}
					scroll={{ x: tableScrollX }}
					empty={<Empty title="暂无学生" description="没有匹配的学生记录。" />}
					onChange={handleTableChange}
				/>
			</section>

			<SideSheet
				visible={Boolean(selectedStudent)}
				title="学生详情"
				width="min(760px, 100vw)"
				placement="right"
				onCancel={() => setSelectedStudent(null)}
			>
				{selectedStudent ? <StudentDetail student={selectedStudent} /> : null}
			</SideSheet>
		</main>
	);
}

function FilterSelect({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: string[];
	onChange: (value: unknown) => void;
}) {
	return (
		<label className="flex min-w-0 flex-col gap-1">
			<Text type="secondary">{label}</Text>
			<Select
				className="w-full"
				value={value || undefined}
				placeholder={`选择${label}`}
				optionList={toOptionList(options)}
				showClear
				filter
				emptyContent="暂无选项"
				onChange={onChange}
			/>
		</label>
	);
}

function StudentDetail({ student }: { student: StudentRecord }) {
	return (
		<div className="flex flex-col gap-5">
			<div className="min-w-0">
				<Title heading={4} className="m-0 truncate">
					{student.studentName}
				</Title>
				<Text type="secondary">{displayValue(student.departmentName)}</Text>
			</div>

			{studentDetailSections.map((section) => (
				<section key={section.title} className="flex flex-col gap-3">
					<Title heading={6} className="m-0">
						{section.title}
					</Title>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{section.fields.map((fieldKey) => (
							<div key={fieldKey} className="min-w-0 rounded-md border border-(--semi-color-border) bg-(--semi-color-bg-0) p-3">
								<Text type="tertiary" className="block text-xs">
									{studentFieldByKey[fieldKey].label}
								</Text>
								<Text className="block wrap-break-word">{displayValue(student[fieldKey])}</Text>
							</div>
						))}
					</div>
				</section>
			))}
		</div>
	);
}

function StatusTag({ value }: { value: string | null }) {
	const text = displayValue(value);

	return (
		<Tag color={getStatusColor(text)} shape="circle">
			{text}
		</Tag>
	);
}

function renderStudentCell(value: string | null, field: StudentFieldDefinition) {
	if (field.statusTag) {
		return <StatusTag value={value} />;
	}

	return (
		<Text strong={field.strong} className="block truncate">
			{displayValue(value)}
		</Text>
	);
}

function getStatusColor(value: string) {
	if (value.includes("已") || value.includes("通过")) {
		return "green";
	}

	if (value.includes("未") || value.includes("否")) {
		return "grey";
	}

	if (value.includes("待") || value.includes("预")) {
		return "amber";
	}

	return "blue";
}

function getSortOrder(query: StudentListQuery, field: StudentSortBy) {
	return query.sortBy === field ? query.sortOrder : false;
}

function toOptionList(options: string[]) {
	return options.map((option) => ({
		label: option,
		value: option,
	}));
}

function toSelectString(value: unknown) {
	return typeof value === "string" ? value : "";
}

function buildSearchParams(query: StudentListQuery) {
	const params = new URLSearchParams();
	params.set("page", String(query.currentPage));
	params.set("pageSize", String(query.pageSize));
	params.set("sortBy", query.sortBy);
	params.set("sortOrder", query.sortOrder);

	for (const key of filterKeys) {
		const value = query[key];

		if (value.trim()) {
			params.set(key, value.trim());
		}
	}

	return params.toString();
}

function countActiveFilters(filters: StudentFilters) {
	return filterKeys.filter((key) => filters[key].trim().length > 0).length;
}

function displayValue(value: string | number | null | undefined) {
	if (typeof value === "number") {
		return formatNumber(value);
	}

	if (!value?.trim()) {
		return "未填写";
	}

	return value;
}

function formatNumber(value: number) {
	return numberFormatter.format(value);
}
