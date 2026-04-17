import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.name.endsWith(".csv")) return NextResponse.json({ error: "Only CSV files accepted" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Detect row count (quick scan)
    const content = buffer.toString("utf-8");
    const lines = content.split("\n").filter(l => l.trim());
    const rowCount = Math.max(0, lines.length - 1); // exclude header

    // Save to disk
    const uploadsDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const record = await prisma.csvFile.create({
      data: {
        originalName: file.name,
        status: "pending",
        rowCount,
      },
    });

    const filePath = path.join(uploadsDir, `${record.id}.csv`);
    await writeFile(filePath, buffer);

    return NextResponse.json({ fileId: record.id, rowCount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}