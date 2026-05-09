// Domain Model Types

export type Account = {
  id: string;
  inviteToken: string;
  inviteTokenExpiresAt: Date;
  createdAt: Date;
};

export type User = {
  id: string;
  accountId: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
};

export type FamilyMember = {
  id: string;
  accountId: string;
  name: string;
  birthDate: Date;
  relation: string; // 'husband' | 'wife' | 'child' etc.
  createdAt: Date;
};

export type LifePlan = {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LifeEventType = 'birth' | 'home_purchase' | 'education' | 'retirement';

export type LifeEvent = {
  id: string;
  lifePlanId: string;
  eventType: LifeEventType;
  eventYear: number;
  createdAt: Date;
  updatedAt: Date;
  // Birth Event
  familyMemberId?: string;
  // Home Purchase Event
  homePrice?: number;
  downPayment?: number;
  loanTermYears?: number;
  loanInterestRate?: number;
  // Education Event
  schoolType?: string;
  startYear?: number;
  endYear?: number;
  monthlyTuition?: number;
  annualEntranceFee?: number;
  extraActivitiesMonthly?: number;
  // Retirement Event
  retirementYear?: number;
};

export type Income = {
  id: string;
  lifePlanId: string;
  familyMemberId: string;
  monthlySalary: number;
  bonusAmount: number;
  expectedRaiseRate: number;
  validFromYear: number;
  untilYear?: number;
  createdAt: Date;
};

export type Investment = {
  id: string;
  lifePlanId: string;
  investmentType: 'nisa' | 'ideco' | 'stock';
  annualContribution: number;
  annualReturnRate: number;
  startYear: number;
  endYear?: number;
  createdAt: Date;
};

export type BudgetCategory = {
  id: string;
  accountId: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
};

export type Budget = {
  id: string;
  lifePlanId: string;
  budgetCategoryId: string;
  amount: number;
  validFrom: string; // 'YYYY-MM'
  createdAt: Date;
};

export type Expense = {
  id: string;
  accountId: string;
  budgetCategoryId: string;
  amount: number;
  spentOn: Date;
  note?: string;
  createdAt: Date;
};

// Projection Results
export type YearlyProjection = {
  year: number;
  age: { [familyMemberId: string]: number };
  income: number;
  expense: number;
  investmentGain: number;
  asset: number;
  lifeEvents: LifeEvent[];
};

export type MortgagePayment = {
  month: number;
  principal: number;
  interest: number;
  balance: number;
};

// API Response Type
export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
