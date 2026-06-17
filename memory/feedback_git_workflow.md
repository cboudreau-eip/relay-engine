---
name: feedback-git-workflow
description: After making file edits, Claude should commit and push to GitHub automatically — user should not have to run git commands
metadata:
  type: feedback
---

After making any code edit to the relay-engine repo, always commit and push immediately using PowerShell git commands. Do not ask the user to push manually.

**Why:** User found the manual commit/push step unnecessary friction. Claude has terminal access and can handle it directly.

**How to apply:** After every Edit or Write to the relay-engine codebase, run: `git add -A`, `git commit -m "..."`, `git push` via PowerShell. Vercel auto-deploys on push.
