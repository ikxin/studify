export type StudentRecord = {
	id: string;
	studentNumber: string | null;
	candidateNumber: string;
	studentName: string;
	idCardNumber: string;
	gender: string | null;
	campusName: string | null;
	departmentCode: string | null;
	departmentName: string | null;
	majorCode: string | null;
	majorName: string | null;
	gradeYear: string | null;
	className: string | null;
	sourcePlace: string | null;
	studyYears: string | null;
	studyStatus: string | null;
	birthDate: string | null;
	politicalStatus: string | null;
	ethnicGroup: string | null;
	candidateType: string | null;
	freshmanInfoStatus: string | null;
	hasAllergen: string | null;
	clothingSize: string | null;
	shoeSize: string | null;
	registerTerm: string | null;
	registerStatus: string | null;
	checkinStatus: string | null;
	checkinDate: string | null;
	fromPoorCounty: string | null;
	subjectType: string | null;
	subjectCode: string | null;
	subjectName: string | null;
	middleSchoolCode: string | null;
	middleSchoolName: string | null;
	outsideProvinceSchool: string | null;
	landlinePhone: string | null;
	mobilePhone: string | null;
	phoneContact: string | null;
	postalCode: string | null;
	mailRecipient: string | null;
	mailAddress: string | null;
	candidateCategory: string | null;
	graduationCategory: string | null;
	admissionMajor: string | null;
	admissionProvince: string | null;
	familyPhone: string | null;
	contactPhone: string | null;
	singleParentFamily: string | null;
	orphanStatus: string | null;
	familyAnnualIncome: string | null;
	familyPopulation: string | null;
	martyrChild: string | null;
	westAidStudent: string | null;
	preRegisterStatus: string | null;
	checkinPlan: string | null;
	lateReason: string | null;
	cadreApplyStatus: string | null;
	dormApplyStatus: string | null;
	hardshipApplyStatus: string | null;
};

export type StudentFieldKey = Exclude<keyof StudentRecord, "id">;

export type StudentFilterOptions = {
	campuses: string[];
	departments: string[];
	majors: string[];
	gradeYears: string[];
	registerStatuses: string[];
	checkinStatuses: string[];
	preRegisterStatuses: string[];
};

export type StudentListData = {
	rows: StudentRecord[];
	pagination: {
		currentPage: number;
		pageSize: number;
		total: number;
	};
	filterOptions: StudentFilterOptions;
	updatedAt: string;
};

export type StudentSortBy = StudentFieldKey;

export type StudentSortOrder = "ascend" | "descend";

export type StudentFilters = {
	keyword: string;
	campusName: string;
	departmentName: string;
	majorName: string;
	gradeYear: string;
	registerStatus: string;
	checkinStatus: string;
	preRegisterStatus: string;
};

export type StudentListQuery = StudentFilters & {
	currentPage: number;
	pageSize: number;
	sortBy: StudentSortBy;
	sortOrder: StudentSortOrder;
};
