import { AdminMessagesPage } from "@/components/admin/admin-messages-page";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MessagesAdminPage() {
  const session = await requireAdmin();
  const latestMessages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  const conversations = Array.from(
    latestMessages.reduce<
      Map<
        string,
        {
          channel: string;
          totalMessages: number;
          lastMessage: {
            text: string;
            sender: string;
            fromRole: string;
            createdAt: Date;
          };
          user: { name: string; email: string } | null;
        }
      >
    >((acc, message) => {
      const existing = acc.get(message.channel);

      if (existing) {
        existing.totalMessages += 1;
        return acc;
      }

      acc.set(message.channel, {
        channel: message.channel,
        totalMessages: 1,
        lastMessage: {
          text: message.text,
          sender: message.sender,
          fromRole: message.fromRole,
          createdAt: message.createdAt,
        },
        user: message.user
          ? {
              name: message.user.name,
              email: message.user.email,
            }
          : null,
      });

      return acc;
    }, new Map()).values(),
  );
  const initialChannel = conversations[0]?.channel ?? null;
  const initialMessages = initialChannel
    ? await prisma.chatMessage.findMany({
        where: { channel: initialChannel },
        orderBy: { createdAt: "asc" },
        take: 500,
      })
    : [];
  const serializedConversations = conversations.map((conversation) => ({
    ...conversation,
    lastMessage: {
      ...conversation.lastMessage,
      createdAt: conversation.lastMessage.createdAt.toISOString(),
    },
  }));
  const serializedMessages = initialMessages.map((message) => ({
    ...message,
    createdAt: message.createdAt.toISOString(),
  }));

  return (
    <AdminMessagesPage
      adminName={session.name}
      initialConversations={serializedConversations}
      initialMessages={serializedMessages}
      initialActiveChannel={initialChannel}
    />
  );
}
