import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    if (session.user.role !== "TEACHER") {
      return new NextResponse(
        JSON.stringify({ message: "Access denied" }),
        { status: 403 }
      );
    }

    const teacherId = session.user.id;

    // Get all resources from teacher's classrooms
    const resources = await db.resource.findMany({
      where: {
        classroom: {
          teacherId,
        },
      },
      include: {
        classroom: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new NextResponse(
      JSON.stringify(resources),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching resources:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}