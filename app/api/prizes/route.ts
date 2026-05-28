import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Prize } from "@/app/types";

const DATA_PATH = path.join(process.cwd(), "data", "prizes.json");

async function readPrizes(): Promise<Prize[]> {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as Prize[];
}

export async function GET() {
  try {
    const prizes = await readPrizes();
    return NextResponse.json(prizes);
  } catch (err) {
    console.error("Failed to read prizes:", err);
    return NextResponse.json(
      { error: "Failed to read prizes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Body must be an array of prizes" },
        { status: 400 }
      );
    }

    const prizes = body as Prize[];

    // Basic validation
    for (const prize of prizes) {
      if (
        typeof prize.id !== "string" ||
        typeof prize.name !== "string" ||
        typeof prize.active !== "boolean"
      ) {
        return NextResponse.json(
          { error: "Invalid prize shape" },
          { status: 400 }
        );
      }
    }

    await writeFile(DATA_PATH, JSON.stringify(prizes, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to save prizes:", err);
    return NextResponse.json(
      { error: "Failed to save prizes" },
      { status: 500 }
    );
  }
}
