import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PDF_FILES, ARTICLE_IDS } from '../../config/constants';

export const registerListKnowledgeSourcesTool = (server: McpServer): void => {
  server.registerTool(
    'list_knowledge_sources',
    {
      title: 'List Knowledge Sources',
      description: 'Lists all available PDFs and articles in the knowledge base.',
      inputSchema: {},
    },
    async () => {
      const result = {
        pdfs: PDF_FILES.map((name) => ({
          type: 'pdf' as const,
          name: name.replace(/\.pdf$/i, ''),
        })),
        articles: ARTICLE_IDS.map((id) => ({ type: 'article' as const, id })),
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );
};
