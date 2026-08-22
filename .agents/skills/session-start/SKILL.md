---
name: session-start
description: Initializes a new work session by reading project context and reporting the next task.
---

# /session-start Workflow

When the user triggers this skill (e.g. by typing `/session-start`), you must execute the following steps in order:

1. **Read Context:** Silently use the `view_file` tool to read `d:\Projects\Movie_Booking_System\.agents\learning_roadmap.md` and `d:\Projects\Movie_Booking_System\.agents\project_plan.md` to understand the architecture and current progress.
2. **Identify Status:** Look at the "Current Project Context & Status" section and the checkboxes in the roadmap to determine exactly what was completed last and what the next `[ ]` (Not started) or `[/]` (In progress) item is.
3. **Report to User:** Send a friendly greeting to the user summarizing:
   - What phase we are currently in.
   - The last thing that was accomplished.
   - The exact next step we are about to tackle.
4. **Ask to Proceed:** Ask the user if they are ready to begin that next step. Do not execute the step until they say yes.
