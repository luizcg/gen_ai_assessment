import { NextRequest, NextResponse } from "next/server";
import { chat, Message, ChatContext } from "@/lib/langchain-agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context, sessionId } = body as {
      messages: Message[];
      context: ChatContext;
      sessionId?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const result = await chat(
      messages, 
      context || { isAuthenticated: false },
      sessionId
    );

    return NextResponse.json({
      response: result.response,
      context: result.updatedContext,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
