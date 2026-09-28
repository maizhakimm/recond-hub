export type LoanSettings = {
  defaultInterestRate: number;
  maxTenureYears: number;
  minDownpaymentPct: number;
  dsrEligibleMax: number;
  dsrBorderlineMax: number;
};

export type LoanInput = { price: number; downpayment: number; ratePct: number; years: number };
export type LoanResult = { loan: number; totalInterest: number; totalPayable: number; monthly: number };

/**
 * Malaysian flat-rate hire purchase:
 * loan = price − downpayment; total_interest = loan × rate/100 × years; monthly = (loan + total_interest) / (years × 12)
 */
export function calcLoan({ price, downpayment, ratePct, years }: LoanInput): LoanResult {
  const loan = Math.max(0, price - downpayment);
  const safeYears = Math.max(1, years);
  const totalInterest = loan * (ratePct / 100) * safeYears;
  const totalPayable = loan + totalInterest;
  return { loan, totalInterest, totalPayable, monthly: totalPayable / (safeYears * 12) };
}

/** The "from RM X/month" figure: minimum down payment, default rate, maximum tenure. */
export function fromMonthly(price: number, s: LoanSettings): number {
  return calcLoan({
    price,
    downpayment: price * (s.minDownpaymentPct / 100),
    ratePct: s.defaultInterestRate,
    years: s.maxTenureYears,
  }).monthly;
}

export type Eligibility = "likely" | "borderline" | "unlikely";

/** Debt service ratio (%) = all monthly commitments incl. this car ÷ gross monthly salary. */
export function calcDsr(grossSalary: number, existingCommitments: number, newMonthly: number): number {
  if (grossSalary <= 0) return Infinity;
  return ((existingCommitments + newMonthly) / grossSalary) * 100;
}

export function eligibility(dsr: number, s: Pick<LoanSettings, "dsrEligibleMax" | "dsrBorderlineMax">): Eligibility {
  if (dsr < s.dsrEligibleMax) return "likely";
  if (dsr <= s.dsrBorderlineMax) return "borderline";
  return "unlikely";
}
