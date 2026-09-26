# Mane Haven MCP demo

Read-only salon concierge server with five tools: list services, salon information, service recommendation, illustrative rebooking guidance, and appointment message drafts. The menu snapshot was checked September 25, 2026. Update `catalog.json` when the salon changes its menu.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install` and `npm test`.
3. Run `npm start`; the MCP endpoint is `http://localhost:3000/mcp` and health check is `/health`.

For the ChatGPT **With MCP** flow, deploy this server to a stable public HTTPS address and enter its full `/mcp` URL. A local URL or this ZIP alone cannot complete that screen. The server is stateless and requires no salon login because it exposes only public catalog data and draft text. It cannot see availability, book appointments, access clients, or send reminders.

Before a public release, have Addison verify the catalog, especially the Color Consultation listing whose public description refers to extensions. Review any prototype rebooking intervals with the stylist. Host logs, rate limits, domain verification and review materials also need completion for public submission.
