import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ask } from '../../services/ragService';

export const registerRagSearchTool = (server: McpServer): void => {
  server.registerTool(
    'rag_search',
    {
      title: 'RAG Search',
      description:
        'Ask a question about Lev-Boots (levitation boot technology) and get an answer grounded in the project knowledge base (PDFs, articles, and Slack history).',
      inputSchema: {
        question: z.string().describe('The question to ask about Lev-Boots'),
      },
    },
    async ({ question }) => {
      const answer = await ask(question);

      return {
        content: [{ type: 'text', text: answer }],
      };
    }
  );
};
