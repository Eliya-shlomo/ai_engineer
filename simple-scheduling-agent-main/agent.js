import { askGeminiWithMessages } from './llmService.js';
import { getUserInput } from './cli-io.js';

const checkAvailability = (date) => {
    console.log("Checking availability for date:", date);
    return { available: true }
}

const scheduleAppointment = (date) => {
    console.log("Scheduling appointment for date:", date);
    return { success: true }
}

const deleteAppointment = (date) => {
    console.log("Deleting appointment for date:", date);
    return { success: true }
}

const tools = { checkAvailability, scheduleAppointment, deleteAppointment };

const systemPrompt = `You are a helpful scheduling assistant. Today's date is ${new Date().toDateString()}.

You have access to these tools:
- checkAvailability(date): checks if a date/time is free
- scheduleAppointment(date): books an appointment for a date/time
- deleteAppointment(date): cancels an appointment for a date/time

You will be told the result of each tool call as a system message. Chain as many tool calls as you need (e.g. delete, then check, then schedule) before giving your final answer. Only reply with an "answer" once you're completely done acting on the user's request.

Always respond with valid JSON, using ONE of these two shapes:
1. To answer the user directly: {"type": "answer", "message": "your reply here"}
2. To call a tool: {"type": "tool", "tool": "<toolName>", "date": "<ISO 8601 date-time, resolved from any relative wording>"}

Never respond with anything other than one of these two JSON shapes.`;

const messages = [
    { role: 'system', content: systemPrompt },
];

const MAX_TOOL_CALLS_PER_TURN = 10;

async function main() {
    while (true) {
        const userInput = await getUserInput('You: ');

        if (['exit', 'quit'].includes(userInput.trim().toLowerCase())) {
            console.log('Goodbye!');
            process.exit(0);
        }

        messages.push({ role: 'user', content: userInput });

        for (let i = 0; i < MAX_TOOL_CALLS_PER_TURN; i++) {
            const response = await askGeminiWithMessages(messages);
            messages.push({ role: 'assistant', content: JSON.stringify(response) });

            if (response.type === 'tool') {
                const tool = tools[response.tool];
                const result = tool(response.date);
                messages.push({ role: 'system', content: `Result of ${response.tool}: ${JSON.stringify(result)}` });
                continue;
            }

            console.log('Gemini:', response.message ?? '');
            break;
        }
    }
}

main();
