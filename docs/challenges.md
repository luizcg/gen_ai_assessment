# Development Challenges & Solutions

This document tracks challenges encountered during development and how they were resolved. Useful for Video 2 submission.

---

## Challenge 1: MCP Server "Not Acceptable" Error

**Date:** Dec 24, 2024  
**Severity:** Blocking  
**Component:** MCP Client / API Integration

### Problem
When first attempting to communicate with the MCP server at `https://vipfapwm3x.us-east-1.awsapprunner.com/mcp`, all requests failed with:
```
Error: Not Acceptable: Client must accept application/json
```

### Root Cause
The MCP server requires explicit `Accept: application/json` header in all requests, which wasn't being sent by default.

### Solution
Added the `Accept` header to all fetch requests in the MCP client:
```javascript
headers: {
  "Content-Type": "application/json",
  "Accept": "application/json",  // Added this line
}
```

### Files Modified
- `scripts/explore-mcp.mjs`
- `app/src/lib/mcp-client.ts`

---

## Challenge 2: TypeScript Error with LangChain Tool Invocation

**Date:** Dec 24, 2024  
**Severity:** Blocking  
**Component:** LangChain Agent

### Problem
TypeScript compilation failed with error when invoking LangChain tools:
```
Property 'invoke' does not exist on type 'DynamicStructuredTool<...>'
```

The complex union types from LangChain's `DynamicStructuredTool` made it difficult to call the tool functions directly.

### Root Cause
LangChain's TypeScript definitions use complex union types that don't expose the `invoke` method cleanly in all type contexts.

### Solution
Used type casting as a pragmatic solution for the prototype:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const result = await (tool as any).func(toolCall.args);
```

### Trade-offs
- Loses type safety for this specific call
- Acceptable for prototype; would need proper typing in production

### Files Modified
- `app/src/lib/langchain-agent.ts`

---

## Challenge 3: Chat Input Field Disappearing

**Date:** Dec 24, 2024  
**Severity:** High  
**Component:** Chat UI

### Problem
After submitting a message, the chat input field would disappear from view, making it impossible to send follow-up messages.

### Root Cause
The flex container layout with `ScrollArea` component wasn't properly constraining the scrollable area, causing the input to be pushed out of the viewport.

### Solution
Restructured the CSS layout:
```tsx
// Before
<CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
  <ScrollArea className="flex-1 p-4">
    ...
  </ScrollArea>
  <ChatInput />
</CardContent>

// After
<CardContent className="flex-1 flex flex-col p-0 min-h-0">
  <div className="flex-1 overflow-y-auto p-4">
    ...
  </div>
  <div className="flex-shrink-0">
    <ChatInput />
  </div>
</CardContent>
```

Key changes:
- Added `min-h-0` to allow flex children to shrink
- Used `flex-shrink-0` on input container to prevent shrinking
- Replaced `ScrollArea` with native `overflow-y-auto`

### Files Modified
- `app/src/components/Chat.tsx`

---

## Challenge 4: GitHub Mermaid Diagram Rendering Failure

**Date:** Dec 24, 2024  
**Severity:** Medium  
**Component:** Documentation

### Problem
The architecture diagram in README.md failed to render on GitHub with error:
```
Lexical error on line 9. Unrecognized text.
... API[/api/chat] Ag
```

### Root Cause
GitHub's Mermaid parser doesn't handle:
- Emojis in node labels
- Forward slashes in node text (e.g., `/api/chat`)
- Special characters without proper escaping

### Solution
Simplified the Mermaid syntax:
```mermaid
# Before
API[/api/chat]
OpenAI[🤖 OpenAI API]

# After  
API["API /api/chat"]
OpenAI["OpenAI API"]
```

### Files Modified
- `README.md`

---

## Challenge 5: Heroku Subdirectory Deployment

**Date:** Dec 24, 2024  
**Severity:** Medium  
**Component:** Deployment

### Problem
The Next.js application is in the `app/` subdirectory, but Heroku expects the application at the repository root.

### Root Cause
Standard Heroku Node.js buildpack only looks for `package.json` at the root level.

### Solution
Used a combination of buildpacks:
1. **Subdirectory buildpack** - Moves the `app/` directory to root before build
2. **Node.js buildpack** - Standard Node.js/Next.js build

Configuration:
```bash
heroku buildpacks:set https://github.com/timanovsky/subdir-heroku-buildpack
heroku buildpacks:add heroku/nodejs
heroku config:set PROJECT_PATH=app
```

### Files Modified
- Heroku configuration (not in codebase)

---

## Challenge 6: Embedded Git Repository Warning

**Date:** Dec 24, 2024  
**Severity:** Low  
**Component:** Version Control

### Problem
When committing, Git warned about embedded repository:
```
warning: adding embedded git repository: app
hint: You've added another git repository inside your current repository.
```

### Root Cause
The `app/` directory (created by `create-next-app`) had its own `.git` folder.

### Solution
Removed the nested `.git` directory:
```bash
rm -rf app/.git
git rm --cached -r .
git add .
```

### Files Modified
- None (Git configuration only)

---

## Challenge 7: Table Data Formatting (Ongoing)

**Date:** Dec 24, 2024  
**Severity:** Medium  
**Component:** Chat UI

### Problem
Order data from MCP server displays as raw pipe-delimited text, making it hard to read. Also, markdown formatting like `**bold**` shows as literal text.

### Current Solution (Partial)
Implemented custom table parser that converts pipe-delimited data to HTML tables. However:
- Hardcoded headers don't match actual data structure
- Markdown syntax (`**text**`) not being rendered
- First row of data treated as data, not headers

### Planned Improvement
Add `react-markdown` library for proper markdown rendering, including:
- Bold/italic text
- Tables
- Code blocks
- Links

### Files Modified
- `app/src/components/ChatMessage.tsx`

---

## Decisions Log

### Decision 1: LangChain.js over Python LangChain
**Rationale:** Allows full-stack JavaScript/TypeScript, simplifies deployment, single language for frontend and backend.

### Decision 2: Next.js over separate frontend/backend
**Rationale:** API routes in same project, simplified deployment to Heroku, server-side rendering capabilities.

### Decision 3: GPT-5.2 as LLM
**Rationale:** User specified this model. Latest and most capable for tool calling and reasoning.

### Decision 4: Heroku over HuggingFace Spaces
**Rationale:** Better Node.js support, user familiarity with platform, straightforward deployment process.

### Decision 5: Standalone Next.js output
**Rationale:** Required for Heroku deployment, creates self-contained build without needing full `node_modules`.

---

*Last updated: Dec 24, 2024*
