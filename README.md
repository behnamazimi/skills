# Skills

Behnam Azimi's collection of [Agent Skills](https://docs.claude.com/en/docs/claude-code/skills), reusable, model-invoked instructions for Claude Code and other Agent-Skills-standard harnesses.

## Skills

- **[`gc`](skills/gc):** Rewrite text for grammar, punctuation, and flow when a message starts with `gc:`.
- **[`grill-everything`](skills/grill-everything):** Relentlessly interview the user about a plan, opinion, or claim to stress-test their thinking. A fork of [original grill-me by mattpocock](https://github.com/mattpocock/skills).
- **[`probe`](skills/probe):** Teach a topic one layer at a time through guided, back-and-forth questions.
- **[`skill-context-audit`](skills/skill-context-audit):** Audit a skill for context quality (poisoning, distraction, confusion, and clash).
- **[`zip`](skills/zip):** Report information as concisely as possible, sacrificing grammar for concision. 

## Installation

```bash
npx skills@latest add behnamazimi/skills
```

Pick the skills you want and which coding agents to install them on.
