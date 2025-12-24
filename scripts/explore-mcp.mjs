// Script to explore the MCP server capabilities
// Using the official MCP SDK with Streamable HTTP transport

const MCP_SERVER_URL = "https://vipfapwm3x.us-east-1.awsapprunner.com/mcp";

async function exploreMCPServer() {
  console.log("🔍 Exploring MCP Server at:", MCP_SERVER_URL);
  console.log("=".repeat(60));

  try {
    // Initialize MCP session using Streamable HTTP
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
            name: "mcp-explorer",
            version: "1.0.0",
          },
        },
      }),
    });

    const initResult = await response.json();
    console.log("\n📋 Server Info:");
    console.log(JSON.stringify(initResult, null, 2));

    // List available tools
    console.log("\n🔧 Fetching available tools...");
    const toolsResponse = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      }),
    });

    const toolsResult = await toolsResponse.json();
    console.log("\n🛠️  Available Tools:");
    console.log(JSON.stringify(toolsResult, null, 2));

    // List available resources
    console.log("\n📦 Fetching available resources...");
    const resourcesResponse = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "resources/list",
        params: {},
      }),
    });

    const resourcesResult = await resourcesResponse.json();
    console.log("\n📚 Available Resources:");
    console.log(JSON.stringify(resourcesResult, null, 2));

    // List available prompts
    console.log("\n💬 Fetching available prompts...");
    const promptsResponse = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 4,
        method: "prompts/list",
        params: {},
      }),
    });

    const promptsResult = await promptsResponse.json();
    console.log("\n📝 Available Prompts:");
    console.log(JSON.stringify(promptsResult, null, 2));

  } catch (error) {
    console.error("❌ Error exploring MCP server:", error.message);
  }
}

exploreMCPServer();
