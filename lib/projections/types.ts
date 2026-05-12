export interface BudgetBreakdownItem {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number; // 年額
}

export interface ProjectionYear {
  year: number;
  members: MemberProjection[];
  totalIncome: number;
  totalExpense: number;
  totalAssets: number;
  budgetBreakdown: BudgetBreakdownItem[];
}

export interface MemberProjection {
  familyMemberId: string;
  name: string;
  age: number;
  income: number;
  expense: number;
}

export interface IncomeData {
  familyMemberId: string;
  recordId: string;
  recordName: string | null;
  terms: {
    startYear: number;
    endYear: number | null;
    monthlySalary: number;
    bonusMonths: number;
    expectedRaiseRate: number;
  }[];
}

export interface HobbyActivityExpense {
  familyMemberId: string;
  activityName: string;
  terms: {
    startYear: number;
    endYear: number | null;
    monthlyFee: number;
  }[];
}

export interface AnnualCostData {
  familyMemberId: string;
  activityName: string;
  costs: {
    startYear: number;
    endYear: number | null;
    amount: number;
    timesPerYear: number;
  }[];
}

export interface LifeEventData {
  familyMemberId: string;
  eventYear: number;
  eventType: string;
  cost: number;
}

export interface BudgetData {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  monthlyAmounts?: Record<string, number>; // 月別金額: { "1": 30000, "2": 32000, ... }
}

export interface FamilyMemberBase {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
}

export interface ProjectionInput {
  baseYear: number;
  targetAge: number;
  familyMembers: FamilyMemberBase[];
  incomeData: IncomeData[];
  hobbyExpenses: HobbyActivityExpense[];
  annualCosts: AnnualCostData[];
  lifeEvents: LifeEventData[];
  budgetData: BudgetData[];
  initialAssets: number;
}
