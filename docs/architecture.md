# Customer Support Chatbot - Architecture Document

## Overview

A customer support chatbot for a computer products company (monitors, printers, etc.) that integrates with the company's MCP server to provide intelligent, conversational support.

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Next.js 14 (App Router) | Full-stack React framework |
| **Language** | TypeScript | Type safety |
| **AI Orchestration** | LangChain.js | Agent + tool orchestration |
| **LLM** | GPT-5.2 (OpenAI) | Conversational AI |
| **MCP Client** | @modelcontextprotocol/sdk | Connect to company MCP server |
| **UI Styling** | TailwindCSS + shadcn/ui | Modern, responsive UI |
| **Deployment** | Heroku | Cloud hosting |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEROKU                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js Application                     │  │
│  │                                                            │  │
│  │  ┌─────────────────┐      ┌─────────────────────────────┐ │  │
│  │  │   React UI      │      │      API Routes             │ │  │
│  │  │                 │      │                             │ │  │
│  │  │  - Chat Window  │ HTTP │  ┌─────────────────────┐    │ │  │
│  │  │  - Login Form   │◀────▶│  │   LangChain Agent   │    │ │  │
│  │  │  - Message List │      │  │                     │    │ │  │
│  │  └─────────────────┘      │  │  - ChatOpenAI       │    │ │  │
│  │                           │  │  - MCP Tools        │    │ │  │
│  │                           │  │  - Memory           │    │ │  │
│  │                           │  └──────────┬──────────┘    │ │  │
│  │                           │             │               │ │  │
│  │                           └─────────────┼───────────────┘ │  │
│  └─────────────────────────────────────────┼─────────────────┘  │
└─────────────────────────────────────────────┼───────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
           ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
           │   OpenAI API  │         │  MCP Server   │         │   (Future)    │
           │   (GPT-5.2)   │         │  order-mcp    │         │  Other APIs   │
           └───────────────┘         └───────────────┘         └───────────────┘
```

## MCP Server Integration

**Server URL:** `https://vipfapwm3x.us-east-1.awsapprunner.com/mcp`  
**Protocol:** Streamable HTTP  
**Server Name:** `order-mcp` v1.22.0

### Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `verify_customer_pin` | Authenticate customer | `email`, `pin` |
| `get_customer` | Get customer details | `customer_id` |
| `list_products` | Browse products | `category?`, `is_active?` |
| `get_product` | Get product by SKU | `sku` |
| `search_products` | Search products | `query` |
| `list_orders` | List customer orders | `customer_id?`, `status?` |
| `get_order` | Get order details | `order_id` |
| `create_order` | Place new order | `customer_id`, `items[]` |

## LangChain.js Integration

### Agent Architecture

```typescript
// Simplified structure
const agent = createToolCallingAgent({
  llm: new ChatOpenAI({ model: "gpt-5.2" }),
  tools: [
    // MCP tools wrapped as LangChain tools
    verifyCustomerPinTool,
    listProductsTool,
    searchProductsTool,
    getProductTool,
    listOrdersTool,
    getOrderTool,
    createOrderTool,
  ],
  prompt: customerSupportPrompt,
});
```

### Tool Wrapping Strategy

Each MCP tool is wrapped as a LangChain `DynamicStructuredTool`:

```typescript
const listProductsTool = new DynamicStructuredTool({
  name: "list_products",
  description: "List products with optional category filter",
  schema: z.object({
    category: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
  func: async (input) => {
    return await mcpClient.callTool("list_products", input);
  },
});
```

## User Flow

```
1. Customer opens chatbot
2. Customer provides email + PIN
3. Bot calls verify_customer_pin via MCP
4. If verified → customer_id stored in session
5. Customer asks questions:
   - "What monitors do you have?" → list_products/search_products
   - "Show my orders" → list_orders
   - "I want to order a printer" → create_order flow
6. LangChain agent decides which tools to call
7. Results formatted and returned to customer
```

## Project Structure

```
henry_asessment/
├── docs/
│   ├── task.md
│   └── architecture.md
├── scripts/
│   └── explore-mcp.mjs
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts
│   ├── components/
│   │   ├── Chat.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   └── LoginForm.tsx
│   ├── lib/
│   │   ├── mcp-client.ts
│   │   ├── langchain-agent.ts
│   │   └── mcp-tools.ts
│   └── types/
│       └── index.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── Procfile
└── README.md
```

## Environment Variables

```env
OPENAI_API_KEY=sk-...
MCP_SERVER_URL=https://vipfapwm3x.us-east-1.awsapprunner.com/mcp
NODE_ENV=production
PORT=3000
```

## Deployment (Heroku)

### Procfile
```
web: npm start
```

### next.config.js
```javascript
module.exports = {
  output: 'standalone',
};
```

### Deploy Commands
```bash
heroku create customer-support-chatbot
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set MCP_SERVER_URL=https://vipfapwm3x.us-east-1.awsapprunner.com/mcp
git push heroku main
```

## Security Considerations

- API keys stored as environment variables (never in code)
- Customer PIN verification handled server-side only
- Session management for authenticated customers
- Rate limiting on API routes (optional enhancement)

## Future Enhancements

- Conversation memory persistence (Redis/DB)
- Streaming responses for better UX
- Multi-language support
- Analytics dashboard
- Escalation to human agents
