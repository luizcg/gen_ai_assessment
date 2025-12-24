"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
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
          "max-w-[85%] rounded-lg px-4 py-2 overflow-x-auto",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="text-sm mb-2 last:mb-0">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-bold">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic">{children}</em>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-sm mb-2 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside text-sm mb-2 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-sm">{children}</li>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full text-xs border-collapse border border-gray-300 dark:border-gray-600">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-200 dark:bg-gray-700">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody>{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr className="even:bg-gray-50 dark:even:bg-gray-750">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-left font-semibold border border-gray-300 dark:border-gray-600">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 border border-gray-300 dark:border-gray-600">
                {children}
              </td>
            ),
            code: ({ children }) => (
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
