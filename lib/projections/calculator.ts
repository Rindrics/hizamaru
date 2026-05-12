import {
  ProjectionYear,
  MemberProjection,
  ProjectionInput,
  IncomeData,
  HobbyActivityExpense,
  AnnualCostData,
  LifeEventData,
  BudgetData,
} from './types';

function calculateAge(birthDate: string, year: number): number {
  const birthYear = parseInt(birthDate.substring(0, 4));
  const birthMonth = parseInt(birthDate.substring(5, 7));
  const currentMonth = 1; // 1月時点での年齢

  let age = year - birthYear;
  if (currentMonth < birthMonth) {
    age--;
  }
  return age;
}

function getIncomeForYear(
  incomeData: IncomeData[],
  familyMemberId: string,
  year: number
): number {
  const memberIncomes = incomeData.filter(
    (i) => i.familyMemberId === familyMemberId
  );

  let totalIncome = 0;

  for (const income of memberIncomes) {
    for (const term of income.terms) {
      if (year < term.startYear) continue;
      if (term.endYear && year > term.endYear) continue;

      const yearsElapsed = year - term.startYear;
      const raiseMultiplier = Math.pow(
        1 + term.expectedRaiseRate,
        yearsElapsed
      );
      const monthlySalary = term.monthlySalary * raiseMultiplier;
      const baseSalary = monthlySalary * 12;
      const bonus = monthlySalary * term.bonusMonths;

      totalIncome += baseSalary + bonus;
    }
  }

  return Math.round(totalIncome);
}

function getHobbyExpenseForYear(
  hobbyExpenses: HobbyActivityExpense[],
  familyMemberId: string,
  year: number
): number {
  const memberExpenses = hobbyExpenses.filter(
    (h) => h.familyMemberId === familyMemberId
  );

  let totalExpense = 0;

  for (const hobby of memberExpenses) {
    for (const term of hobby.terms) {
      if (year < term.startYear) continue;
      if (term.endYear && year > term.endYear) continue;

      totalExpense += term.monthlyFee * 12;
    }
  }

  return totalExpense;
}

function getAnnualCostsForYear(
  annualCosts: AnnualCostData[],
  familyMemberId: string,
  year: number
): number {
  const memberCosts = annualCosts.filter(
    (c) => c.familyMemberId === familyMemberId
  );

  let totalCost = 0;

  for (const cost of memberCosts) {
    for (const item of cost.costs) {
      if (year < item.startYear) continue;
      if (item.endYear && year > item.endYear) continue;

      totalCost += item.amount * item.timesPerYear;
    }
  }

  return totalCost;
}

function getLifeEventCostForYear(
  lifeEvents: LifeEventData[],
  familyMemberId: string,
  year: number
): number {
  return lifeEvents
    .filter((e) => e.familyMemberId === familyMemberId && e.eventYear === year)
    .reduce((sum, e) => sum + e.cost, 0);
}

function getBudgetExpenseForYear(budgetData: BudgetData[]): number {
  return budgetData.reduce((sum, b) => {
    if (b.monthlyAmounts && Object.keys(b.monthlyAmounts).length > 0) {
      // 月別金額がある場合は、全月の合計を使用
      return (
        sum +
        Object.values(b.monthlyAmounts).reduce(
          (total, amount) => total + amount,
          0
        )
      );
    }
    // 月別金額がない場合は、単一金額を12倍（月額 × 12）
    return sum + b.amount * 12;
  }, 0);
}

function calculateMemberProjection(
  familyMemberId: string,
  name: string,
  birthDate: string,
  year: number,
  input: ProjectionInput
): MemberProjection {
  const age = calculateAge(birthDate, year);
  const income = getIncomeForYear(input.incomeData, familyMemberId, year);
  const hobbyExpense = getHobbyExpenseForYear(
    input.hobbyExpenses,
    familyMemberId,
    year
  );
  const annualCosts = getAnnualCostsForYear(
    input.annualCosts,
    familyMemberId,
    year
  );
  const lifeEventCost = getLifeEventCostForYear(
    input.lifeEvents,
    familyMemberId,
    year
  );
  const budgetExpense = getBudgetExpenseForYear(input.budgetData);

  return {
    familyMemberId,
    name,
    age,
    income,
    expense: hobbyExpense + annualCosts + lifeEventCost + budgetExpense,
  };
}

export function calculateYearlyProjections(
  input: ProjectionInput
): ProjectionYear[] {
  const projections: ProjectionYear[] = [];
  let cumulativeAssets = input.initialAssets;

  const endYear = input.baseYear + input.targetAge;

  for (let year = input.baseYear; year <= endYear; year++) {
    const members: MemberProjection[] = input.familyMembers.map((member) =>
      calculateMemberProjection(
        member.id,
        member.name,
        member.birthDate,
        year,
        input
      )
    );

    const totalIncome = members.reduce((sum, m) => sum + m.income, 0);
    const totalExpense = members.reduce((sum, m) => sum + m.expense, 0);
    const yearBalance = totalIncome - totalExpense;

    cumulativeAssets += yearBalance;

    projections.push({
      year,
      members,
      totalIncome,
      totalExpense,
      totalAssets: Math.round(cumulativeAssets),
    });
  }

  return projections;
}
