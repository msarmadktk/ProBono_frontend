"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

/* --------------------------- config --------------------------- */
const BASE_URL = "http://localhost:5000"; // ← backend root
const POLL_INTERVAL_MS = 3000; // refresh messages every 3 s

/* --------------------------- helpers -------------------------- */
const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

/* -------------------------- component ------------------------- */
export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const jobId = searchParams.get("jobId");
  const clientIdParam = searchParams.get("clientId");
  const freelancerId = searchParams.get("freelancerId");

  const [clientId, setClientId] = useState(clientIdParam || null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bottomRef = useRef(null);

  /* 1️⃣ Resolve clientId (in case not provided via query) */
  useEffect(() => {
    if (clientId || !isLoaded || !user) return;

    (async () => {
      try {
        const email = user.emailAddresses?.[0]?.emailAddress;
        const { userId } = await fetchJson(`${BASE_URL}/api/getUserId`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setClientId(`${userId}`);
      } catch (err) {
        console.error(err);
        setError("Unable to resolve client id");
      }
    })();
  }, [clientId, isLoaded, user]);

  /* 2️⃣ Create or fetch chat */
  useEffect(() => {
    if (!jobId || !clientId || !freelancerId) return;

    (async () => {
      try {
        const data = await fetchJson(
          `${BASE_URL}/api/chats?jobId=${jobId}&clientId=${clientId}&freelancerId=${freelancerId}`
        );
        setChatId(data.id);
        setMessages(data.messages || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load chat");
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId, clientId, freelancerId]);

  /* 3️⃣ Poll for new messages */
  useEffect(() => {
    if (!chatId) return;

    const interval = setInterval(async () => {
      try {
        const data = await fetchJson(`${BASE_URL}/api/chats/${chatId}/messages`);
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [chatId]);

  /* 4️⃣  Autoscroll on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------------- send message ------------------------- */
  const handleSend = async () => {
    if (!messageText.trim()) return;
    if (!chatId || !user) return;

    const senderId = user?.publicMetadata?.role === "freelancer" ? freelancerId : clientId;
    const payload = { senderId, content: messageText.trim() };

    try {
      await fetchJson(`${BASE_URL}/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMessageText("");
      // Optimistic refresh
      const data = await fetchJson(`${BASE_URL}/api/chats/${chatId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* --------------------- UI helpers ---------------------------- */
  const Spinner = () => (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <svg
        className="animate-spin h-8 w-8 mb-3 text-green-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3.536-3.536A8 8 0 014 12z"
        ></path>
      </svg>
      Loading chat…
    </div>
  );

  /* ---------------------------- render -------------------------- */

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600 text-center py-4">{error}</p>;

  return (
    <main className="mx-auto max-w-3xl h-[calc(100vh-4rem)] px-2 sm:px-4 py-6">
      {/* chat header */}
      <header className="border rounded-t-lg p-4 flex justify-between items-center bg-white shadow-sm">
        <h1 className="font-semibold text-lg text-center w-full">My Chats</h1>
        {/* could add dropdown / menu here */}
      </header>

      {/* messages */}
      <section className="border-x border-b rounded-b-lg bg-white flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isMine = `${m.sender_id}` === `${clientId || freelancerId}`; // crude check
            return (
              <div
                key={m.id}
                className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 text-sm whitespace-pre-line leading-relaxed ${
                  isMine
                    ? "bg-emerald-200 self-end text-gray-800"
                    : "bg-gray-100 self-start text-gray-800"
                }`}
              >
                {m.content}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* input */}
        <div className="border-t p-3 flex items-end gap-2">
          <textarea
            className="flex-1 resize-none rounded-md border-gray-300 focus:border-green-600 focus:ring-green-600 text-sm p-2 h-14"
            placeholder="Type a message…"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 text-sm font-medium"
          >
            Send
          </button>
        </div>
      </section>
    </main>
  );
}
