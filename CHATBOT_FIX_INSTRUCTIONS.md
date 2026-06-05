# Fix Chatbot Syntax Error on Live Site

## Problem
The file `js/chatbot-widget.js` on the main branch has duplicate/corrupted code causing:
```
chatbot-widget.js:50 Uncaught SyntaxError: Unexpected token '*'
```

## Solution
Replace the corrupted file on GitHub with the clean version.

## Option 1: Manual Fix via GitHub Web UI (FASTEST)

1. Go to: https://github.com/kenmck3772/welltegra.network/blob/main/js/chatbot-widget.js

2. Click the **Edit** button (pencil icon)

3. **Select all** and **delete** the existing content

4. Copy the clean version from our feature branch:
   https://github.com/kenmck3772/welltegra.network/blob/claude/explain-codebase-mjdlzvi37t0e39vz-gJpaR/js/chatbot-widget.js

5. **Paste** the clean version (383 lines)

6. Commit with message: "Fix syntax error - remove duplicate code blocks"

7. Wait 1-2 minutes for GitHub Pages to rebuild

8. Test: https://welltegra.network

## Option 2: Create Pull Request

1. Go to: https://github.com/kenmck3772/welltegra.network/pull/new/claude/explain-codebase-mjdlzvi37t0e39vz-gJpaR

2. Create PR titled: "Fix chatbot syntax error and add custom avatar"

3. Review changes showing clean 383-line file

4. Merge PR

## What's Fixed

✅ **Removed duplicate IIFE blocks**
✅ **Single clean implementation (383 lines)**
✅ **Custom bot avatar (brahanbot.png)**
✅ **Proper syntax - passes Node.js validation**
✅ **All three pages integrated (index, planner, equipment)**

## File Stats
- **Clean version**: 383 lines
- **Only one** `(function() {` block at line 6
- **Properly closed** with `})();` at end
- **Syntax validated** ✅
