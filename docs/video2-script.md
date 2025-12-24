# Video 2 Script: Development Progress & Challenges

**Target Duration:** 2-3 minutes (max 4 minutes)  
**Date:** December 24, 2024

---

## Opening (15 seconds)

"Hi! This is my second video for the TechStore AI Customer Support Chatbot project. I'll walk you through what I've built so far, the key decisions I made, and the main challenges I faced during development."

---

## What Was Built (45 seconds)

"I successfully implemented a full-stack customer support chatbot using Next.js 16 with TypeScript. The application integrates with the company's MCP server using the Streamable HTTP protocol and leverages GPT-5.2 through LangChain.js for intelligent conversations.

The chatbot has 8 integrated tools:
- Customer authentication with email and PIN
- Product browsing and search
- Order history viewing
- And order creation

The UI is modern and responsive, built with TailwindCSS and shadcn/ui components. I also added features like a maximize/minimize button and proper markdown rendering for tables and formatted text.

The application is deployed to Heroku and the code is on GitHub."

---

## Key Technical Decisions (30 seconds)

"I made several important architectural decisions:

First, I chose LangChain.js over Python LangChain to keep the entire stack in JavaScript/TypeScript, simplifying deployment and maintenance.

Second, I used Next.js API routes instead of a separate backend, which streamlined the deployment to Heroku.

Third, I configured Next.js with standalone output mode, which is required for Heroku and creates a self-contained build."

---

## Main Challenges (60 seconds)

"I encountered 7 significant challenges during development:

**Challenge 1:** The MCP server initially rejected all requests with 'Not Acceptable' errors. The fix was adding an explicit 'Accept: application/json' header to all API calls.

**Challenge 2:** TypeScript compilation failed when invoking LangChain tools due to complex union types. I used type casting as a pragmatic solution for the prototype.

**Challenge 3:** The chat input field disappeared after sending messages. This was a CSS flexbox issue that I resolved by restructuring the layout with proper flex constraints.

**Challenge 4:** GitHub couldn't render the Mermaid architecture diagram because it contained emojis and special characters. I simplified the syntax to fix this.

**Challenge 5:** Heroku deployment was tricky because the Next.js app is in a subdirectory. I solved this using a combination of the subdirectory buildpack and the standard Node.js buildpack.

**Challenge 6:** There was a nested Git repository warning that I fixed by removing the embedded .git folder.

**Challenge 7:** Order data displayed as raw pipe-delimited text. I implemented react-markdown with remark-gfm to properly render tables, bold text, and other markdown formatting."

---

## Current Status (15 seconds)

"The application is fully functional and deployed. All test customers can authenticate, browse products, view their orders, and place new orders. The chatbot handles errors gracefully and provides a smooth user experience."

---

## Closing (15 seconds)

"The project demonstrates successful integration of modern AI tools with existing backend systems. All challenges were resolved, and the application is ready for production use. Thank you!"

---

## Timing Breakdown

- Opening: 15s
- What Was Built: 45s
- Key Decisions: 30s
- Main Challenges: 60s
- Current Status: 15s
- Closing: 15s

**Total: 3 minutes**

---

## Demo Flow (if showing the app)

1. Show the live Heroku URL
2. Demonstrate authentication with a test customer
3. Show product browsing
4. Display order history with formatted table
5. Show the maximize/minimize feature
6. Briefly show the GitHub repository

---

## Tips for Recording

- Speak clearly and at a moderate pace
- Show the live application while explaining
- Highlight the formatted tables and markdown rendering
- Keep energy up - this shows your problem-solving skills
- Reference the challenges.md document if needed
- End with confidence about the solution's completeness
