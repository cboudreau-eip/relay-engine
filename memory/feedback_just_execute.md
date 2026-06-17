---
name: feedback-just-execute
description: User wants Claude to act without asking permission for each step — execute, don't ask
metadata:
  type: feedback
---

Stop asking the user for permission/confirmation before taking actions. Just get the work done. Asking to "allow" each step slows everything down and frustrates the user.

**Why:** User explicitly said asking permission repeatedly is slowing everything down.

**How to apply:** Make edits, run commands, commit, and push autonomously across ALL of the user's repos (relay-engine, medicarefaq-next, etc.) — not just one. Do NOT end responses by asking "want me to go ahead?" or "should I build it?". Just build it, push it, and report what was done. Only pause for genuinely destructive/irreversible actions (e.g. deleting data, force-pushing over others' work) or true forks where intent is unknowable. Default hard to action. See [[feedback-git-workflow]].
