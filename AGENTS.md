<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Documentation lives next to the code

- `app/whenworks/README.md` describes how Whenworks works: pages, flows, data model, security rules and config. **Whenever a change alters any of these, update that README in the same commit.** Keep it describing the current state; don't add a changelog.
- The same goes for `app/admin/README.md` (login, statistics, what the admin page shows).
- Exact fields and types belong in `app/whenworks/_lib/types.ts` (with short comments). The README explains concepts and links to the code instead of copying field lists.
- The README is written in Swedish for the site owner; code and code comments are in English.
