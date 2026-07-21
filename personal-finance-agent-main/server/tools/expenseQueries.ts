import { Expense } from '../agent/types';
import { isBetween } from '../utils/date-helpers';
import { detectAnomalies } from '../utils/anomaly-helper';
import { sum, mean, median, min, max } from '../utils/math-helpers';
import { groupBy } from '../utils/array-helpers';

export interface ExpenseFilters {
  category?: string;
  vendor?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  excludeOutliers?: boolean;
  outlierThreshold?: number;
}

export interface ExpenseSummary {
  count: number;
  total: number;
  average: number;
  median: number;
  min: number;
  max: number;
}

export const filterExpenses = (expenses: Expense[], filters: ExpenseFilters): Expense[] => {
  let result = expenses.filter((exp) => {
    if (filters.category && exp.category?.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
    if (filters.vendor && !exp.vendor.toLowerCase().includes(filters.vendor.toLowerCase())) {
      return false;
    }
    if (!isBetween(exp.date, filters.startDate, filters.endDate)) {
      return false;
    }
    if (filters.minAmount !== undefined && exp.amount < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount !== undefined && exp.amount > filters.maxAmount) {
      return false;
    }
    return true;
  });

  if (filters.excludeOutliers) {
    const anomalies = detectAnomalies(result, filters.outlierThreshold ?? 2);
    const anomalySet = new Set(anomalies);
    result = result.filter((exp) => !anomalySet.has(exp));
  }

  return result;
};

export const summarizeExpenses = (expenses: Expense[]): ExpenseSummary => {
  const amounts = expenses.map((exp) => exp.amount);
  return {
    count: expenses.length,
    total: sum(amounts),
    average: mean(amounts),
    median: median(amounts),
    min: amounts.length ? min(amounts) : 0,
    max: amounts.length ? max(amounts) : 0,
  };
};

export const summarizeByCategory = (expenses: Expense[]): Record<string, ExpenseSummary> => {
  const groups = groupBy(expenses, (exp) => exp.category ?? 'uncategorized');
  const result: Record<string, ExpenseSummary> = {};
  for (const [category, groupExpenses] of Object.entries(groups)) {
    result[category] = summarizeExpenses(groupExpenses);
  }
  return result;
};
