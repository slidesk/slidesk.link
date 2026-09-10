import skill from "./SKILL.md" with { type: "text" };

/**
 * The agent-facing skill, embedded in the bundle rather than read from disk:
 * the release image ships `dist-server` only, so at runtime this file does not
 * exist beside the server. Same reasoning as the SQL migrations.
 */
export const SKILL_MARKDOWN = skill;

/**
 * The skill without its YAML frontmatter, for the MCP `instructions` field —
 * `name` and `description` are how a *file-based* skill gets discovered, and a
 * client that already holds the server needs neither.
 */
export const SKILL_INSTRUCTIONS = skill
  .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n+/, "")
  .trim();
