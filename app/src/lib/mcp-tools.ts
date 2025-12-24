import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { callMCPTool } from "./mcp-client";

export const verifyCustomerPinTool = new DynamicStructuredTool({
  name: "verify_customer_pin",
  description: "Verify customer identity with email and PIN. Use this to authenticate a customer before accessing their account or orders.",
  schema: z.object({
    email: z.string().describe("Customer email address"),
    pin: z.string().describe("4-digit PIN code"),
  }),
  func: async ({ email, pin }) => {
    return await callMCPTool("verify_customer_pin", { email, pin });
  },
});

export const getCustomerTool = new DynamicStructuredTool({
  name: "get_customer",
  description: "Get customer information by their ID. Use after verifying customer identity.",
  schema: z.object({
    customer_id: z.string().describe("Customer UUID"),
  }),
  func: async ({ customer_id }) => {
    return await callMCPTool("get_customer", { customer_id });
  },
});

export const listProductsTool = new DynamicStructuredTool({
  name: "list_products",
  description: "List available products. Can filter by category (e.g., 'Monitors', 'Printers', 'Computers') or active status.",
  schema: z.object({
    category: z.string().optional().describe("Filter by category"),
    is_active: z.boolean().optional().describe("Filter by active status"),
  }),
  func: async ({ category, is_active }) => {
    const args: Record<string, unknown> = {};
    if (category) args.category = category;
    if (is_active !== undefined) args.is_active = is_active;
    return await callMCPTool("list_products", args);
  },
});

export const getProductTool = new DynamicStructuredTool({
  name: "get_product",
  description: "Get detailed product information by SKU (e.g., 'MON-0054', 'COM-0001').",
  schema: z.object({
    sku: z.string().describe("Product SKU"),
  }),
  func: async ({ sku }) => {
    return await callMCPTool("get_product", { sku });
  },
});

export const searchProductsTool = new DynamicStructuredTool({
  name: "search_products",
  description: "Search products by name or description keyword.",
  schema: z.object({
    query: z.string().describe("Search term"),
  }),
  func: async ({ query }) => {
    return await callMCPTool("search_products", { query });
  },
});

export const listOrdersTool = new DynamicStructuredTool({
  name: "list_orders",
  description: "List orders. Can filter by customer_id or status (draft|submitted|approved|fulfilled|cancelled).",
  schema: z.object({
    customer_id: z.string().optional().describe("Filter by customer UUID"),
    status: z.string().optional().describe("Filter by order status"),
  }),
  func: async ({ customer_id, status }) => {
    const args: Record<string, unknown> = {};
    if (customer_id) args.customer_id = customer_id;
    if (status) args.status = status;
    return await callMCPTool("list_orders", args);
  },
});

export const getOrderTool = new DynamicStructuredTool({
  name: "get_order",
  description: "Get detailed order information including items.",
  schema: z.object({
    order_id: z.string().describe("Order UUID"),
  }),
  func: async ({ order_id }) => {
    return await callMCPTool("get_order", { order_id });
  },
});

export const createOrderTool = new DynamicStructuredTool({
  name: "create_order",
  description: "Create a new order for a customer. Requires customer_id and list of items with sku, quantity, unit_price, and currency.",
  schema: z.object({
    customer_id: z.string().describe("Customer UUID"),
    items: z.array(z.object({
      sku: z.string().describe("Product SKU"),
      quantity: z.number().describe("Quantity to order"),
      unit_price: z.string().describe("Unit price as string"),
      currency: z.string().default("USD").describe("Currency code"),
    })).describe("List of items to order"),
  }),
  func: async ({ customer_id, items }) => {
    return await callMCPTool("create_order", { customer_id, items });
  },
});

export const allTools = [
  verifyCustomerPinTool,
  getCustomerTool,
  listProductsTool,
  getProductTool,
  searchProductsTool,
  listOrdersTool,
  getOrderTool,
  createOrderTool,
];
