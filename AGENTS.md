<!-- BEGIN:opencode-agent-rules -->
# OpenCode Agent Rules

This is your agent configuration. Customize this file to define how the agent should behave.

## Communication Style

### Caveman Mode
For ultra-compressed responses (~75% token reduction), use caveman mode:
- Trigger: "caveman mode", "talk like caveman", "/caveman"
- Levels: lite, full (default), ultra, wenyan-lite, wenyan-full, wenyan-ultra
- Switch: `/caveman lite|full|ultra`
- Rules: Drop articles (a/an/the), filler, pleasantries, hedging. Fragments OK.
- Code/commits: write normal. "stop caveman" or "normal mode": revert.

### Cavecrew (Compressed Subagents)
Use cavecrew subagents for compressed output when investigating or building:
- `cavecrew-investigator`: Locate code (file:line format, ~60% smaller output)
- `cavecrew-builder`: 1-2 file surgical edits
- `cavecrew-reviewer`: Diff review with emoji severity markers
- Trigger: "delegate to subagent", "use cavecrew", "compressed agent output"
<!-- END:opencode-agent-rules -->

<!-- BEGIN:nextjs-agent-rules -->
# Next.js Breaking Changes

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Context

See CLAUDE.md for full project documentation including:
- Stack (Spring Boot 3.5.14 + Next.js App Router)
- Database schema (Usuario, Moto, Reserva, Documento, Cartao, EnderecoCobranca)
- Auth flow (JWT with auth-token cookie)
- Data flow (Server Components vs Client Components)
- API endpoints (public and authenticated)
- Key patterns and conventions

## Available Skills

Skills are configured in `skills-lock.json`:
- **caveman**: Ultra-compressed communication mode
- **cavecrew**: Delegation guide for compressed subagents

## Commands

- `/caveman [lite|full|ultra]`: Toggle caveman communication mode
- `/help`: Get help with using opencode