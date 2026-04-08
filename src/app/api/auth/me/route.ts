import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  return Response.json({
    user: session
      ? {
          id: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
        }
      : null,
  });
}
