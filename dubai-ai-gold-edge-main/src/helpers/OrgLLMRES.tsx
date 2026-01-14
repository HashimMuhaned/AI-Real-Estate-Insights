import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// Utility: detect and wrap trend arrows in color
function colorizeEmojis(text: string) {
  return text
    .replace(/(↑|↗|➚)/g, "<span class='text-green-600 font-bold'>$1</span>")
    .replace(/(↓|↘|➘)/g, "<span class='text-red-600 font-bold'>$1</span>");
}

export default function MarkdownRenderer({ text }: { text: string }) {
  const processed = colorizeEmojis(text);

  return (
    <div className="prose prose-sm max-w-none no-scrollbar">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-3 mb-1">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="my-2 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc ml-5 my-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-5 my-2">{children}</ol>
          ),
          li: ({ children }) => <li className="mt-1">{children}</li>,
          table: ({ children }) => (
            <table className="border-collapse border border-gray-300 my-3">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-2 py-1">{children}</td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
