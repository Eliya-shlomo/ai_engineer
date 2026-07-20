import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerRagSearchTool } from './tools/ragSearch';
import { registerListKnowledgeSourcesTool } from './tools/listKnowledgeSources';
import { registerReadSourceTool } from './tools/readSource';

const server = new McpServer({
  name: 'lev-boots-mcp',
  version: '1.0.0',
});

registerRagSearchTool(server);
registerListKnowledgeSourcesTool(server);
registerReadSourceTool(server);

const transport = new StdioServerTransport();
await server.connect(transport);
