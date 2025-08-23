import { db } from "@/config/db";
import { videosTable } from "@/config/schema";
import { NextResponse } from "next/server";

export async function GET() {

  try {
    const allVideos = await db.select().from(videosTable); // saare rows fetch
    return NextResponse.json(allVideos);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }

    }
