// Make sure you've reviewd the README.md file to understand the task and how to access the relevant resources

import { GoogleGenAI } from '@google/genai';
import { fetchCompanyData } from './dataService';
import { buildReportPrompt, ReportPromptType, SYSTEM_INSTRUCTION } from './llmService';
import { buildReportCacheKey, getCachedReport, setCachedReport } from './cacheService';

const GEMINI_MODEL = 'gemini-2.5-flash';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

const isReportPromptType = (value: string): value is ReportPromptType =>
  value === 'high-level' || value === 'detailed';

export const generateReportMarkdown = async (
  companyName: string,
  companyId: string,
  reportType: string
): Promise<string> => {
  if (!isReportPromptType(reportType)) {
    throw new Error(`Invalid report type: ${reportType}`);
  }

  const companyData = await fetchCompanyData(companyId, companyName);

  const cacheKey = buildReportCacheKey(
    companyId,
    reportType,
    companyData.news?.heading ?? null
  );

  const cachedReport = getCachedReport(cacheKey);
  if (cachedReport) {
    return cachedReport;
  }

  const prompt = buildReportPrompt(companyData, reportType);

  let response;
  try {
    response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
  } catch (error) {
    console.error(`Gemini request failed for company ${companyId}:`, error);
    throw new Error(
      `Failed to generate report from LLM: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const markdown = response.text?.trim();

  if (!markdown) {
    const blockReason = response.promptFeedback?.blockReason;
    const finishReason = response.candidates?.[0]?.finishReason;
    console.error(
      `Gemini returned no usable text for company ${companyId}. blockReason=${blockReason} finishReason=${finishReason}`
    );
    throw new Error(
      `Received an empty response from the LLM${blockReason ? ` (blocked: ${blockReason})` : ''}`
    );
  }

  setCachedReport(cacheKey, markdown);

  return markdown;
};
