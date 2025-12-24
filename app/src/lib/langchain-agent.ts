import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { allTools } from "./mcp-tools";
import { createTrace, flushLangfuse } from "./langfuse-client";

const SYSTEM_PROMPT = `You are a helpful customer support assistant for a computer products company that sells monitors, printers, computers, and other tech equipment.

Your capabilities:
- Verify customer identity using their email and PIN
- Help customers browse and search products
- View customer order history
- Help place new orders

Guidelines:
1. Always be friendly, professional, and helpful
2. If a customer wants to view orders or place an order, you MUST first verify their identity using verify_customer_pin
3. Once verified, remember their customer_id for subsequent requests
4. When showing products, format the information clearly
5. When helping with orders, confirm details before creating
6. If you encounter an error, explain it politely and suggest alternatives

Current customer context will be provided if they are authenticated.`;

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  customerId?: string;
  customerEmail?: string;
  isAuthenticated: boolean;
}

export async function chat(
  messages: Message[],
  context: ChatContext,
  sessionId?: string
): Promise<{ response: string; updatedContext: ChatContext }> {
  const userMessage = messages[messages.length - 1]?.content || "Unknown";
  const traceSessionId = sessionId || `fallback-${Date.now()}`;
  
  const trace = createTrace({
    name: "customer-support-chat",
    sessionId: traceSessionId,
    userId: context.customerEmail || "anonymous",
    metadata: {
      isAuthenticated: context.isAuthenticated,
      messageCount: messages.length,
      customerId: context.customerId,
    },
  });

  const generation = trace.generation({
    name: "llm-response",
    model: "gpt-5.2",
    input: userMessage,
    metadata: {
      contextAuthenticated: context.isAuthenticated,
    },
  });

  const model = new ChatOpenAI({
    model: "gpt-5.2",
    temperature: 0.7,
  }).bindTools(allTools);

  const systemContent = context.isAuthenticated
    ? `${SYSTEM_PROMPT}\n\nCurrent customer is authenticated:\n- Customer ID: ${context.customerId}\n- Email: ${context.customerEmail}`
    : SYSTEM_PROMPT;

  const langchainMessages = [
    new SystemMessage(systemContent),
    ...messages.map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
    ),
  ];

  let updatedContext = { ...context };
  let finalResponse = "";
  let iterations = 0;
  const maxIterations = 10;
  const toolsUsed: string[] = [];

  try {
    while (iterations < maxIterations) {
      iterations++;
      const response = await model.invoke(langchainMessages);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        finalResponse = response.content as string;
        break;
      }

      langchainMessages.push(response);

      for (const toolCall of response.tool_calls) {
        const tool = allTools.find((t) => t.name === toolCall.name);
        if (!tool) {
          langchainMessages.push({
            role: "tool",
            content: `Tool ${toolCall.name} not found`,
            tool_call_id: toolCall.id!,
          } as unknown as HumanMessage);
          continue;
        }

        const toolSpan = trace.span({
          name: `tool-${toolCall.name}`,
          input: toolCall.args,
        });

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (tool as any).func(toolCall.args);
          toolsUsed.push(toolCall.name);
          
          if (toolCall.name === "verify_customer_pin" && !result.includes("Error")) {
            const customerIdMatch = result.match(/ID:\s*([a-f0-9-]+)/i);
            if (customerIdMatch) {
              updatedContext = {
                isAuthenticated: true,
                customerId: customerIdMatch[1],
                customerEmail: toolCall.args.email as string,
              };
            }
          }

          toolSpan.end({ output: result });

          langchainMessages.push({
            role: "tool",
            content: result,
            tool_call_id: toolCall.id!,
          } as unknown as HumanMessage);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          toolSpan.end({ 
            output: errorMessage,
            level: "ERROR",
          });
          
          langchainMessages.push({
            role: "tool",
            content: `Error: ${errorMessage}`,
            tool_call_id: toolCall.id!,
          } as unknown as HumanMessage);
        }
      }
    }

    generation.end({
      output: finalResponse,
      metadata: {
        iterations,
        toolsUsed,
        updatedAuth: updatedContext.isAuthenticated,
      },
    });
  } catch (error) {
    generation.end({
      output: error instanceof Error ? error.message : "Unknown error",
      level: "ERROR",
    });
    throw error;
  } finally {
    await flushLangfuse();
  }

  return { response: finalResponse, updatedContext };
}
