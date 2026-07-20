import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
const server = new Server({
    name: "my-first-server",
    version: "1.0.0",
}, {
    capabilities: { tools: {} },
});
// הגדרת הכלים שהשרת מציע
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [{
            name: "get_time",
            description: "Get the current system time",
            inputSchema: { type: "object", properties: {} },
        }],
}));
// ביצוע הפעולה כשהמודל קורא לכלי
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_time") {
        return {
            content: [{ type: "text", text: `The current time is ${new Date().toISOString()}` }],
        };
    }
    throw new Error("Tool not found");
});
// הרצה מול ה-Standard Input/Output
const transport = new StdioServerTransport();
await server.connect(transport);
//# sourceMappingURL=index.js.map