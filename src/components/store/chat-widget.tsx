"use client";

import { MoreHorizontal, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  CHAT_GUEST_CHANNEL_KEY,
  CHAT_GUEST_NAME_KEY,
} from "@/lib/constants";

const POLL_MS = 3000;
const CHAT_TITLE = process.env.NEXT_PUBLIC_CHAT_TITLE || "Ayuda ClosetSale";
const CHAT_TEAM_NAME =
  process.env.NEXT_PUBLIC_CHAT_TEAM_NAME || "Equipo ClosetSale";
const CHAT_PLACEHOLDER =
  process.env.NEXT_PUBLIC_CHAT_PLACEHOLDER || "Escribe tu mensaje...";
const CHAT_NAME_PLACEHOLDER =
  process.env.NEXT_PUBLIC_CHAT_NAME_PLACEHOLDER || "Tu nombre (opcional)";
const CHAT_HINT_PRIMARY =
  process.env.NEXT_PUBLIC_CHAT_HINT_PRIMARY || "Si tienes dudas, escribenos";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
};

type ChatMessage = {
  id: string;
  channel: string;
  sender: string;
  fromRole: "ADMIN" | "USER" | "GUEST";
  text: string;
  createdAt: string;
};

type AdminConversation = {
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

function makeGuestChannel() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `guest-${crypto.randomUUID()}`;
  }

  return `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getInitialGuestChannel() {
  if (typeof window === "undefined") {
    return null;
  }

  let storedChannel = window.localStorage.getItem(CHAT_GUEST_CHANNEL_KEY);
  if (!storedChannel) {
    storedChannel = makeGuestChannel();
    window.localStorage.setItem(CHAT_GUEST_CHANNEL_KEY, storedChannel);
  }

  return storedChannel;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("Invitado");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [adminConversations, setAdminConversations] = useState<AdminConversation[]>([]);
  const [adminActiveChannel, setAdminActiveChannel] = useState<string | null>(null);
  const [guestChannel] = useState<string | null>(getInitialGuestChannel);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAdminMode = authResolved && user?.role === "ADMIN";
  const channel = isAdminMode ? adminActiveChannel : user?.id || guestChannel;

  useEffect(() => {
    let closeTimer: number | null = null;
    let openTimer: number | null = null;

    if (isOpen) {
      closeTimer = window.setTimeout(() => setShowHint(false), 0);
    } else {
      openTimer = window.setTimeout(() => setShowHint(true), 0);
      const hideTimer = window.setTimeout(() => setShowHint(false), 5000);
      const interval = window.setInterval(() => {
        setShowHint(true);
        window.setTimeout(() => setShowHint(false), 5000);
      }, 18000);

      return () => {
        if (openTimer) {
          window.clearTimeout(openTimer);
        }
        if (closeTimer) {
          window.clearTimeout(closeTimer);
        }
        window.clearTimeout(hideTimer);
        window.clearInterval(interval);
      };
    }

    return () => {
      if (openTimer) {
        window.clearTimeout(openTimer);
      }
      if (closeTimer) {
        window.clearTimeout(closeTimer);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setName(data.user.name);
        }
      })
      .catch(() => undefined)
      .finally(() => setAuthResolved(true));
  }, []);

  useEffect(() => {
    if (!isAdminMode) {
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const loadConversations = async () => {
      try {
        const response = await fetch("/api/chat", { cache: "no-store" });
        const data = await response.json();

        if (!active) {
          return;
        }

        const items = Array.isArray(data.conversations) ? data.conversations : [];
        setAdminConversations(items);
        setAdminActiveChannel((current) => {
          if (!current && items.length > 0) {
            return items[0].channel;
          }

          if (current && !items.some((item: AdminConversation) => item.channel === current)) {
            return items[0]?.channel || null;
          }

          return current;
        });
      } catch {
        // Silent by design for polling
      }

      if (!active) {
        return;
      }

      timer = setTimeout(loadConversations, POLL_MS);
    };

    loadConversations();

    return () => {
      active = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isAdminMode]);

  useEffect(() => {
    if (!channel) {
      setMessages([]);
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chat?channel=${encodeURIComponent(channel)}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!active) {
          return;
        }

        setMessages(Array.isArray(data.messages) ? data.messages : []);

        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } catch {
        // Silent by design for polling
      }

      if (!active) {
        return;
      }

      timer = setTimeout(loadMessages, POLL_MS);
    };

    loadMessages();

    return () => {
      active = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [channel]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CHAT_GUEST_NAME_KEY, value);
    }
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!text.trim() || !channel) {
      return;
    }

    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: name || "Invitado",
        text,
        channel,
      }),
    });

    setText("");
    if (isAdminMode) {
      setTimeout(() => {
        void fetch("/api/chat", { cache: "no-store" })
          .then((response) => response.json())
          .then((data) => {
            const items = Array.isArray(data.conversations) ? data.conversations : [];
            setAdminConversations(items);
          })
          .catch(() => undefined);
      }, 150);
    }
  };

  const isOwnMessage = (message: ChatMessage) => {
    if (isAdminMode) {
      return message.fromRole === "ADMIN";
    }

    if (user) {
      return message.fromRole === "USER";
    }

    return message.fromRole !== "ADMIN" && message.channel === channel;
  };

  return (
    <div className="fixed bottom-4 right-4 z-[90]">
      <div
        className={`pointer-events-none absolute bottom-20 right-0 min-w-64 max-w-72 rounded-[1.8rem] bg-white px-5 py-3 text-sm text-stone-700 shadow-xl transition-all duration-300 ${
          showHint ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <span className="absolute -bottom-2 right-7 h-5 w-5 rotate-45 rounded-[0.35rem] bg-white" />
        <p className="font-medium text-stone-900">{CHAT_HINT_PRIMARY}</p>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="chat-widget-trigger rounded-full bg-stone-900 p-4 text-white shadow-xl transition hover:scale-105 hover:bg-stone-700"
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      >
        <MoreHorizontal className="h-6 w-6" />
      </button>

      {isOpen ? (
        <div className="mt-4 flex h-[30rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-stone-900 px-4 py-3 text-white">
            <div>
              <h3 className="font-semibold">{CHAT_TITLE}</h3>
              <p className="text-xs text-stone-300">{CHAT_TEAM_NAME}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white"
              aria-label="Cerrar chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {user ? (
            <div className="bg-stone-100 px-4 py-2 text-xs text-stone-600">
              Hablando como <span className="font-semibold text-stone-900">{user.name}</span>
            </div>
          ) : null}

          {isAdminMode ? (
            <div className="border-b border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                Conversaciones
              </p>
              {adminConversations.length === 0 ? (
                <p className="mt-2 text-xs text-stone-500">Sin mensajes por ahora.</p>
              ) : (
                <div className="mt-2 max-h-24 space-y-2 overflow-y-auto">
                  {adminConversations.map((conversation) => {
                    const isActive = conversation.channel === adminActiveChannel;

                    return (
                      <button
                        key={conversation.channel}
                        type="button"
                        onClick={() => setAdminActiveChannel(conversation.channel)}
                        className={`block w-full border px-3 py-2 text-left text-xs transition ${
                          isActive
                            ? "border-stone-900 bg-white text-stone-900"
                            : "border-stone-200 bg-white text-stone-600"
                        }`}
                      >
                        <p className="font-semibold">
                          {conversation.user?.name || conversation.lastMessage?.sender || "Visitante"}
                        </p>
                        <p className="truncate">{conversation.lastMessage?.text || "Sin mensajes"}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 pt-3">
              <input
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
                placeholder={CHAT_NAME_PLACEHOLDER}
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
              />
            </div>
          )}

          <div
            ref={containerRef}
            className="flex-1 space-y-3 overflow-y-auto bg-stone-50 px-4 py-4"
          >
            {isAdminMode && !adminActiveChannel ? (
              <p className="text-center text-sm text-stone-500">
                Selecciona una conversacion para responder.
              </p>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-stone-500">
                {isAdminMode
                  ? "Aun no hay mensajes en esta conversacion."
                  : "Inicia la conversacion y te responderemos por aqui."}
              </p>
            ) : (
              messages.map((message) => {
                const mine = isOwnMessage(message);
                return (
                  <div
                    key={message.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        mine
                          ? "bg-stone-900 text-white"
                          : "border border-stone-200 bg-white text-stone-800"
                      }`}
                    >
                      <span className="mb-1 block text-xs font-semibold">
                        {message.fromRole === "ADMIN"
                          ? user?.name || CHAT_TEAM_NAME
                          : message.sender}
                      </span>
                      <span className="whitespace-pre-wrap break-words">{message.text}</span>
                      <span className="mt-1 block text-[10px] opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-stone-200 p-3">
            <input
              className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm"
              placeholder={isAdminMode ? "Responder conversacion..." : CHAT_PLACEHOLDER}
              value={text}
              onChange={(event) => setText(event.target.value)}
              disabled={!channel || !authResolved}
            />
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white disabled:opacity-50"
              disabled={!channel || !text.trim() || !authResolved}
              aria-label="Enviar mensaje"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
