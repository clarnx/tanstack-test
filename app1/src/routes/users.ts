import { createServerFileRoute } from '@tanstack/react-start/server'
import users from "../data/users.json";

export const ServerRoute = createServerFileRoute('/users').methods({
  GET: async ({ request }) => {

    return new Response(JSON.stringify(users, null, 2), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
})