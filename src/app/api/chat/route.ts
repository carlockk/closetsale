import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const requestedChannel = searchParams.get("channel");

    if (session?.role === "ADMIN") {
      if (requestedChannel) {
        const messages = await prisma.chatMessage.findMany({
          where: { channel: requestedChannel },
          orderBy: { createdAt: "asc" },
          take: 500,
        });

        return Response.json({ messages });
      }

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

      return Response.json({ conversations });
    }

    const channel = session?.userId || requestedChannel;

    if (!channel) {
      return Response.json({ message: "Canal requerido" }, { status: 400 });
    }

    if (session?.userId && channel !== session.userId) {
      return Response.json({ message: "Acceso denegado" }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { channel },
      orderBy: { createdAt: "asc" },
      take: 300,
    });

    return Response.json({ messages });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Error al cargar mensajes" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const text = String(body.text || "").trim();

    if (!text) {
      return Response.json({ message: "Mensaje requerido" }, { status: 400 });
    }

    let channel = String(body.channel || "").trim();
    let sender = String(body.sender || "").trim();
    let fromRole: "ADMIN" | "USER" | "GUEST" = "GUEST";
    let userId: string | null = null;

    if (session) {
      if (session.role === "ADMIN") {
        fromRole = "ADMIN";
        sender = session.name || "Administrador";

        if (!channel) {
          return Response.json({ message: "Canal requerido para responder" }, { status: 400 });
        }
      } else {
        fromRole = "USER";
        channel = session.userId;
        sender = session.name || sender || "Cliente";
        userId = session.userId;
      }
    }

    if (!channel) {
      return Response.json({ message: "Canal no especificado" }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        channel,
        sender: sender || "Invitado",
        fromRole,
        text,
        userId,
      },
    });

    return Response.json({ ok: true, id: message.id });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Error al enviar mensaje" },
      { status: 500 },
    );
  }
}
