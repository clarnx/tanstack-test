import { createServerFileRoute } from "@tanstack/react-start/server";
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Helper functions
function getUsersFilePath() {
  
  if (process.env.NODE_ENV === "development") {
    return join(process.cwd(), 'src/data/users.json');
  }

  // In production (Netlify), files are in the dist folder
  return join(process.cwd(), 'dist/data/users.json');
}

async function readUsers() {
  try {
    const filePath = getUsersFilePath();
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users: any) {
  const filePath = getUsersFilePath();
  await writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');
}

export const ServerRoute = createServerFileRoute("/users").methods({
  GET: async ({ request }) => {
    try {
      const usersData = await readUsers();

      return new Response(JSON.stringify(usersData, null, 2), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error reading users.json:", error);
      console.error(
        "Attempted path:",
        join(dirname(fileURLToPath(import.meta.url)), "../data/users.json")
      );

      return Response.json(
        { error: "Users data not available" },
        { status: 500 }
      );
    }
  },
  POST: async ({ request, params }) => {
    try {
      const newUser = await request.json();

      if (!newUser.name || !newUser.email) {
        return Response.json(
          { error: 'Name and email are required' },
          { status: 400 }
        );
      }

      const users = await readUsers();

      const userWithId = {
        id: Date.now(),
        ...newUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users.push(userWithId);
      await writeUsers(users);

      return Response.json(userWithId, { status: 201 });
    } catch (error) {
      console.error('Error creating user:', error);
      return Response.json({ error: 'Failed to create user' }, { status: 500 });
    }
  },
}
);
