# Test Case 06: Practice Milestone Sharing

**Priority**: 6 (LOW - Auto-Triggered Feature)  
**Estimated Time**: 15-20 minutes  
**Prerequisites**: Tests 01-05 PASSED  
**Test User**: test3@example.com (password: test123)

---

## Objective

Verify that completing practice milestones (7-day, 30-day streaks) triggers automatic share prompts and creates celebration posts in the community feed.

---

## ⚠️ Implementation Status

**NOTE**: This feature may not be fully implemented yet. This test document serves as a specification for expected behavior and will verify graceful degradation if not implemented.

---

## Test Setup

### Before Starting
- [ ] Tests 01-05 have PASSED
- [ ] Fresh user account or reset practice history
- [ ] Development server running

### What to Test
- [ ] Milestone detection logic
- [ ] Auto-prompt appearance
- [ ] Celebration post format
- [ ] Graceful handling if not implemented

---

## Test Steps

### Step 1: Create a New Practice

**Actions**:
1. Login as test3@example.com
2. Navigate to /practices
3. Create new practice:
   - Name: "Morning Meditation"
   - Virtue: Wisdom
   - Frequency: Daily
4. Save practice

**Expected Results**:
- ✅ Practice created successfully
- ✅ No errors

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 2: Complete Practice Multiple Times

**Actions**:
1. Mark practice as complete for today
2. Check if counter/streak starts

**Expected Results**:
- ✅ Practice marked complete
- ✅ Streak counter visible (if implemented)
- ✅ First completion recorded

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 3: Simulate 7-Day Streak

**Actions**:
1. Use browser DevTools or admin panel to:
   - Create habit_logs for past 7 consecutive days
   - OR complete practice 7 times with date manipulation
2. Complete practice for 7th day

**Expected Results**:
- ✅ System detects 7-day milestone
- ✅ Share prompt appears (modal/toast/banner)
- ✅ Prompt says "Celebrate your 7-day streak!" or similar
- ✅ Option to share or dismiss

**Test Result**: [ ] PASS / [ ] FAIL / [ ] NOT IMPLEMENTED

**Notes**:
```
Milestone Detection: 
Prompt Type: 
Message: 
```

---

### Step 4: Accept Milestone Share Prompt

**Actions**:
1. Click "Share" or "Celebrate" button on prompt

**Expected Results**:
- ✅ SharePreviewModal opens
- ✅ Pre-filled content shows:
  - "7-day streak achieved!"
  - Practice name
  - Encouraging message
- ✅ Can add optional personal note
- ✅ "Share to Community" button available

**Test Result**: [ ] PASS / [ ] FAIL / [ ] NOT IMPLEMENTED

---

### Step 5: Share Milestone Celebration

**Actions**:
1. Add note: "Consistency is key! Feeling proud."
2. Click share button

**Expected Results**:
- ✅ Post created successfully
- ✅ Success feedback shown
- ✅ Modal closes

**Test Result**: [ ] PASS / [ ] FAIL / [ ] NOT IMPLEMENTED

---

### Step 6: Verify Milestone Post in Feed

**Actions**:
1. Navigate to /community
2. Find the milestone post

**Expected Results**:
- ✅ Post appears with special milestone badge/icon
- ✅ Shows "7-Day Streak" or similar
- ✅ Practice name displayed
- ✅ Personal note included
- ✅ Celebratory tone in formatting
- ✅ Different styling from regular posts (optional)

**Test Result**: [ ] PASS / [ ] FAIL / [ ] NOT IMPLEMENTED

**Post Appearance**:
```
Title/Badge: 
Content: 
Special Styling: 
```

---

### Step 7: Test Dismissing Milestone Prompt

**Actions**:
1. Trigger another milestone (or use same one again)
2. Click "Dismiss" or "Not Now" on prompt

**Expected Results**:
- ✅ Prompt closes without sharing
- ✅ No post created
- ✅ Can trigger prompt again later (if applicable)
- ✅ Milestone still recorded in user data

**Test Result**: [ ] PASS / [ ] FAIL / [ ] NOT IMPLEMENTED

---

### Step 8: Test 30-Day Milestone

**Actions**:
1. Simulate 30 consecutive completions
2. Complete practice on 30th day

**Expected Results**:
- ✅ More prominent celebration (bigger badge, different message)
- ✅ Share prompt offers special message
- ✅ Post in feed has enhanced styling
- ✅ Milestone type clearly indicated

**Test Result**: [ ] PASS / [ ] FAIL / [ ] NOT IMPLEMENTED

---

### Step 9: Test Milestone with Community Disabled

**Actions**:
1. Disable community features
2. Complete milestone

**Expected Results**:
- ✅ Milestone detected and celebrated locally
- ✅ No share prompt appears
- ✅ Celebration shown in practices page
- ✅ No errors or broken prompts

**Test Result**: [ ] PASS / [ ] FAIL / [ ] NOT IMPLEMENTED

---

### Step 10: Verify Milestone Metadata

**Actions**:
1. Inspect network request for milestone post
2. Check content_metadata structure

**Expected Results**:
- ✅ `content_type: "practice_milestone"`
- ✅ `content_metadata.milestone_type: "7_day"` or `"30_day"`
- ✅ `content_metadata.practice_name`
- ✅ `content_metadata.practice_virtue`
- ✅ `content_metadata.streak_count`

**Test Result**: [ ] PASS / [ ] FAIL / [ ] NOT IMPLEMENTED

**Metadata Sample**:
```json
{
  "content_type": "practice_milestone",
  "content_metadata": {
    "milestone_type": "",
    "practice_name": "",
    "practice_virtue": "",
    "streak_count": ,
    "achievement_date": ""
  }
}
```

---

## Graceful Degradation Test

### If Feature Not Implemented

**Actions**: Complete milestones without share functionality

**Expected**:
- ✅ No crashes or errors
- ✅ Milestones still tracked internally
- ✅ User can manually share if desired
- ✅ Feature flag or placeholder handles gracefully

**Result**: [ ] PASS / [ ] FAIL / [ ] FEATURE IMPLEMENTED

---

## Console Error Check

**Errors Found**: [ ] YES / [ ] NO

**Details**:
```

```

---

## Test Summary

**Overall Result**: [ ] PASS / [ ] PASS WITH WARNINGS / [ ] FAIL / [ ] NOT IMPLEMENTED

**Steps Passed**: ___ / 10

**Implementation Status**:
- [ ] Fully implemented
- [ ] Partially implemented
- [ ] Not yet implemented
- [ ] Planned for future release

**Critical Issues**:
1. 

**Recommendations**:
```
[Suggestions for milestone feature implementation or improvements]
```

---

## Test Metadata

**Tested By**: ________________  
**Date**: ________________  
**Browser**: ________________  
**Milestone Types Tested**: [ ] 7-day [ ] 30-day [ ] Other

---

## Next Steps

✅ **If PASS/NOT IMPLEMENTED**: Proceed to [07-state-sync.md](./07-state-sync.md)  
❌ **If FAIL**: Fix critical issues before proceeding
