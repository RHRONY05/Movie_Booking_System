---
name: handoff
description: Generates a lightweight state summary to hand off the project to another AI agent (like Cursor or Claude Code).
---

# /handoff Workflow

When the user triggers this skill (e.g. by typing `/handoff`), you must execute the following steps:

1. **Synthesize Current State:** Analyze the exact, immediate state of the conversation. What file were we just editing? What bug were we just trying to fix? What was the very last thing the user asked for?
2. **Generate Handoff File:** Overwrite (or create) a file named `d:\Projects\Movie_Booking_System\HANDOFF.md` in the project root with the following format:
   ```markdown
   # AI Agent Handoff Document
   *Generated on: [Current Date/Time]*

   **Dear AI Agent,**
   You are taking over this workspace. Please read the core architecture and macro-progress documents first. They are located in:
   1. `.agents/project_plan.md`
   2. `.agents/learning_roadmap.md`

   ## Immediate Context (Where we left off)
   - **Current Focus:** [Briefly describe the exact task we were doing right before handoff]
   - **Recent Files Modified:** [List 1-3 files we just touched]
   - **Current Blockers/Bugs:** [Describe any error messages or logical bugs we were stuck on, or write "None"]
   - **Next Immediate Action required by you:** [Tell the new agent exactly what to do first]
   ```
3. **Notify User:** Inform the user that the `HANDOFF.md` file has been generated in the project root and is ready to be read by their other AI tool. Remind them they can safely close this session.
