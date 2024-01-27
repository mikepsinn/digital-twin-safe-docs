import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response(
      "Missing BLOB_READ_WRITE_TOKEN. Don't forget to add that to your .env file.",
      {
        status: 401,
      },
    );
  }

  const file = req.body || "";
  const contentType = req.headers.get("content-type") || "text/plain";
  const filename = `${nanoid()}.${contentType.split("/")[1]}`;
  const blob = await put(filename, file, {
    contentType,
    access: "public",
  });

  // Upload to GitHub repo
  const url = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${filename}`;
    const body = {
        message: `Add ${filename}`,
        content: file,
    };
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `token ${process.env.GITHUB_TOKEN}`,
        },
        body: JSON.stringify(body),
    });

  return NextResponse.json(blob);
}
