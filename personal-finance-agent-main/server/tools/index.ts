import { tool } from 'ai';
import { z } from 'zod';
import { Expense } from '../agent/types';
import { filterExpenses, summarizeExpenses, summarizeByCategory } from './expenseQueries';

const filterSchema = {
  category: z.string().optional().describe('Expense category, e.g. "groceries", "dining", "utilities" (case-insensitive exact match)'),
  vendor: z.string().optional().describe('Vendor name substring, case-insensitive'),
  startDate: z.string().optional().describe('Inclusive start date in YYYY-MM-DD format'),
  endDate: z.string().optional().describe('Inclusive end date in YYYY-MM-DD format'),
  minAmount: z.number().optional().describe('Only include expenses with amount greater than this value'),
  maxAmount: z.number().optional().describe('Only include expenses with amount less than this value'),
  excludeOutliers: z.boolean().optional().describe('Exclude statistical outliers (unusually large one-time purchases) from the results before aggregating'),
};

const LIST_EXPENSES_LIMIT = 20;

export const createExpenseTools = (expenses: Expense[]) => ({
  get_expense_summary: tool({
    description: 'Get aggregate stats (count, total, average, median, min, max) for expenses matching the given filters. Use this for questions about totals, averages, medians, or comparisons between periods/categories.',
    inputSchema: z.object(filterSchema),
    execute: async (filters) => summarizeExpenses(filterExpenses(expenses, filters)),
  }),

  get_spending_by_category: tool({
    description: 'Get a breakdown of aggregate stats (count, total, average, median, min, max) grouped by category, for expenses matching the given filters (category filter is ignored here since we group by it). Use this for "spending by category" or "top categories" questions.',
    inputSchema: z.object(filterSchema).omit({ category: true }),
    execute: async (filters) => summarizeByCategory(filterExpenses(expenses, filters)),
  }),

  list_expenses: tool({
    description: `List individual matching expenses (date, amount, vendor) for questions that ask to "show" or "list" specific expenses rather than just totals. Capped at ${LIST_EXPENSES_LIMIT} results, ordered by date descending.`,
    inputSchema: z.object(filterSchema),
    execute: async (filters) => {
      const matches = filterExpenses(expenses, filters)
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date));
      const truncated = matches.length > LIST_EXPENSES_LIMIT;
      return {
        totalMatches: matches.length,
        truncated,
        expenses: matches.slice(0, LIST_EXPENSES_LIMIT).map(({ date, amount, vendor, category }) => ({ date, amount, vendor, category })),
      };
    },
  }),
});
