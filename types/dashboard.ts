export type DashboardData = {
	summary: {
		total: number;
		registered: number;
		checkedIn: number;
		preRegistered: number;
		infoCompleted: number;
		pendingRegister: number;
		pendingCheckin: number;
		registerRate: number;
		checkinRate: number;
		preRegisterRate: number;
		infoCompletionRate: number;
	};
	distributions: {
		departments: DashboardDistribution[];
		campuses: DashboardDistribution[];
		registerStatus: DashboardDistribution[];
		checkinStatus: DashboardDistribution[];
	};
	recentCheckins: DashboardRecentCheckin[];
	updatedAt: string;
};

export type DashboardDistribution = {
	label: string | null;
	total: number;
	percentage: number;
};

export type DashboardRecentCheckin = {
	id: string;
	studentName: string;
	departmentName: string | null;
	majorName: string | null;
	campusName: string | null;
	checkinDate: string | null;
};
