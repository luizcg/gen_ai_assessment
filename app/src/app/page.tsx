import { Chat } from "@/components/Chat";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            TechStore Customer Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your AI-powered assistant for products, orders, and support
          </p>
        </header>
        <Chat />
        <footer className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by LangChain.js + MCP</p>
        </footer>
      </div>
    </div>
  );
}
