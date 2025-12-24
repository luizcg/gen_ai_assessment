import { Langfuse } from "langfuse";

let langfuseInstance: Langfuse | null = null;

export function getLangfuse(): Langfuse {
  if (!langfuseInstance) {
    langfuseInstance = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: process.env.LANGFUSE_HOST,
    });
  }
  return langfuseInstance;
}

export interface TraceContext {
  traceId: string;
  sessionId?: string;
  userId?: string;
}

export function createTrace(options: {
  name: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}) {
  const langfuse = getLangfuse();
  const trace = langfuse.trace({
    name: options.name,
    sessionId: options.sessionId,
    userId: options.userId,
    metadata: options.metadata,
  });
  
  return trace;
}

export async function flushLangfuse() {
  if (langfuseInstance) {
    await langfuseInstance.flushAsync();
  }
}
