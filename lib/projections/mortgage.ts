import type { MortgagePayment } from '@/types';

interface MortgageInput {
  loanAmount: number;
  annualInterestRate: number;
  loanTermYears: number;
}

export function calculateMortgageSchedule(input: MortgageInput): MortgagePayment[] {
  const { loanAmount, annualInterestRate, loanTermYears } = input;
  const monthlyRate = annualInterestRate / 12;
  const totalMonths = loanTermYears * 12;
  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const schedule: MortgagePayment[] = [];
  let balance = loanAmount;

  for (let month = 1; month <= totalMonths; month++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance -= principal;

    schedule.push({
      month,
      principal,
      interest,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
}
