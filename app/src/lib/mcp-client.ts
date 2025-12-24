const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "https://vipfapwm3x.us-east-1.awsapprunner.com/mcp";

interface MCPResponse {
  jsonrpc: string;
  id: number | string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

export async function callMCPTool(toolName: string, args: Record<string, unknown>): Promise<string> {
  const response = await fetch(MCP_SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  const data: MCPResponse = await response.json();

  if (data.error) {
    throw new Error(`MCP Error: ${data.error.message}`);
  }

  const result = data.result as { content?: Array<{ text?: string }> };
  if (result?.content?.[0]?.text) {
    return result.content[0].text;
  }

  return JSON.stringify(data.result);
}

export async function initializeMCP(): Promise<boolean> {
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: {
            name: "customer-support-chatbot",
            version: "1.0.0",
          },
        },
      }),
    });

    const data: MCPResponse = await response.json();
    return !data.error;
  } catch (error) {
    console.error("Failed to initialize MCP:", error);
    return false;
  }
}
