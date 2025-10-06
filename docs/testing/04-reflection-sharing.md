# Test Case 04: Reflection Sharing

**Priority**: 4 (MEDIUM - Secondary Feature)  
**Estimated Time**: 10-15 minutes  
**Prerequisites**: Tests 01-03 PASSED  
**Test User**: test1@example.com (password: test123)

---

## Objective

Verify that users can share journal reflections to the community feed with proper metadata, including reflection type, mood, and key insights.

---

## Test Setup

### Before Starting
- [ ] Tests 01-03 have PASSED
- [ ] User has community enabled
- [ ] Reflections feature is accessible
- [ ] Development server running

---

## Test Steps

### Step 1: Navigate to Reflections Page

**Actions**:
1. Navigate to http://localhost:3001/reflections

**Expected Results**:
- ✅ Reflections page loads successfully
- ✅ Can see list of past reflections (if any)
- ✅ "New Reflection" or create button visible

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```

```

---

### Step 2: Create Morning Reflection

**Actions**:
1. Click "New Reflection" or similar
2. Select "Morning" reflection type
3. Fill out morning reflection fields:
   - Intention: "Practice patience in difficult conversations"
   - Challenges: "Meeting with demanding client"
   - Mood (before): 6/10
   - Virtue focus: Select "Temperance"
4. Save the reflection

**Expected Results**:
- ✅ Form accepts all inputs
- ✅ Reflection saves successfully
- ✅ Success message/toast appears
- ✅ Reflection appears in list
- ✅ Share button visible on reflection card

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Reflection ID: 
```

---

### Step 3: Locate Share Button on Reflection

**Actions**:
1. Find the newly created reflection in the list
2. Locate share button/icon

**Expected Results**:
- ✅ Share button clearly visible
- ✅ Button enabled and clickable
- ✅ Icon/label indicates community sharing

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 4: Click Share on Reflection

**Actions**:
1. Click share button on the reflection

**Expected Results**:
- ✅ SharePreviewModal opens
- ✅ Modal shows reflection content preview
- ✅ Reflection type indicated (Morning)
- ✅ Intention displayed in preview
- ✅ Mood shown (if applicable)
- ✅ Virtue focus visible

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Preview Content:
```

---

### Step 5: Add Context Note

**Actions**:
1. Add optional note: "Starting my day with clear intentions"
2. Review preview

**Expected Results**:
- ✅ Note field works correctly
- ✅ Character count updates
- ✅ Preview updates with note

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 6: Share Reflection to Community

**Actions**:
1. Click "Share" button
2. Wait for completion

**Expected Results**:
- ✅ Loading state appears
- ✅ Success message shows
- ✅ Modal closes
- ✅ No console errors

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 7: Verify Post in Community Feed

**Actions**:
1. Navigate to /community
2. Find the reflection post

**Expected Results**:
- ✅ Post appears in feed
- ✅ Shows as "Morning Reflection"
- ✅ Displays intention text
- ✅ Shows virtue focus badge/tag
- ✅ Mood indicator visible (if implemented)
- ✅ Context note appears
- ✅ Proper formatting and styling

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Post Appearance:
```

---

### Step 8: Create Evening Reflection

**Actions**:
1. Return to /reflections
2. Create Evening reflection:
   - What went well: "Successfully navigated difficult conversation"
   - Challenges: "Felt rushed during afternoon"
   - Lessons learned: "Patience pays off"
   - Gratitude: "Supportive team"
   - Mood (after): 8/10

**Expected Results**:
- ✅ Evening reflection saves
- ✅ Different fields than morning
- ✅ Share button available

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 9: Share Evening Reflection

**Actions**:
1. Share the evening reflection
2. Add note: "Grateful for growth today"
3. Submit to community

**Expected Results**:
- ✅ Modal shows evening-specific content
- ✅ Wins/gratitude displayed
- ✅ Posts successfully to feed
- ✅ Feed shows "Evening Reflection" type

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 10: Test Reflection Metadata

**Actions**:
1. Inspect network request when sharing
2. Check content_metadata structure

**Expected Results**:
- ✅ `content_type: "reflection"`
- ✅ `content_metadata.reflection_type: "morning"` or `"evening"`
- ✅ `content_metadata.summary` or relevant fields
- ✅ `content_metadata.mood` included
- ✅ `content_metadata.highlights` array (for evening)

**Test Result**: [ ] PASS / [ ] FAIL

**Metadata Sample**:
```json
{
  "content_type": "reflection",
  "content_metadata": {
    "reflection_type": "",
    "summary": "",
    "mood": ,
    "highlights": []
  }
}
```

---

## Edge Cases

### Test: Share Reflection Without Optional Fields

**Actions**: Create minimal reflection, share it

**Expected**:
- ✅ Shares successfully even with missing fields
- ✅ No undefined/null in UI

**Result**: [ ] PASS / [ ] FAIL

---

### Test: Share Same Reflection Twice

**Actions**: Try sharing the same reflection again

**Expected**:
- ✅ Either allows duplicate OR shows warning
- ✅ No crash or errors

**Result**: [ ] PASS / [ ] FAIL

---

## Console Error Check

**Errors Found**: [ ] YES / [ ] NO

**Details**:
```

```

---

## Test Summary

**Overall Result**: [ ] PASS / [ ] PASS WITH WARNINGS / [ ] FAIL

**Steps Passed**: ___ / 10

**Critical Issues**:
1. 

**Minor Issues**:
1. 

---

## Test Metadata

**Tested By**: ________________  
**Date**: ________________  
**Browser**: ________________

---

## Next Steps

✅ **If PASS**: Proceed to [05-today-widget.md](./05-today-widget.md)  
❌ **If FAIL**: Fix issues before proceeding
