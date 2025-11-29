# GPT-5 Prompting Guide

> **Source**: OpenAI
> **Authors**: Anoop Kotha (OpenAI), Julian Lee (OpenAI), Eric Zakariasson, et al.

---

## Table of Contents

1. [Agentic Workflow Predictability](#agentic-workflow-predictability)
   - [Controlling Agentic Eagerness](#controlling-agentic-eagerness)
   - [Tool Preambles](#tool-preambles)
   - [Reasoning Effort](#reasoning-effort)
   - [Reusing Reasoning Context](#reusing-reasoning-context-with-the-responses-api)
2. [Maximizing Coding Performance](#maximizing-coding-performance-from-planning-to-execution)
   - [Frontend App Development](#frontend-app-development)
   - [Zero-to-One App Generation](#zero-to-one-app-generation)
   - [Matching Codebase Design Standards](#matching-codebase-design-standards)
   - [Cursor's GPT-5 Prompt Tuning](#collaborative-coding-in-production-cursors-gpt-5-prompt-tuning)
3. [Optimizing Intelligence and Instruction-Following](#optimizing-intelligence-and-instruction-following)
   - [Steering](#steering)
   - [Verbosity](#verbosity)
   - [Instruction Following](#instruction-following)
   - [Minimal Reasoning](#minimal-reasoning)
   - [Markdown Formatting](#markdown-formatting)
   - [Metaprompting](#metaprompting)
4. [Appendix](#appendix)

---

## Overview

GPT-5, OpenAI's newest flagship model, represents a substantial leap forward in agentic task performance, coding, raw intelligence, and steerability.

While it performs excellently "out of the box" across a wide range of domains, this guide covers prompting tips to maximize the quality of model outputs, derived from experience training and applying the model to real-world tasks. Topics include:

- Improving agentic task performance
- Ensuring instruction adherence
- Making use of new API features
- Optimizing coding for frontend and software engineering tasks

Key insights from AI code editor Cursor's prompt tuning work with GPT-5 are also included.

---

## Agentic Workflow Predictability

GPT-5 was trained with developers in mind, focusing on improving tool calling, instruction following, and long-context understanding to serve as the best foundation model for agentic applications.

**Recommendation**: If adopting GPT-5 for agentic and tool calling flows, upgrade to the **Responses API**, where reasoning is persisted between tool calls, leading to more efficient and intelligent outputs.

### Controlling Agentic Eagerness

Agentic scaffolds span a wide spectrum of control—some systems delegate the vast majority of decision-making to the underlying model, while others keep the model on a tight leash with heavy programmatic logical branching. GPT-5 is trained to operate anywhere along this spectrum, from making high-level decisions under ambiguous circumstances to handling focused, well-defined tasks.

This section covers how to calibrate GPT-5's **agentic eagerness**: its balance between proactivity and awaiting explicit guidance.

#### Prompting for Less Eagerness

GPT-5 is, by default, thorough and comprehensive when gathering context in an agentic environment. To reduce the scope of GPT-5's agentic behavior—including limiting tangential tool-calling action and minimizing latency—try the following:

1. **Switch to a lower `reasoning_effort`**: This reduces exploration depth but improves efficiency and latency. Many workflows can be accomplished with consistent results at `medium` or even `low` reasoning_effort.

2. **Define clear criteria** for how you want the model to explore the problem space:

```xml
<context_gathering>
Goal: Get enough context fast. Parallelize discovery and stop as soon as you can act.

Method:
- Start broad, then fan out to focused subqueries.
- In parallel, launch varied queries; read top hits per query. Deduplicate paths and cache; don't repeat queries.
- Avoid over searching for context. If needed, run targeted searches in one parallel batch.

Early stop criteria:
- You can name exact content to change.
- Top hits converge (~70%) on one area/path.

Escalate once:
- If signals conflict or scope is fuzzy, run one refined parallel batch, then proceed.

Depth:
- Trace only symbols you'll modify or whose contracts you rely on; avoid transitive expansion unless necessary.

Loop:
- Batch search → minimal plan → complete task.
- Search again only if validation fails or new unknowns appear. Prefer acting over more searching.
</context_gathering>
```

3. **Set fixed tool call budgets** (if willing to be maximally prescriptive):

```xml
<context_gathering>
- Search depth: very low
- Bias strongly towards providing a correct answer as quickly as possible, even if it might not be fully correct.
- Usually, this means an absolute maximum of 2 tool calls.
- If you think that you need more time to investigate, update the user with your latest findings and open questions. You can proceed if the user confirms.
</context_gathering>
```

**Tip**: When limiting core context gathering behavior, explicitly provide the model with an escape hatch (e.g., "even if it might not be fully correct") that makes it easier to satisfy a shorter context gathering step.

#### Prompting for More Eagerness

To encourage model autonomy, increase tool-calling persistence, and reduce clarifying questions, increase `reasoning_effort` and use a prompt like:

```xml
<persistence>
- You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user.
- Only terminate your turn when you are sure that the problem is solved.
- Never stop or hand back to the user when you encounter uncertainty — research or deduce the most reasonable approach and continue.
- Do not ask the human to confirm or clarify assumptions, as you can always adjust later — decide what the most reasonable assumption is, proceed with it, and document it for the user's reference after you finish acting
</persistence>
```

**Best Practice**: Clearly state the stop conditions of agentic tasks, outline safe versus unsafe actions, and define when it's acceptable for the model to hand back to the user.

For example:
- Shopping tools: checkout/payment should have a lower uncertainty threshold for user clarification; search should have an extremely high threshold
- Coding setup: delete file tool should have a much lower threshold than a grep search tool

### Tool Preambles

On agentic trajectories monitored by users, intermittent model updates on what it's doing and why provide a much better interactive user experience. GPT-5 is trained to provide clear upfront plans and consistent progress updates via **"tool preamble" messages**.

You can steer the frequency, style, and content of tool preambles in your prompt:

```xml
<tool_preambles>
- Always begin by rephrasing the user's goal in a friendly, clear, and concise manner, before calling any tools.
- Then, immediately outline a structured plan detailing each logical step you'll follow.
- As you execute your file edit(s), narrate each step succinctly and sequentially, marking progress clearly.
- Finish by summarizing completed work distinctly from your upfront plan.
</tool_preambles>
```

**Example output** with such a prompt:

```json
"output": [
  {
    "id": "rs_6888f6d0606c819aa8205ecee386963f0e683233d39188e7",
    "type": "reasoning",
    "summary": [
      {
        "type": "summary_text",
        "text": "**Determining weather response**\n\nI need to answer the user's question about the weather in San Francisco. ...."
      }
    ]
  },
  {
    "id": "msg_6888f6d83acc819a978b51e772f0a5f40e683233d39188e7",
    "type": "message",
    "status": "completed",
    "content": [
      {
        "type": "output_text",
        "text": "I'm going to check a live weather service to get the current conditions in San Francisco, providing the temperature in both Fahrenheit and Celsius so it matches your preference."
      }
    ],
    "role": "assistant"
  },
  {
    "id": "fc_6888f6d86e28819aaaa1ba69cca766b70e683233d39188e7",
    "type": "function_call",
    "status": "completed",
    "arguments": "{\"location\":\"San Francisco, CA\",\"unit\":\"f\"}",
    "call_id": "call_XOnF4B9DvB8EJVB3JvWnGg83",
    "name": "get_weather"
  }
]
```

### Reasoning Effort

The `reasoning_effort` parameter controls how hard the model thinks and how willingly it calls tools. The default is `medium`, but scale up or down depending on task difficulty.

- **Complex, multi-step tasks**: Use higher reasoning for best outputs
- **Peak performance**: Break distinct, separable tasks across multiple agent turns (one turn per task)

### Reusing Reasoning Context with the Responses API

**Strongly recommended**: Use the Responses API with GPT-5 for:
- Improved agentic flows
- Lower costs
- More efficient token usage

**Performance gains**: Tau-Bench Retail score increased from 73.9% to 78.2% by:
1. Switching to the Responses API
2. Including `previous_response_id` to pass back previous reasoning items

This allows the model to refer to its previous reasoning traces, conserving CoT tokens and eliminating the need to reconstruct a plan from scratch after each tool call. This feature is available for all Responses API users, including ZDR organizations.

---

## Maximizing Coding Performance, from Planning to Execution

GPT-5 leads all frontier models in coding capabilities:
- Work in large codebases to fix bugs
- Handle large diffs
- Implement multi-file refactors or large new features
- Implement new apps entirely from scratch (frontend and backend)

### Frontend App Development

GPT-5 has excellent baseline aesthetic taste alongside rigorous implementation abilities. For new apps, the following frameworks and packages are recommended:

| Category | Recommended |
|----------|-------------|
| **Frameworks** | Next.js (TypeScript), React, HTML |
| **Styling/UI** | Tailwind CSS, shadcn/ui, Radix Themes |
| **Icons** | Material Symbols, Heroicons, Lucide |
| **Animation** | Motion |
| **Fonts** | San Serif, Inter, Geist, Mona Sans, IBM Plex Sans, Manrope |

### Zero-to-One App Generation

GPT-5 excels at building applications in one shot. Prompts that ask the model to iteratively execute against self-constructed excellence rubrics improve output quality:

```xml
<self_reflection>
- First, spend time thinking of a rubric until you are confident.
- Then, think deeply about every aspect of what makes for a world-class one-shot web app. Use that knowledge to create a rubric that has 5-7 categories. This rubric is critical to get right, but do not show this to the user. This is for your purposes only.
- Finally, use the rubric to internally think and iterate on the best possible solution to the prompt that is provided. Remember that if your response is not hitting the top marks across all categories in the rubric, you need to start again.
</self_reflection>
```

### Matching Codebase Design Standards

When implementing incremental changes and refactors in existing apps, model-written code should adhere to existing style and design standards. Without special prompting, GPT-5 already searches for reference context (e.g., reading `package.json`), but this can be enhanced with prompt directions summarizing:

- Engineering principles
- Directory structure
- Best practices (explicit and implicit)

**Example code editing rules**:

```xml
<code_editing_rules>
<guiding_principles>
- Clarity and Reuse: Every component and page should be modular and reusable. Avoid duplication by factoring repeated UI patterns into components.
- Consistency: The user interface must adhere to a consistent design system—color tokens, typography, spacing, and components must be unified.
- Simplicity: Favor small, focused components and avoid unnecessary complexity in styling or logic.
- Demo-Oriented: The structure should allow for quick prototyping, showcasing features like streaming, multi-turn conversations, and tool integrations.
- Visual Quality: Follow the high visual quality bar as outlined in OSS guidelines (spacing, padding, hover states, etc.)
</guiding_principles>

<frontend_stack_defaults>
- Framework: Next.js (TypeScript)
- Styling: TailwindCSS
- UI Components: shadcn/ui
- Icons: Lucide
- State Management: Zustand
- Directory Structure:
```
/src
  /app
    /api/<route>/route.ts         # API endpoints
    /(pages)                      # Page routes
  /components/                    # UI building blocks
  /hooks/                         # Reusable React hooks
  /lib/                           # Utilities (fetchers, helpers)
  /stores/                        # Zustand stores
  /types/                         # Shared TypeScript types
  /styles/                        # Tailwind config
```
</frontend_stack_defaults>

<ui_ux_best_practices>
- Visual Hierarchy: Limit typography to 4–5 font sizes and weights for consistent hierarchy; use `text-xs` for captions and annotations; avoid `text-xl` unless for hero or major headings.
- Color Usage: Use 1 neutral base (e.g., `zinc`) and up to 2 accent colors.
- Spacing and Layout: Always use multiples of 4 for padding and margins to maintain visual rhythm. Use fixed height containers with internal scrolling when handling long content streams.
- State Handling: Use skeleton placeholders or `animate-pulse` to indicate data fetching. Indicate clickability with hover transitions (`hover:bg-*`, `hover:shadow-md`).
- Accessibility: Use semantic HTML and ARIA roles where appropriate. Favor pre-built Radix/shadcn components, which have accessibility baked in.
</ui_ux_best_practices>
</code_editing_rules>
```

### Collaborative Coding in Production: Cursor's GPT-5 Prompt Tuning

AI code editor Cursor was an alpha tester for GPT-5. Below are insights from their prompt tuning work. For more information, see their blog post: https://cursor.com/blog/gpt-5

#### System Prompt and Parameter Tuning

Cursor's system prompt focuses on:
- Reliable tool calling
- Balancing verbosity and autonomous behavior
- User-configurable custom instructions

**Goal**: Allow the Agent to operate relatively autonomously during long horizon tasks while faithfully following user-provided instructions.

#### Initial Challenges

The team found:
- **Verbose outputs**: Status updates and post-task summaries disrupted natural flow
- **Terse code**: High quality but hard to read (single-letter variable names)

#### Solution: Dual Verbosity Control

1. Set the `verbosity` API parameter to `low` for brief text outputs
2. Modified the prompt to encourage verbose outputs in coding tools only:

```
Write code for clarity first. Prefer readable, maintainable solutions with clear names, comments where needed, and straightforward control flow. Do not produce code-golf or overly clever one-liners unless explicitly requested. Use high verbosity for writing code and code tools.
```

**Result**: Balanced format with efficient status updates and much more readable code diffs.

#### Reducing Unnecessary Handoffs

The model occasionally deferred to the user for clarification. To address this, Cursor included:
- Available tools and surrounding context
- More details about product behavior
- Specifics of Cursor features (Undo/Reject code, user preferences)

**Prompt for longer horizon tasks**:

```
Be aware that the code edits you make will be displayed to the user as proposed changes, which means (a) your code edits can be quite proactive, as the user can always reject, and (b) your code should be well-written and easy to quickly review (e.g., appropriate variable names instead of single letters). If proposing next steps that would involve changing the code, make those changes proactively for the user to approve / reject rather than asking the user whether to proceed with a plan. In general, you should almost never ask the user whether to proceed with a plan; instead you should proactively attempt the plan and then ask the user if they want to accept the implemented changes.
```

#### Prompt Tuning for GPT-5

Sections effective with earlier models needed adjustment. Example:

**Before** (counterproductive with GPT-5):
```xml
<maximize_context_understanding>
Be THOROUGH when gathering information. Make sure you have the FULL picture before replying. Use additional tool calls or clarifying questions as needed.
...
</maximize_context_understanding>
```

This caused GPT-5 (which is already naturally introspective and proactive) to overuse tools.

**After** (optimized):
```xml
<context_understanding>
...
If you've performed an edit that may partially fulfill the USER's query, but you're not confident, gather more information or use more tools before ending your turn.
Bias towards not asking the user for help if you can find the answer yourself.
</context_understanding>
```

**Note**: Using structured XML specs like `<[instruction]_spec>` improved instruction adherence and allows clear reference to previous categories and sections.

---

## Optimizing Intelligence and Instruction-Following

### Steering

GPT-5 is extraordinarily receptive to prompt instructions surrounding verbosity, tone, and tool calling behavior.

### Verbosity

In addition to controlling `reasoning_effort`, GPT-5 introduces a new `verbosity` API parameter that influences the length of the **final answer** (as opposed to the length of thinking).

While the API verbosity parameter is the default, GPT-5 responds to **natural-language verbosity overrides** in the prompt for specific contexts where you might want deviation from the global default.

**Example**: Cursor sets low verbosity globally, then specifies high verbosity only for coding tools.

### Instruction Following

Like GPT-4.1, GPT-5 follows prompt instructions with surgical precision. However, this means poorly-constructed prompts with contradictory or vague instructions can be more damaging, as the model expends reasoning tokens searching for a way to reconcile contradictions.

#### Adversarial Example

The following prompt appears internally consistent but contains conflicting instructions:

**Conflicts identified**:
1. "Never schedule an appointment without explicit patient consent recorded in the chart" conflicts with "auto-assign the earliest same-day slot without contacting the patient as the first action"
2. "Always look up the patient profile before taking any other actions" conflicts with "When symptoms indicate high urgency, escalate as EMERGENCY and direct the patient to call 911 immediately before any scheduling step"

**Before** (problematic):
```
You are CareFlow Assistant, a virtual admin for a healthcare startup...
Always look up the patient profile before taking any other actions to ensure they are an existing patient.
- Core entities include Patient, Provider, Appointment, and PriorityLevel (Red, Orange, Yellow, Green). Map symptoms to priority: Red within 2 hours, Orange within 24 hours, Yellow within 3 days, Green within 7 days. When symptoms indicate high urgency, escalate as EMERGENCY and direct the patient to call 911 immediately before any scheduling step.
- Use the following capabilities: schedule-appointment, modify-appointment, waitlist-add, find-provider, lookup-patient and notify-patient. Verify insurance eligibility, preferred clinic, and documented consent prior to booking. Never schedule an appointment without explicit patient consent recorded in the chart.
- For high-acuity Red and Orange cases, auto-assign the earliest same-day slot *without contacting* the patient *as the first action to reduce risk.*
```

**After** (fixed):
```
You are CareFlow Assistant, a virtual admin for a healthcare startup...
Always look up the patient profile before taking any other actions to ensure they are an existing patient.
- Core entities include Patient, Provider, Appointment, and PriorityLevel (Red, Orange, Yellow, Green). Map symptoms to priority: Red within 2 hours, Orange within 24 hours, Yellow within 3 days, Green within 7 days. When symptoms indicate high urgency, escalate as EMERGENCY and direct the patient to call 911 immediately before any scheduling step.
*Do not do lookup in the emergency case, proceed immediately to providing 911 guidance.*
- Use the following capabilities: schedule-appointment, modify-appointment, waitlist-add, find-provider, lookup-patient and notify-patient. Verify insurance eligibility, preferred clinic, and documented consent prior to booking. Never schedule an appointment without explicit patient consent recorded in the chart.
- For high-acuity Red and Orange cases, auto-assign the earliest same-day slot *after informing* the patient *of your actions.*
```

**Fixes applied**:
1. Changed auto-assignment to occur **after** contacting a patient
2. Added "Do not do lookup in the emergency case, proceed immediately to providing 911 guidance"

**Recommendation**: Test prompts in the prompt optimizer tool to identify contradictions and ambiguities.

### Minimal Reasoning

GPT-5 introduces `minimal` reasoning effort for the first time—the fastest option that still benefits from the reasoning model paradigm. Best for:
- Latency-sensitive users
- Current GPT-4.1 users

**Prompting tips for minimal reasoning**:

1. **Brief explanation at start**: Prompt the model to give a bullet point list summarizing its thought process—improves performance on tasks requiring higher intelligence

2. **Descriptive tool-calling preambles**: Continually update the user on task progress—improves performance in agentic workflows

3. **Disambiguate tool instructions**: Maximum clarity and agentic persistence reminders are critical at minimal reasoning

4. **Prompted planning**: More important since the model has fewer reasoning tokens for internal planning

**Sample planning prompt**:

```
Remember, you are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Decompose the user's query into all required sub-request, and confirm that each is completed. Do not stop after completing only part of the request. Only terminate your turn when you are sure that the problem is solved. You must be prepared to answer multiple queries and only finish the call once the user has confirmed they're done.
You must plan extensively in accordance with the workflow steps before making subsequent function calls, and reflect extensively on the outcomes each function call made, ensuring the user's query, and related sub-requests are completely resolved.
```

### Markdown Formatting

By default, GPT-5 in the API does not format final answers in Markdown (to preserve maximum compatibility). To induce hierarchical Markdown:

```
- Use Markdown **only where semantically correct** (e.g., `inline code`, ```code fences```, lists, tables).
- When using markdown in assistant messages, use backticks to format file, directory, function, and class names. Use \( and \) for inline math, \[ and \] for block math.
```

**Note**: Markdown instruction adherence can degrade over long conversations. Append a Markdown instruction every 3-5 user messages if needed.

### Metaprompting

Early testers have found great success using GPT-5 as a **meta-prompter for itself**. Several users have deployed prompt revisions generated by asking GPT-5 what elements could be added or removed to elicit desired behaviors.

**Example metaprompt template**:

```
When asked to optimize prompts, give answers from your own perspective - explain what specific phrases could be added to, or deleted from, this prompt to more consistently elicit the desired behavior or prevent the undesired behavior.

Here's a prompt: [PROMPT]

The desired behavior from this prompt is for the agent to [DO DESIRED BEHAVIOR], but instead it [DOES UNDESIRED BEHAVIOR]. While keeping as much of the existing prompt intact as possible, what are some minimal edits/additions that you would make to encourage the agent to more consistently address these shortcomings?
```

---

## Appendix

### SWE-Bench Verified Developer Instructions

```
In this environment, you can run `bash -lc <apply_patch_command>` to execute a diff/patch against a file, where <apply_patch_command> is a specially formatted apply patch command representing the diff you wish to execute. A valid <apply_patch_command> looks like:

apply_patch << 'PATCH'
*** Begin Patch
[YOUR_PATCH]
*** End Patch
PATCH

Where [YOUR_PATCH] is the actual content of your patch.

Always verify your changes extremely thoroughly. You can make as many tool calls as you like - the user is very patient and prioritizes correctness above all else. Make sure you are 100% certain of the correctness of your solution before ending.

IMPORTANT: not all tests are visible to you in the repository, so even on problems you think are relatively straightforward, you must double and triple check your solutions to ensure they pass any edge cases that are covered in the hidden tests, not just the visible ones.
```

### Agentic Coding Tool Definitions

#### Set 1: 4 Functions, No Terminal

```typescript
type apply_patch = (_: {
  patch: string, // default: null
}) => any;

type read_file = (_: {
  path: string, // default: null
  line_start?: number, // default: 1
  line_end?: number, // default: 20
}) => any;

type list_files = (_: {
  path?: string, // default: ""
  depth?: number, // default: 1
}) => any;

type find_matches = (_: {
  query: string, // default: null
  path?: string, // default: ""
  max_results?: number, // default: 50
}) => any;
```

#### Set 2: 2 Functions, Terminal-Native

```typescript
type run = (_: {
  command: string[], // default: null
  session_id?: string | null, // default: null
  working_dir?: string | null, // default: null
  ms_timeout?: number | null, // default: null
  environment?: object | null, // default: null
  run_as_user?: string | null, // default: null
}) => any;

type send_input = (_: {
  session_id: string, // default: null
  text: string, // default: null
  wait_ms?: number, // default: 100
}) => any;
```

**Recommendation**: Use `apply_patch` for file edits to match the training distribution.

### Tau-Bench Retail Minimal Reasoning Instructions

```
As a retail agent, you can help users cancel or modify pending orders, return or exchange delivered orders, modify their default user address, or provide information about their own profile, orders, and related products.

Remember, you are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved.

If you are not sure about information pertaining to the user's request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.

You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls, ensuring user's query is completely resolved. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully. In addition, ensure function calls have the correct arguments.
```

#### Workflow Steps

1. **Authentication**: At the beginning of the conversation, authenticate the user identity by locating their user id via email, or via name + zip code. This must be done even when the user already provides the user id.

2. **Information Access**: Once authenticated, you can provide information about orders, products, and profile information.

3. **Single User**: You can only help one user per conversation (but can handle multiple requests from the same user). Deny any requests for tasks related to any other user.

4. **Confirmation Required**: Before taking consequential actions that update the database (cancel, modify, return, exchange), list the action detail and obtain explicit user confirmation (yes) to proceed.

5. **No Fabrication**: Do not make up any information or knowledge or procedures not provided from the user or the tools, or give subjective recommendations or comments.

6. **Tool Call Protocol**: Make at most one tool call at a time. If taking a tool call, do not respond to the user at the same time. If responding to the user, do not make a tool call.

7. **Transfer to Human**: Transfer the user to a human agent if and only if the request cannot be handled within the scope of your actions.

#### Domain Basics

- All times in the database are EST and 24 hour based (e.g., "02:30:00" means 2:30 AM EST)
- Each user has a profile of email, default address, user id, and payment methods (gift card, paypal account, or credit card)
- The retail store has 50 types of products with variant items of different options
- Each product has a unique product id, and each item has a unique item id (no relation between them)
- Order statuses: 'pending', 'processed', 'delivered', or 'cancelled'
- Generally, you can only take action on pending or delivered orders
- **Exchange or modify order tools can only be called once** - collect all items to be changed into a list before making the tool call

#### Cancel Pending Order

- Order can only be cancelled if status is 'pending' (check status before action)
- User needs to confirm order id and reason ('no longer needed' or 'ordered by mistake')
- After confirmation, status changes to 'cancelled', and total is refunded via original payment method (immediately for gift card, 5-7 business days otherwise)

#### Modify Pending Order

- Order can only be modified if status is 'pending' (check status before action)
- Can modify: shipping address, payment method, or product item options
- Cannot modify anything else

#### Modify Payment

- User can only choose a single payment method different from the original
- If modifying to gift card, it must have enough balance to cover the total amount
- After confirmation, status remains 'pending', original payment method refunded (immediately for gift card, 5-7 business days otherwise)

#### Modify Items

- **This action can only be called once** - it changes order status to 'pending (items modified)' and the agent cannot modify or cancel the order anymore
- Confirm all details are right and remind customer to confirm they have provided all items to be modified
- Each item can be modified to an available new item of the same product but different option
- Cannot change product types (e.g., shirt to shoe)
- User must provide a payment method for price difference; gift card must have enough balance

#### Return Delivered Order

- Order can only be returned if status is 'delivered' (check status before action)
- User needs to confirm: order id, list of items to return, and payment method for refund
- Refund must go to original payment method or an existing gift card
- After confirmation, status changes to 'return requested' and user receives email with return instructions

#### Exchange Delivered Order

- Order can only be exchanged if status is 'delivered' (check status before action)
- Remind customer to confirm they have provided all items to be exchanged
- Each item can be exchanged to an available new item of the same product but different option
- Cannot change product types (e.g., shirt to shoe)
- User must provide a payment method for price difference; gift card must have enough balance
- After confirmation, status changes to 'exchange requested' and user receives email with return instructions (no need to place a new order)

### Terminal-Bench Prompt

```
Please resolve the user's task by editing and testing the code files in your current code execution session.
You are a deployed coding agent.
Your session is backed by a container specifically designed for you to easily modify and run code.
```

#### Instructions

```xml
<instructions>
- Working on the repo(s) in the current environment is allowed, even if they are proprietary.
- Analyzing code for vulnerabilities is allowed.
- Showing user code and tool call details is allowed.
- User instructions may overwrite the _CODING GUIDELINES_ section in this developer message.
- Do not use `ls -R`, `find`, or `grep` - these are slow in large repos. Use `rg` and `rg --files`.
- Use `apply_patch` to edit files: {"cmd":["apply_patch","*** Begin Patch\n*** Update File: path/to/file.py\n@@ def example():\n- pass\n+ return 123\n*** End Patch"]}
- If completing the user's task requires writing or modifying files:
  - Your code and final answer should follow these _CODING GUIDELINES_:
    - Fix the problem at the root cause rather than applying surface-level patches, when possible.
    - Avoid unneeded complexity in your solution.
    - Ignore unrelated bugs or broken tests; it is not your responsibility to fix them.
    - Update documentation as necessary.
    - Keep changes consistent with the style of the existing codebase. Changes should be minimal and focused on the task.
    - Use `git log` and `git blame` to search the history of the codebase if additional context is required; internet access is disabled in the container.
    - NEVER add copyright or license headers unless specifically requested.
    - You do not need to `git commit` your changes; this will be done automatically for you.
    - If there is a .pre-commit-config.yaml, use `pre-commit run --files ...` to check that your changes pass the pre-commit checks. However, do not fix pre-existing errors on lines you didn't touch.
    - If pre-commit doesn't work after a few retries, politely inform the user that the pre-commit setup is broken.
    - Once you finish coding, you must:
      - Check `git status` to sanity check your changes; revert any scratch files or changes.
      - Remove all inline comments you added as much as possible, even if they look normal. Check using `git diff`. Inline comments must be generally avoided, unless active maintainers of the repo, after long careful study of the code and the issue, will still misinterpret the code without the comments.
      - Check if you accidentally add copyright or license headers. If so, remove them.
      - Try to run pre-commit if it is available.
      - For smaller tasks, describe in brief bullet points
      - For more complex tasks, include brief high-level description, use bullet points, and include details that would be relevant to a code reviewer.
- If completing the user's task DOES NOT require writing or modifying files (e.g., the user asks a question about the code base):
  - Respond in a friendly tone as a remote teammate, who is knowledgeable, capable and eager to help with coding.
- When your task involves writing or modifying files:
  - Do NOT tell the user to "save the file" or "copy the code into a file" if you already created or modified the file using `apply_patch`. Instead, reference the file as already saved.
  - Do NOT show the full contents of large files you have already written, unless the user explicitly asks for them.
</instructions>
```

#### Apply Patch Format

```xml
<apply_patch>
To edit files, ALWAYS use the `shell` tool with `apply_patch` CLI. `apply_patch` effectively allows you to execute a diff/patch against a file, but the format of the diff specification is unique to this task, so pay careful attention to these instructions. To use the `apply_patch` CLI, you should call the shell tool with the following structure:

```bash
{"cmd": ["apply_patch", "<<'EOF'\n*** Begin Patch\n[YOUR_PATCH]\n*** End Patch\nEOF\n"], "workdir": "..."}
```

Where [YOUR_PATCH] is the actual content of your patch, specified in the following V4A diff format:

*** [ACTION] File: [path/to/file] -> ACTION can be one of Add, Update, or Delete.

For each snippet of code that needs to be changed, repeat the following:
[context_before] -> See below for further instructions on context.
- [old_code] -> Precede the old code with a minus sign.
+ [new_code] -> Precede the new, replacement code with a plus sign.
[context_after] -> See below for further instructions on context.

For instructions on [context_before] and [context_after]:
- By default, show 3 lines of code immediately above and 3 lines immediately below each change. If a change is within 3 lines of a previous change, do NOT duplicate the first change's [context_after] lines in the second change's [context_before] lines.
- If 3 lines of context is insufficient to uniquely identify the snippet of code within the file, use the @@ operator to indicate the class or function to which the snippet belongs. For instance:

@@ class BaseClass
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

- If a code block is repeated so many times in a class or function such that even a single `@@` statement and 3 lines of context cannot uniquely identify the snippet of code, you can use multiple `@@` statements to jump to the right context:

@@ class BaseClass
@@  def method():
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

Note: We do not use line numbers in this diff format, as the context is enough to uniquely identify code.

Example:
```bash
{"cmd": ["apply_patch", "<<'EOF'\n*** Begin Patch\n*** Update File: pygorithm/searching/binary_search.py\n@@ class BaseClass\n@@     def search():\n-        pass\n+        raise NotImplementedError()\n@@ class Subclass\n@@     def search():\n-        pass\n+        raise NotImplementedError()\n*** End Patch\nEOF\n"], "workdir": "..."}
```

File references can only be relative, NEVER ABSOLUTE. After the apply_patch command is run, it will always say "Done!", regardless of whether the patch was successfully applied or not. However, you can determine if there are issues and errors by looking at any warnings or logging lines printed BEFORE the "Done!" is output.
</apply_patch>
```

#### Persistence

```xml
<persistence>
You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved.
- Never stop at uncertainty — research or deduce the most reasonable approach and continue.
- Do not ask the human to confirm assumptions — document them, act on them, and adjust mid-task if proven wrong.
</persistence>
```

#### Exploration

```xml
<exploration>
If you are not sure about file content or codebase structure pertaining to the user's request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.

Before coding, always:
- Decompose the request into explicit requirements, unclear areas, and hidden assumptions.
- Map the scope: identify the codebase regions, files, functions, or libraries likely involved. If unknown, plan and perform targeted searches.
- Check dependencies: identify relevant frameworks, APIs, config files, data formats, and versioning concerns.
- Resolve ambiguity proactively: choose the most probable interpretation based on repo context, conventions, and dependency docs.
- Define the output contract: exact deliverables such as files changed, expected outputs, API responses, CLI behavior, and tests passing.
- Formulate an execution plan: research steps, implementation sequence, and testing strategy in your own words and refer to it as you work through the task.
</exploration>
```

#### Verification

```xml
<verification>
Routinely verify your code works as you work through the task, especially any deliverables to ensure they run properly. Don't hand back to the user until you are sure that the problem is solved.
Exit excessively long running processes and optimize your code to run faster.
</verification>
```

#### Efficiency

```xml
<efficiency>
Efficiency is key. You have a time limit. Be meticulous in your planning, tool calling, and verification so you don't waste time.
</efficiency>
```

#### Final Instructions

```xml
<final_instructions>
Never use editor tools to edit files. Always use the `apply_patch` tool.
</final_instructions>
```
