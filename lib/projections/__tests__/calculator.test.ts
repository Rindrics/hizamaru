import { describe, it, expect } from 'vitest';
import { calculateYearlyProjections } from '../calculator';
import { ProjectionInput } from '../types';

describe('calculateYearlyProjections', () => {
  it('calculates basic income and assets correctly', () => {
    const input: ProjectionInput = {
      baseYear: 2024,
      targetAge: 90,
      familyMembers: [
        {
          id: 'member-1',
          name: '夫',
          birthDate: '1980-01-01',
        },
      ],
      incomeData: [
        {
          familyMemberId: 'member-1',
          recordId: 'income-1',
          recordName: '本業',
          terms: [
            {
              startYear: 2024,
              endYear: null,
              monthlySalary: 500000,
              bonusMonths: 2,
              expectedRaiseRate: 0,
            },
          ],
        },
      ],
      hobbyExpenses: [],
      annualCosts: [],
      lifeEvents: [],
      budgetData: [],
      initialAssets: 1000000,
    };

    const result = calculateYearlyProjections(input);

    // First year (2024): income should be 500000 * 12 + 500000 * 2 = 7,000,000
    expect(result[0].year).toBe(2024);
    expect(result[0].totalIncome).toBe(7000000);
    expect(result[0].totalExpense).toBe(0);
    expect(result[0].totalAssets).toBe(1000000 + 7000000);
  });

  it('applies salary raise rate correctly', () => {
    const input: ProjectionInput = {
      baseYear: 2024,
      targetAge: 90,
      familyMembers: [
        {
          id: 'member-1',
          name: '夫',
          birthDate: '1980-01-01',
        },
      ],
      incomeData: [
        {
          familyMemberId: 'member-1',
          recordId: 'income-1',
          recordName: '本業',
          terms: [
            {
              startYear: 2024,
              endYear: null,
              monthlySalary: 500000,
              bonusMonths: 0,
              expectedRaiseRate: 0.02, // 2% annual raise
            },
          ],
        },
      ],
      hobbyExpenses: [],
      annualCosts: [],
      lifeEvents: [],
      budgetData: [],
      initialAssets: 0,
    };

    const result = calculateYearlyProjections(input);

    // 2024: 500,000 * 12 = 6,000,000
    expect(result[0].totalIncome).toBe(6000000);

    // 2025: 500,000 * 1.02 * 12 = 6,120,000
    expect(result[1].totalIncome).toBe(6120000);

    // 2026: 500,000 * (1.02^2) * 12 ≈ 6,242,400
    expect(Math.round(result[2].totalIncome / 100) * 100).toBe(6242400);
  });

  it('handles multiple income records per member', () => {
    const input: ProjectionInput = {
      baseYear: 2024,
      targetAge: 90,
      familyMembers: [
        {
          id: 'member-1',
          name: '夫',
          birthDate: '1980-01-01',
        },
      ],
      incomeData: [
        {
          familyMemberId: 'member-1',
          recordId: 'income-1',
          recordName: '本業',
          terms: [
            {
              startYear: 2024,
              endYear: null,
              monthlySalary: 500000,
              bonusMonths: 2,
              expectedRaiseRate: 0,
            },
          ],
        },
        {
          familyMemberId: 'member-1',
          recordId: 'income-2',
          recordName: '副業',
          terms: [
            {
              startYear: 2024,
              endYear: null,
              monthlySalary: 100000,
              bonusMonths: 0,
              expectedRaiseRate: 0,
            },
          ],
        },
      ],
      hobbyExpenses: [],
      annualCosts: [],
      lifeEvents: [],
      budgetData: [],
      initialAssets: 0,
    };

    const result = calculateYearlyProjections(input);

    // 2024: (500000 * 12 + 500000 * 2) + (100000 * 12) = 7,000,000 + 1,200,000 = 8,200,000
    expect(result[0].totalIncome).toBe(8200000);
  });

  it('calculates hobby activity monthly fees correctly', () => {
    const input: ProjectionInput = {
      baseYear: 2024,
      targetAge: 90,
      familyMembers: [
        {
          id: 'member-1',
          name: '娘',
          birthDate: '2015-01-01',
        },
      ],
      incomeData: [],
      hobbyExpenses: [
        {
          familyMemberId: 'member-1',
          activityName: '水泳',
          terms: [
            {
              startYear: 2024,
              endYear: 2030,
              monthlyFee: 5000,
            },
          ],
        },
      ],
      annualCosts: [],
      lifeEvents: [],
      budgetData: [],
      initialAssets: 0,
    };

    const result = calculateYearlyProjections(input);

    // 2024-2030: 5000 * 12 = 60,000
    expect(result[0].totalExpense).toBe(60000);
    expect(result[6].totalExpense).toBe(60000);

    // 2031: no expense
    expect(result[7].totalExpense).toBe(0);
  });

  it('calculates annual costs correctly', () => {
    const input: ProjectionInput = {
      baseYear: 2024,
      targetAge: 90,
      familyMembers: [
        {
          id: 'member-1',
          name: '娘',
          birthDate: '2015-01-01',
        },
      ],
      incomeData: [],
      hobbyExpenses: [],
      annualCosts: [
        {
          familyMemberId: 'member-1',
          activityName: '水泳',
          costs: [
            {
              startYear: 2024,
              endYear: 2030,
              amount: 50000,
              timesPerYear: 2,
            },
          ],
        },
      ],
      lifeEvents: [],
      budgetData: [],
      initialAssets: 0,
    };

    const result = calculateYearlyProjections(input);

    // 2024-2030: 50000 * 2 = 100,000
    expect(result[0].totalExpense).toBe(100000);
    expect(result[6].totalExpense).toBe(100000);

    // 2031: no expense
    expect(result[7].totalExpense).toBe(0);
  });

  it('applies life events correctly', () => {
    const input: ProjectionInput = {
      baseYear: 2024,
      targetAge: 90,
      familyMembers: [
        {
          id: 'member-1',
          name: '夫',
          birthDate: '1980-01-01',
        },
      ],
      incomeData: [],
      hobbyExpenses: [],
      annualCosts: [],
      lifeEvents: [
        {
          familyMemberId: 'member-1',
          eventYear: 2026,
          eventType: '住宅購入',
          cost: 5000000,
        },
      ],
      budgetData: [],
      initialAssets: 0,
    };

    const result = calculateYearlyProjections(input);

    // 2024-2025: no event
    expect(result[0].totalExpense).toBe(0);
    expect(result[1].totalExpense).toBe(0);

    // 2026: event cost
    expect(result[2].totalExpense).toBe(5000000);

    // 2027: no event
    expect(result[3].totalExpense).toBe(0);
  });

  it('calculates cumulative assets correctly', () => {
    const input: ProjectionInput = {
      baseYear: 2024,
      targetAge: 90,
      familyMembers: [
        {
          id: 'member-1',
          name: '夫',
          birthDate: '1980-01-01',
        },
      ],
      incomeData: [
        {
          familyMemberId: 'member-1',
          recordId: 'income-1',
          recordName: '本業',
          terms: [
            {
              startYear: 2024,
              endYear: null,
              monthlySalary: 500000,
              bonusMonths: 0,
              expectedRaiseRate: 0,
            },
          ],
        },
      ],
      hobbyExpenses: [],
      annualCosts: [],
      lifeEvents: [],
      budgetData: [],
      initialAssets: 1000000,
    };

    const result = calculateYearlyProjections(input);

    // 2024: 1,000,000 + 6,000,000 = 7,000,000
    expect(result[0].totalAssets).toBe(7000000);

    // 2025: 7,000,000 + 6,000,000 = 13,000,000
    expect(result[1].totalAssets).toBe(13000000);
  });

  it('handles multiple family members correctly', () => {
    const input: ProjectionInput = {
      baseYear: 2024,
      targetAge: 90,
      familyMembers: [
        {
          id: 'member-1',
          name: '夫',
          birthDate: '1980-01-01',
        },
        {
          id: 'member-2',
          name: '妻',
          birthDate: '1985-06-15',
        },
      ],
      incomeData: [
        {
          familyMemberId: 'member-1',
          recordId: 'income-1',
          recordName: '本業',
          terms: [
            {
              startYear: 2024,
              endYear: null,
              monthlySalary: 500000,
              bonusMonths: 0,
              expectedRaiseRate: 0,
            },
          ],
        },
        {
          familyMemberId: 'member-2',
          recordId: 'income-2',
          recordName: '本業',
          terms: [
            {
              startYear: 2024,
              endYear: null,
              monthlySalary: 400000,
              bonusMonths: 0,
              expectedRaiseRate: 0,
            },
          ],
        },
      ],
      hobbyExpenses: [],
      annualCosts: [],
      lifeEvents: [],
      budgetData: [],
      initialAssets: 0,
    };

    const result = calculateYearlyProjections(input);

    // 2024: 500000 * 12 + 400000 * 12 = 10,800,000
    expect(result[0].totalIncome).toBe(10800000);
    expect(result[0].members).toHaveLength(2);
    expect(result[0].members[0].income).toBe(6000000);
    expect(result[0].members[1].income).toBe(4800000);
  });

  it('stops projections when oldest member reaches target age', () => {
    const input: ProjectionInput = {
      baseYear: 2024,
      targetAge: 90,
      familyMembers: [
        {
          id: 'member-1',
          name: '夫',
          birthDate: '1980-01-01',
        },
      ],
      incomeData: [],
      hobbyExpenses: [],
      annualCosts: [],
      lifeEvents: [],
      budgetData: [],
      initialAssets: 0,
    };

    const result = calculateYearlyProjections(input);

    // Member born in 1980 reaches 90 in 2070
    expect(result[result.length - 1].year).toBe(2070);
    expect(result[result.length - 1].members[0].age).toBe(90);
  });

  it('handles income term date ranges correctly', () => {
    const input: ProjectionInput = {
      baseYear: 2024,
      targetAge: 90,
      familyMembers: [
        {
          id: 'member-1',
          name: '夫',
          birthDate: '1980-01-01',
        },
      ],
      incomeData: [
        {
          familyMemberId: 'member-1',
          recordId: 'income-1',
          recordName: '本業',
          terms: [
            {
              startYear: 2024,
              endYear: 2030,
              monthlySalary: 500000,
              bonusMonths: 0,
              expectedRaiseRate: 0,
            },
            {
              startYear: 2031,
              endYear: null,
              monthlySalary: 400000,
              bonusMonths: 0,
              expectedRaiseRate: 0,
            },
          ],
        },
      ],
      hobbyExpenses: [],
      annualCosts: [],
      lifeEvents: [],
      budgetData: [],
      initialAssets: 0,
    };

    const result = calculateYearlyProjections(input);

    // 2024-2030: 500,000 * 12 = 6,000,000
    expect(result[0].totalIncome).toBe(6000000);
    expect(result[6].totalIncome).toBe(6000000);

    // 2031 onwards: 400,000 * 12 = 4,800,000
    expect(result[7].totalIncome).toBe(4800000);
  });
});
