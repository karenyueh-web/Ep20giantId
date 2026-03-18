---
description: 存檔 (Save to GitHub)
---
When the user uses the `[存檔]` command, your goal is to save the latest code version and push it to GitHub. Follow these steps exactly:

// turbo-all
1. Stage all changes by running: `git add .`
2. Commit the changes. If the user provided a commit message with the command, use it. Otherwise, use a default message: `git commit -m "Auto-commit [存檔]"`
3. Push to the remote repository: `git push origin main`

Wait for each command to finish successfully before proceeding with the next one. After pushing, strictly report the success status back to the user.
