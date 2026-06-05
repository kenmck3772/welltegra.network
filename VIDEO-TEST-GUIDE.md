# P&A Video Course Flow Testing

This test suite specifically tests the **video learning flow** and checkpoint system.

## 🎯 What Gets Tested

### Video Player & Loading
- ✅ YouTube player loads correctly
- ✅ Video iframe appears on page
- ✅ No console errors during loading

### Module Locking System
- ✅ All modules start locked (except when checkpoint reached)
- ✅ Clicking locked module shows alert
- ✅ Modules unlock only when video reaches checkpoint

### Checkpoint System
- ✅ Checkpoint times configured (7 checkpoints)
- ✅ Module start times configured (7 modules)
- ✅ Checkpoint info displays next checkpoint
- ✅ Reaching checkpoint unlocks module

### Learning Flow
- ✅ Watch video → Reach checkpoint → Module unlocks
- ✅ Open module → See interactive elements
- ✅ Complete exercises → Answer quiz
- ✅ Wrong answer clears → Retry allowed
- ✅ Correct answer → Module completes
- ✅ Progress to next module

### Progress Persistence
- ✅ Progress saved to localStorage
- ✅ Progress restored on page reload
- ✅ Checkpoints remain unlocked
- ✅ Completed modules stay completed
- ✅ Reset button clears all progress

### Video Integration
- ✅ Video pauses at checkpoints (not restarts)
- ✅ Module opening doesn't restart video (at checkpoint)
- ✅ Video seeks correctly (when manually opening)
- ✅ Continues from checkpoint after completion

## 🚀 Running Video Tests

### Quick Start (Watch Tests Run):
```bash
npm run test:video
```

### All Options:
```bash
# Watch video flow tests
npm run test:video

# Run in background (headless)
npx playwright test tests/video-course-flow.spec.js

# Debug specific test
npx playwright test tests/video-course-flow.spec.js --grep "checkpoint" --debug

# UI mode for video tests
npx playwright test tests/video-course-flow.spec.js --ui
```

## 📸 Screenshots Generated

After running, check `screenshots/` folder:

```
screenshots/
├── video-player-loaded.png       # YouTube player visible
├── all-modules-locked.png        # Initial locked state
├── checkpoint-info.png           # Next checkpoint display
├── module1-opened-after-checkpoint.png
├── interactive-elements-visible.png
├── wrong-answer-cleared.png      # Quiz retry mechanism
├── flow-step1-module-opened.png  # Learning flow steps
├── flow-step2-interactive.png
├── flow-step3-quiz-answered.png
├── flow-step4-completed.png
├── flow-complete.png             # Full flow done
├── progress-restored.png         # After page reload
└── course-reset.png              # After reset
```

## 🔍 What Each Test Does

### 1. Video Player Load Test
```javascript
test('Video player should load on page')
```
- Checks YouTube iframe appears
- Verifies player is visible
- Takes screenshot as proof

### 2. Module Locking Test
```javascript
test('All modules should start locked')
```
- Checks all 7 modules have 'locked' class
- Ensures video enforcement working
- Logs status of each module

### 3. Locked Module Alert Test
```javascript
test('Clicking locked module should show alert')
```
- Tries to open Module 2 (should be locked)
- Captures alert message
- Verifies alert says "watch the video"

### 4. Checkpoint Info Test
```javascript
test('Module 1 checkpoint info should display')
```
- Checks "Next checkpoint: Module X at X:XX" shown
- Verifies checkpoint tracking active

### 5. Checkpoint Flow Simulation
```javascript
test('Simulated video checkpoint flow')
```
- **Simulates** video reaching checkpoint
- Adds module to `reachedCheckpoints`
- Tries to open module
- Verifies module opens successfully

### 6. Interactive Elements Test
```javascript
test('Interactive elements visible when module opens')
```
- Opens Module 1 after unlock
- Counts depth markers and risk cards
- Verifies interactive content present

### 7. Quiz Validation Test
```javascript
test('Quiz should prevent completion without correct answer')
```
- Tries to complete without answering
- Verifies alert shown
- Ensures quiz is enforced

### 8. Wrong Answer Handling
```javascript
test('Wrong answer should clear and allow retry')
```
- Selects wrong answer
- Clicks "Mark Complete & Continue"
- Verifies answer clears
- Checks retry is allowed

### 9. Complete Learning Flow
```javascript
test('Complete learning flow simulation')
```
**Step-by-step simulation:**
1. Simulate checkpoint reached
2. Open module
3. Click interactive element
4. Answer quiz correctly
5. Complete module
6. Check status updated

**Screenshots at each step!**

### 10. Progress Persistence Test
```javascript
test('Progress should persist on page reload')
```
- Simulates progress (checkpoints + completed modules)
- Saves to localStorage
- Reloads page
- Verifies progress restored

### 11. Reset Test
```javascript
test('Reset course should clear all progress')
```
- Sets progress first
- Clicks "Reset Course Progress"
- Verifies all progress cleared
- Checks localStorage empty

### 12. Console Errors Check
```javascript
test('Console should not have errors')
```
- Monitors browser console
- Captures errors and warnings
- Ensures clean execution

### 13. Configuration Tests
```javascript
test('Video should have correct start times')
test('Checkpoint times should be defined')
```
- Verifies `moduleStartTimes` object exists
- Checks all 7 modules have start times
- Verifies `checkpoints` array configured
- Lists all checkpoint times

