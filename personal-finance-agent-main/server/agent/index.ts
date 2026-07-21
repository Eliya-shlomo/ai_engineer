import { generateText, stepCountIs, ModelMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { Expense } from './types';
import { createExpenseTools } from '../tools';

const openai = createOpenAI({ apiKey: process.env.OPEN_AI_KEY });

// The sample dataset ends on 2025-12-30, so "today" defaults there -
// otherwise relative dates like "last month" would resolve into 2026, where there's no data.
const DEFAULT_REFERENCE_DATE = '2025-12-30';

const buildSystemPrompt = (expenses: Expense[], referenceDate: string): string => {
  const categories = [...new Set(expenses.map((exp) => exp.category).filter(Boolean))];

  return `You are a personal finance assistant. Answer questions about the user's expenses using the available tools - never guess or calculate numbers yourself from memory.

Today's date is ${referenceDate}. Resolve relative date references ("last month", "this month", "last year", month names without a year, etc.) into explicit YYYY-MM-DD startDate/endDate values relative to today before calling a tool.

Known expense categories: ${categories.join(', ')}.

When a question implies excluding unusual one-time purchases ("excluding outliers", "excluding weird purchases", etc.), set excludeOutliers: true on the tool call.

Format answers concisely in markdown. Show dollar amounts rounded to 2 decimal places with a $ prefix. When comparing two periods or categories, state both values and the difference.`;
};

export class FinanceAgent {
  private tools: ReturnType<typeof createExpenseTools>;
  private messages: ModelMessage[];

  constructor(expenses: Expense[], referenceDate: string = DEFAULT_REFERENCE_DATE) {
    this.tools = createExpenseTools(expenses);
    this.messages = [{ role: 'system', content: buildSystemPrompt(expenses, referenceDate) }];
  }

  async run(query: string): Promise<string> {
    this.messages.push({ role: 'user', content: query });

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages: this.messages,
      tools: this.tools,
      stopWhen: stepCountIs(5),
    });

    this.messages.push(...result.response.messages);

    return result.text;
  }
}
