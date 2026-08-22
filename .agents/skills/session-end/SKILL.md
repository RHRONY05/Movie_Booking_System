---
name: session-end
description: Finalizes the current work session by logging progress, updating the roadmap, and summarizing next steps.
---

# /session-end Workflow

When the user triggers this skill (e.g. by typing `/session-end`), you must execute the following steps in order:

1. **Verify Context:** Ensure you know what was accomplished in the current session. If necessary, quickly review the chat history.
2. **Update Roadmap:** Use a file editing tool to update the checkboxes `[ ]`, `[/]`, `[x]` in `d:\Projects\Movie_Booking_System\.agents\learning_roadmap.md` to accurately reflect where we stopped. Update the "Current Project Context & Status" section at the top of the roadmap.
3. **Generate Log Entry:** Append a new entry to `d:\Projects\Movie_Booking_System\Notes\session_logs.md` (create the file if it does not exist) with the current date. Format it as follows:
   ```markdown
   ## [Date] Session Log
   - **What was built:** [Summary of code/architecture changes]
   - **What was taught/learned:** [Summary of concepts explained to the user]
   - **Status/Pending:** [What was left unfinished or needs review]
   - **Open Questions:** [Any questions for the user to think about before next time]
   ```
4. **Farewell:** Send a friendly sign-off message to the user, confirming that the logs and roadmap have been updated and they are safe to close the chat.
