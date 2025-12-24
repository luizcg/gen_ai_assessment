"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

function parseTableData(text: string): { tables: TableData[]; textParts: string[] } {
  const lines = text.split("\n");
  const tables: TableData[] = [];
  const textParts: string[] = [];
  let currentTable: string[][] = [];
  let currentText = "";

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      if (currentText.trim()) {
        textParts.push(currentText.trim());
        currentText = "";
      }
      
      const cells = trimmedLine
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim());
      currentTable.push(cells);
    } else {
      if (currentTable.length > 0) {
        const headers = ["Date", "Order ID", "Status", "Total"];
        tables.push({
          headers,
          rows: currentTable,
        });
        textParts.push(`__TABLE_${tables.length - 1}__`);
        currentTable = [];
      }
      currentText += line + "\n";
    }
  }

  if (currentTable.length > 0) {
    const headers = ["Date", "Order ID", "Status", "Total"];
    tables.push({
      headers,
      rows: currentTable,
    });
    textParts.push(`__TABLE_${tables.length - 1}__`);
  }

  if (currentText.trim()) {
    textParts.push(currentText.trim());
  }

  return { tables, textParts };
}

function FormattedTable({ data }: { data: TableData }) {
  return (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            {data.headers.map((header, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-semibold border border-gray-300 dark:border-gray-600"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                rowIndex % 2 === 0
                  ? "bg-white dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-750"
              )}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 truncate max-w-[150px]"
                  title={cell}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormattedContent({ content }: { content: string }) {
  const { tables, textParts } = parseTableData(content);

  if (tables.length === 0) {
    return <p className="whitespace-pre-wrap text-sm">{content}</p>;
  }

  return (
    <div className="text-sm">
      {textParts.map((part, index) => {
        const tableMatch = part.match(/__TABLE_(\d+)__/);
        if (tableMatch) {
          const tableIndex = parseInt(tableMatch[1]);
          return <FormattedTable key={index} data={tables[tableIndex]} />;
        }
        return (
          <p key={index} className="whitespace-pre-wrap">
            {part}
          </p>
        );
      })}
    </div>
  );
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className={cn("h-8 w-8", isUser ? "bg-blue-600" : "bg-emerald-600")}>
        <AvatarFallback className={cn(isUser ? "bg-blue-600" : "bg-emerald-600", "text-white")}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-2",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        )}
      >
        <FormattedContent content={content} />
      </div>
    </div>
  );
}