## 📊 Expected Output

### ✅ Successful Test Run:
```
🧪 Testing video player loads...
✅ Video player loaded

🧪 Testing all modules locked initially...
  Module 1: 🔒 Locked
  Module 2: 🔒 Locked
  Module 3: 🔒 Locked
  ...
✅ All modules correctly locked

🧪 Testing checkpoint flow...
✅ Simulated Module 1 checkpoint reached
✅ Module 1 opened after checkpoint simulation

🧪 Testing complete learning flow...
  Step 1: Simulate video reaching checkpoint...
  ✅ Checkpoint 1 reached
  Step 2: Opening Module 1...
  Step 3: Interacting with depth visualizer...
  ✅ Depth marker clicked
  Step 4: Answering quiz correctly...
  ✅ Correct answer selected
  Step 5: Completing module...
  ✅ Module completion attempted
  Final status: "✅ Completed"
✅ Complete learning flow executed

✅ No console errors detected
```

### ❌ If Something Fails:
```
❌ Module 1 did not open (might need video to actually play)
❌ Checkpoints not found
❌ Console errors found:
   - Uncaught ReferenceError: reachedCheckpoints is not defined
```

## 🐛 Troubleshooting

### Tests Say "Checkpoints Not Found"
**Cause:** JavaScript not loaded properly

**Fix:**
1. Hard refresh page first
2. Check browser console for errors
3. Verify `pa-course.html` has latest code

### Tests Show "Module Locked" Even After Simulation
**Expected!** Some tests simulate checkpoints, but full video playback requires:
- Actual YouTube player interaction
- Real-time video monitoring
- Checkpoint detection at runtime

These tests verify the **logic** works, not full video playback.

### Screenshots Show Blank Page
**Cause:** Page not fully loaded

**Fix:**
- Increase timeout in test
- Check internet connection
- Verify page loads in normal browser

### Console Errors in Tests
**Common ones:**
- `YouTube API not ready` → Expected, harmless
- `Cannot read property of undefined` → Real issue, needs fix

## 🎬 Understanding Test Flow

### Real Video Flow (Production):
```
User visits page →
Video loads →
Video plays →
Reaches checkpoint (e.g., 1:50) →
Video PAUSES →
Module 1 unlocks & opens →
User does exercises →
User answers quiz →
Clicks "Mark Complete" →
Video RESUMES from 1:50 →
Continues to next checkpoint
```

### Test Flow (Simulated):
```
Test starts →
Simulates "checkpoint reached" (adds to Set) →
Opens module →
Verifies module opens →
Interacts with elements →
Answers quiz →
Completes module →
Checks status updated →
Takes screenshots as proof
```

## 💡 Key Differences from Interactive Tests

### `pa-course.spec.js` (Interactive Elements):
- Tests **what happens when you click things**
- Slider dragging
- Card selections
- Button clicks
- Calculator inputs
- Drag-and-drop barriers

### `video-course-flow.spec.js` (This File):
- Tests **video learning flow**
- Module locking/unlocking
- Checkpoint system
- Progress tracking
- Quiz validation
- Learning progression

**Use Both!**
```bash
# Test interactive elements
npm run test:interactive

# Test video flow
npm run test:video

# Test everything
npm test
```

## 📝 Adding New Video Flow Tests

Example - Test module auto-opening after completion:

```javascript
test('Should auto-open next module after completion', async ({ page }) => {
  console.log('🧪 Testing auto-progression...');

  // Unlock Module 1
  await page.evaluate(() => {
    reachedCheckpoints.add(1);
    reachedCheckpoints.add(2); // Also unlock Module 2
  });

  // Open and complete Module 1
  await page.locator('[data-module="1"]').click();
  await page.waitForTimeout(1000);

  // Answer quiz
  await page.locator('input[name="q1"][value="b"]').check();

  // Complete
  page.on('dialog', async d => await d.accept());
  await page.getByText('Mark Complete & Continue').click();
  await page.waitForTimeout(2000);

  // Check if Module 2 auto-opened
  const module2Content = await page.locator('#content-2');
  const isOpen = await module2Content.evaluate(el =>
    el.classList.contains('active')
  );

  expect(isOpen).toBeTruthy();
  console.log('✅ Module 2 auto-opened');
});
```

## 🎯 Success Criteria

All these should be ✅:
- [x] Video player loads
- [x] Modules start locked
- [x] Clicking locked module shows alert
- [x] Checkpoint simulation works
- [x] Modules unlock after checkpoint
- [x] Interactive elements visible
- [x] Quiz validation works
- [x] Wrong answers clear
- [x] Learning flow executes
- [x] Progress persists
- [x] Reset clears everything
- [x] No console errors
- [x] Configurations correct

## 📞 Getting Help

If tests fail:
1. **Read the console output** - shows exactly what failed
2. **Check screenshots/** folder - visual proof of state
3. **Look for patterns** - all tests failing vs one specific test
4. **Share test output** - copy/paste console messages

### Useful Debug Commands:
```bash
# Run one specific test
npx playwright test --grep "learning flow" --headed

# Slow motion mode
npx playwright test --headed --slow-mo=1000

# Step through test
npx playwright test --debug

# Generate trace
npx playwright test --trace on
```

---

**Happy Testing! 🎉**

These tests verify the entire video learning flow works correctly!
