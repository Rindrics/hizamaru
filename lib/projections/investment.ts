interface CompoundInterestInput {
  principal: number;
  annualRate: number;
  years: number;
  compoundingPeriodsPerYear?: number;
}

export function calculateCompoundInterest(
  input: CompoundInterestInput
): number {
  const { principal, annualRate, years, compoundingPeriodsPerYear = 1 } = input;
  const rate = annualRate / 100;

  return (
    principal *
    Math.pow(
      1 + rate / compoundingPeriodsPerYear,
      compoundingPeriodsPerYear * years
    )
  );
}

interface InvestmentProjectionInput {
  initialAmount: number;
  annualContribution: number;
  annualReturnRate: number;
  years: number;
}

export function calculateInvestmentProjection(
  input: InvestmentProjectionInput
): number {
  const { initialAmount, annualContribution, annualReturnRate, years } = input;
  const rate = annualReturnRate / 100;

  let balance = initialAmount;

  for (let year = 0; year < years; year++) {
    balance = balance * (1 + rate) + annualContribution;
  }

  return balance;
}
