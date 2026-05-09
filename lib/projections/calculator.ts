import type { YearlyProjection } from '@/types';

interface CalculatorInput {
  initialAsset: number;
  monthlyIncome: number;
  investmentRate: number;
  years: number;
}

export function calculateYearlyProjections(
  input: CalculatorInput
): YearlyProjection[] {
  const { initialAsset, monthlyIncome, investmentRate, years } = input;
  const projections: YearlyProjection[] = [];

  let currentAsset = initialAsset;

  for (let year = 0; year < years; year++) {
    const yearlyIncome = monthlyIncome * 12;
    const investmentGain = currentAsset * investmentRate;
    const expense = 0; // TODO: Calculate from life events and budget

    currentAsset = currentAsset + yearlyIncome - expense + investmentGain;

    projections.push({
      year: new Date().getFullYear() + year,
      age: {}, // TODO: Calculate from family members birth dates
      income: yearlyIncome,
      expense,
      investmentGain,
      asset: currentAsset,
      lifeEvents: [],
    });
  }

  return projections;
}
