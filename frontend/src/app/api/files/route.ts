import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const files = await prisma.csvFile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      originalName: true,
      status: true,
      rowCount: true,
      processedCount: true,
      errorCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(files);
}