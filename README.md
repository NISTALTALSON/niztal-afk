<div align="center">

# niztal-afk

### Autonomous owner mode for work that should keep moving while you are away

<p>
  <a href="https://github.com/NISTALTALSON/niztal-afk">
    <img src="https://img.shields.io/badge/GitHub-NISTALTALSON%2Fniztal--afk-181717?logo=github&logoColor=white" alt="GitHub repository">
  </a>
  <a href="https://github.com/NISTALTALSON/niztal-afk/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT License">
  </a>
  <a href="https://github.com/NISTALTALSON/niztal-afk/commits/main">
    <img src="https://img.shields.io/github/last-commit/NISTALTALSON/niztal-afk?label=updated" alt="Latest commit">
  </a>
</p>

<p><em>Hand over the task. Come back to a finished deliverable and a concise handoff.</em></p>

</div>

---

## What this is

`niztal-afk` is a portable skill bundle for autonomous **away-from-keyboard** work. When a user says they are away, busy, in a meeting, or asks the agent to “handle this,” the skill switches the interaction from question-driven assistance to accountable ownership:

- define a concrete done-state before acting;
- inspect the available tools, repository, and project context;
- make reversible decisions without blocking on routine choices;
- plan, act, verify, and record progress;
- ship tested work through the available GitHub workflow; and
- return a short handoff with decisions, verification, blockers, and sources.

This repository is **not an application or service**. It is the packaged `.skill` artifact and its source documentation.

## Install

Download [`niztal-afk.skill`](./niztal-afk.skill) from this repository and install or import it through the skill-compatible agent environment you use.

The archive is self-contained and preserves the following layout:

```text
niztal-afk.skill
└── niztal-afk/
    ├── SKILL.md
    └── references/
        ├── capability-discovery.md
        ├── github-workflow.md
        └── handoff-report.md
```

> The `.skill` file is a ZIP-based bundle. The repository intentionally does not include a package manager, runtime dependencies, build step, or application entry point.

## How it behaves

### 1. Activate ownership

The skill recognizes handoff language such as:

> “I’m AFK — take this end to end.”

It turns that request into a small, checkable definition of done instead of waiting for a chain of approvals.

### 2. Operate with guardrails

The operator is encouraged to use the tools available in the current session, but it does not treat autonomy as permission to do everything. It explicitly stops short of spending money, changing account security, handling high-stakes decisions, sending messages as the user without approval, or deleting original data.

### 3. Verify before handing back

The default loop is:

```text
Plan → Act → Verify → Record
```

The result is a finished artifact where possible, not an unverified plan.

### 4. Leave a useful handoff

The bundled handoff format is intentionally compact:

| Section | Purpose |
| --- | --- |
| **Done** | What now exists and where to find it |
| **Verified** | Tests, checks, or other evidence |
| **Decisions I made for you** | Assumptions and how to undo them |
| **Needs you** | Only approvals, credentials, permissions, or other true blockers |
| **Next step** | One real follow-up, when one exists |
| **Sources** | References used during the work |

## GitHub-aware by design

For repository work, the skill documents a conservative delivery path:

1. inspect the repository’s conventions and available checks;
2. make focused changes and run the relevant validation;
3. scan the proposed diff for secrets and unrelated files;
4. use a branch and pull request unless direct delivery is explicitly appropriate; and
5. report permission, branch-protection, or merge blockers plainly rather than working around them.

Read the bundled [`github-workflow.md`](https://github.com/NISTALTALSON/niztal-afk/blob/main/niztal-afk.skill) reference inside the archive for the complete workflow guidance.

## Repository map

| Path | Role |
| --- | --- |
| [`niztal-afk.skill`](./niztal-afk.skill) | Distributable skill bundle |
| `niztal-afk/SKILL.md` *(inside the archive)* | Activation rules and operating model |
| `niztal-afk/references/capability-discovery.md` *(inside the archive)* | Capability inventory and fallback behavior |
| `niztal-afk/references/github-workflow.md` *(inside the archive)* | Branch, PR, verification, and safety guidance |
| `niztal-afk/references/handoff-report.md` *(inside the archive)* | Final handoff template |
| [`LICENSE`](./LICENSE) | MIT license |

## Design principles

<details>
<summary><strong>Autonomy without surprise</strong></summary>

Routine, reversible decisions should not stall an absent user. Irreversible or high-impact actions still require a human boundary.

</details>

<details>
<summary><strong>Evidence over confidence</strong></summary>

A command that was not run, a number that was not recomputed, or a file that was not checked is not presented as verified.

</details>

<details>
<summary><strong>Small handoffs, complete context</strong></summary>

The final report favors outcomes, validation, decisions, blockers, and sources over a long activity log.

</details>

## License

Released under the [MIT License](./LICENSE).

---

<div align="center">
  <sub>Built for the moment you need the work done, not another question.</sub>
</div>
