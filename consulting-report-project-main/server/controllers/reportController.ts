import { Request, Response } from 'express';
import { generateReportMarkdown } from '../services/reportService';

export const generateReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { companyName, companyId, reportType } = req.body || {};
    if (!companyName || !companyId || !reportType) {
      res.status(400).json({
        reportMarkdown: '',
        error: 'You must provide the company name, ID, and report type',
      });
      return;
    }

    const reportMarkdown = await generateReportMarkdown(
      companyName,
      companyId,
      reportType
    );
    res.status(200).json({ reportMarkdown });
  } catch (error) {
    res.status(500).json({
      reportMarkdown: '',
      error: 'Failed to generate report',
    });
  }
};
