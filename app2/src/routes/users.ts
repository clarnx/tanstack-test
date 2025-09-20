import { createServerFileRoute } from "@tanstack/react-start/server";
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ServerRoute = createServerFileRoute("/users").methods({
  GET: async ({ request }) => {
    try {
      // Get the directory of the current file
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);

      // Navigate relative to current file location
      const filePath = join(__dirname, "../data/users.json");

      const data = await readFile(filePath, "utf8");
      const usersData = JSON.parse(data);

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
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = dirname(__filename)
      const filePath = join(__dirname, '../data/users.json')
      
      // Get the new user data from request
      const newUser = await request.json()
      
      // Read existing users
      let users = []
      try {
        const data = await readFile(filePath, 'utf8')
        users = JSON.parse(data)
      } catch (error) {
        // File doesn't exist, start with empty array
        users = []
      }
      
      // Add new user with generated ID
      const userWithId = {
        id: Date.now(), // Simple ID generation
        ...newUser,
        createdAt: new Date().toISOString()
      }
      
      users.push(userWithId)
      
      // Write back to file with pretty formatting
      await writeFile(filePath, JSON.stringify(users, null, 2), 'utf8')
      
      return Response.json(userWithId, { status: 201 })
    } catch (error) {
      console.error('Error writing to users.json:', error)
      return Response.json({ error: 'Failed to create user' }, { status: 500 })
    }}
},

);
