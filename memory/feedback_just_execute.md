---
name: feedback-just-execute
description: User wants Claude to act without asking permission for each step — execute, don't ask
metadata:
  type: feedback
---

Stop asking the user for permission/confirmation before taking actions. Just get the work done. Asking to "allow" each step slows everything down and frustrates the user.

**Why:** User explicitly said asking permission repeatedly is slowing everything down.

**How to apply:** Make edits, run commands, commit, and push autonomously. Only pause for genuinely destructive/irreversible actions or true forks where the user's intent is unknowable. Default to action. See [[feedback-git-workflow]].
