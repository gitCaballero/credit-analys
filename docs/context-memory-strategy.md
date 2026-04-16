# Context and Memory Strategy

This document defines how to preserve relevant context, reduce token usage, and keep state efficiently while working on the project.

## Objectives

- Keep only essential context in memory.
- Avoid duplicating data across documents or prompts.
- Compress long histories into concise summaries.
- Store reusable architectural knowledge in repo files.

## Strategy for context storage

### 1. Use repo documentation as authoritative state

Keep project knowledge in structured Markdown files under `docs/`.
This repository is the canonical source of truths for:

- architecture decisions
- state models
- prompt summaries
- security guidelines
- testing strategy

That means we do not need to repeat the same content in conversation state.

### 2. Store only active task context in transient memory

When working on a task, maintain a small, focused summary of:

- current user request
- current file being edited
- recent validation results
- outstanding next steps

This avoids token inflation from full file contents.

### 3. Use summaries instead of raw content

For long prompts or large code sections, keep a one-paragraph summary.
Example:

- `domain models are implemented with DDD, audit, and benefit rules`
- `Docker Compose validated and app runs on port 3000`

### 4. Prefer references over replication

When a prompt or instruction has already been addressed, refer to the existing `docs/` file instead of rewriting it.
This enables token reuse and reduces unnecessary output.

## Memory and token economy guidelines

- Persist only the most relevant facts from the latest user instructions.
- Avoid storing entire code files as context.
- Store `what was asked` and `what remains to do`.
- Use `docs/` files for detailed explanations.

## Suggested repo structure for memory docs

- `docs/state-machine.md`
- `docs/context-memory-strategy.md`
- `docs/prompt-guidance.md`
- `docs/prompt-outputs.md`

## Example of context summary

Current task:

- Document remaining prompts
- Add state diagrams and memory strategy docs
- Keep docs organized in `docs/`
- Reference prior prompt instructions

Outcome:

- Completed `docs/prompt-outputs.md`
- Added `docs/state-machine.md`
- Added `docs/context-memory-strategy.md`
- Linking docs from README

## Recommendations for future work

- When editing code, only load the specific file and a short task description.
- When writing documentation, use existing docs as the source.
- When conversing, avoid reciting full prompt lists unless required.
