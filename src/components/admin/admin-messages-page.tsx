"use client";

import { Loader2, RefreshCw, Send, UserCircle2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Conversation = {
  channel: string;
  totalMessages: number;
  lastMessage: {
    text: string;
    sender: string;
    fromRole: string;
    createdAt: string;
  };
  user: { name: string; email: string } | null;
};

type Message = {
  id: string;
  sender: string;
  fromRole: "ADMIN" | "USER" | "GUEST";
  text: string;
  createdAt: string;
};

const CONVERSATIONS_POLL_MS = 15000;
const MESSAGES_POLL_MS = 5000;

function formatDate(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
}

export function AdminMessagesPage({
  adminName,
  initialConversations = [],
  initialMessages = [],
  initialActiveChannel = null,
}: {
  adminName: string;
  initialConversations?: Conversation[];
  initialMessages?: Message[];
  initialActiveChannel?: string | null;
}) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeChannel, setActiveChannel] = useState<string | null>(initialActiveChannel);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(initialConversations.length === 0);
  const [loadingThread, setLoadingThread] = useState(false);
  const [error, setError] = useState("");
  const conversationsTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConversations = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoadingConversations(true);
      }

      const response = await fetch("/api/chat", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo cargar el centro de mensajes.");
      }

      const items = Array.isArray(data.conversations) ? data.conversations : [];
      setConversations(items);
      setActiveChannel((current) => {
        if (!current && items.length > 0) {
          return items[0].channel;
        }

        if (current && !items.some((item: Conversation) => item.channel === current)) {
          return items[0]?.channel || null;
        }

        return current;
      });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar conversaciones.");
    } finally {
      if (showSpinner) {
        setLoadingConversations(false);
      }
    }
  }, []);

  const fetchMessages = useCallback(async (channel: string, showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoadingThread(true);
      }

      const response = await fetch(`/api/chat?channel=${encodeURIComponent(channel)}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "No se pudieron cargar los mensajes.");
      }

      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar mensajes.");
    } finally {
      if (showSpinner) {
        setLoadingThread(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchConversations(true);
    conversationsTimer.current = setInterval(
      () => fetchConversations(false),
      CONVERSATIONS_POLL_MS,
    );

    return () => {
      if (conversationsTimer.current) {
        clearInterval(conversationsTimer.current);
      }
    };
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeChannel) {
      setMessages([]);
      return;
    }

    fetchMessages(activeChannel, true);

    if (messagesTimer.current) {
      clearInterval(messagesTimer.current);
    }

    messagesTimer.current = setInterval(
      () => fetchMessages(activeChannel, false),
      MESSAGES_POLL_MS,
    );

    return () => {
      if (messagesTimer.current) {
        clearInterval(messagesTimer.current);
      }
    };
  }, [activeChannel, fetchMessages]);

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!text.trim() || !activeChannel) {
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: activeChannel, text }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo enviar el mensaje.");
      }

      setText("");
      fetchMessages(activeChannel, false);
      fetchConversations(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el mensaje.");
    }
  };

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.channel === activeChannel) || null,
    [conversations, activeChannel],
  );

  return (
    <div className="min-w-[920px] space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Soporte</p>
        <h1 className="mt-2 font-serif text-3xl text-slate-950">Mensajes</h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="overflow-hidden border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">Conversaciones</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{conversations.length}</span>
              <button
                type="button"
                onClick={() => fetchConversations(true)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                aria-label="Actualizar conversaciones"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {loadingConversations ? (
              <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
              </div>
            ) : conversations.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                Sin conversaciones por ahora.
              </p>
            ) : (
              conversations.map((conversation) => {
                const isActive = conversation.channel === activeChannel;

                return (
                  <button
                    key={conversation.channel}
                    type="button"
                    onClick={() => setActiveChannel(conversation.channel)}
                    className={`flex w-full flex-col gap-1 border-b border-slate-100 px-4 py-3 text-left transition ${
                      isActive ? "bg-stone-100" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-800">
                      {conversation.user?.name || conversation.lastMessage?.sender || "Visitante"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {conversation.user?.email || conversation.channel}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {conversation.lastMessage?.text || "Sin mensajes"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(conversation.lastMessage?.createdAt)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex min-h-[70vh] flex-col border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <UserCircle2 className="h-6 w-6 text-stone-700" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {activeConversation?.user?.name || activeChannel || "Selecciona un canal"}
              </p>
              <p className="text-xs text-slate-500">{activeConversation?.user?.email}</p>
            </div>
          </div>

          {error ? (
            <div className="mx-5 mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loadingThread ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando mensajes...
                </div>
              ) : !activeChannel ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Selecciona una conversacion para comenzar.
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Aun no hay mensajes en este canal.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const mine = message.fromRole === "ADMIN";

                    return (
                      <div
                        key={message.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-3 text-sm shadow-sm ${
                            mine
                              ? "bg-stone-900 text-white"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          <p className="font-medium">
                            {mine ? adminName || "Admin" : message.sender || "Visitante"}
                          </p>
                          <p className="whitespace-pre-wrap">{message.text}</p>
                          <span className="mt-1 block text-[10px] opacity-70">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="border-t border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Escribe una respuesta..."
                  className="h-24 flex-1 resize-none border border-slate-200 px-3 py-2 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || !activeChannel}
                  className="inline-flex h-10 items-center justify-center bg-stone-900 px-4 text-sm font-medium text-white disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
