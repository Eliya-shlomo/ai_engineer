import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PDF_FILES, ARTICLE_IDS } from '../../config/constants';
import { fetchPdfText, fetchArticleText } from '../../services/dataLoader';

type SourceType = 'pdf' | 'article';

const resolvePdfFileName = (sourceName: string): string | undefined =>
  PDF_FILES.find(
    (fileName) =>
      fileName === sourceName || fileName.replace(/\.pdf$/i, '') === sourceName
  );

const detectSourceType = (sourceName: string): SourceType => {
  if (resolvePdfFileName(sourceName)) return 'pdf';
  if (ARTICLE_IDS.includes(sourceName)) return 'article';

  throw new Error(
    `Could not find a PDF or article matching "${sourceName}". Use list_knowledge_sources to see available sources.`
  );
};

export const registerReadSourceTool = (server: McpServer): void => {
  server.registerTool(
    'read_source',
    {
      title: 'Read Source',
      description: 'Reads the full raw text content of a PDF or article from the knowledge base.',
      inputSchema: {
        sourceName: z.string().describe('The PDF filename or article ID'),
        sourceType: z
          .enum(['pdf', 'article'])
          .optional()
          .describe("Optional: 'pdf' or 'article'. If omitted, auto-detected from sourceName."),
      },
    },
    async ({ sourceName, sourceType }) => {
      const type = sourceType ?? detectSourceType(sourceName);

      const text =
        type === 'pdf'
          ? await fetchPdfText(resolvePdfFileName(sourceName) ?? sourceName)
          : await fetchArticleText(sourceName);

      return {
        content: [{ type: 'text', text }],
      };
    }
  );
};
