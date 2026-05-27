## AI Knowledge Base

Before implementing, refactoring, fixing bugs, generating tests, changing configuration, or touching OpenSpec tasks, Codex and any other AI coding agent must read:

- `docs/ai/implementation-learnings.md`

Use that file as project memory. Follow its concrete rules for architecture, tests, domain behavior, frontend/BFF integration, runtime mock removal, auth handling, naming, build commands, Docker workflow, and known anti-patterns.

Whenever an AI agent fixes a non-trivial bug, discovers a recurring mistake, changes an architectural decision, adds a workaround, or learns a project-specific implementation constraint, it must update `docs/ai/implementation-learnings.md` in the same change with:

- date
- context
- mistake or issue observed
- correct approach
- concrete file paths, commands, or examples when useful

Do not leave important lessons only in chat history. Persist them in `docs/ai/implementation-learnings.md`.
