import { createServerFileRoute } from "@tanstack/react-start/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

function getUsersFilePath() {
  // Always use the same path, matching included_files in netlify.toml
  return join(process.cwd(), "data/users.json");
}

async function readUsers() {
  try {
    const filePath = getUsersFilePath();
    const data = await readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export const ServerRoute = createServerFileRoute("/users").methods({
  GET: async () => {
    try {
      const usersData = await readUsers();
      return new Response(JSON.stringify(usersData, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return Response.json(
        { error: "Users data not available" },
        { status: 500 }
      );
    }
  },
  // For POST or use Netlify Blobs for persistence
});