# Test Case 08: Display Name Validation

**Priority**: Edge Case Testing  
**Estimated Time**: 10-15 minutes  
**Prerequisites**: Tests 01-07 completed  
**Test User**: test6@example.com (password: test123)

---

## Objective

Verify that display name validation enforces uniqueness, character limits, format rules, and provides clear error feedback during community onboarding and profile updates.

---

## Test Setup

### Before Starting
- [ ] Previous tests completed
- [ ] User test6 has community disabled initially
- [ ] Known existing display names to test:
  - "StoicSeeker" (test1)
  - "MindfulWanderer" (test3)
  - "PhilosophyEnthusiast" (test5)

---

## Test Steps

### Step 1: Test Duplicate Display Name

**Actions**:
1. Login as test6@example.com
2. Navigate to Settings → Community
3. Enable community
4. Enter display name: "StoicSeeker"
5. Submit

**Expected Results**:
- ✅ Error message appears: "Display name already taken"
- ✅ Form doesn't submit
- ✅ Community remains disabled
- ✅ No database update
- ✅ Error styling on input field

**Test Result**: [ ] PASS / [ ] FAIL

**Error Message**:
```

```

---

### Step 2: Test Case Sensitivity

**Actions**:
1. Try: "stoicseeker" (lowercase)

**Expected Results**:
- ✅ Should also be rejected (case-insensitive check)
- ✅ Error: "Display name already taken"

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 3: Test Character Limit - Too Short

**Actions**:
1. Enter: "AB" (2 characters)

**Expected Results**:
- ✅ Error: "Display name must be at least 3 characters"
- ✅ Form validation prevents submit
- ✅ Real-time error shown

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 4: Test Character Limit - Too Long

**Actions**:
1. Enter: "ThisIsAVeryLongDisplayNameThatExceedsTheMaximumAllowedLength" (50+ chars)

**Expected Results**:
- ✅ Error: "Display name must be 30 characters or less"
- ✅ Input may truncate or show max length indicator
- ✅ Cannot submit

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 5: Test Special Characters - Invalid

**Actions**:
Try each of these:
1. "Test@User" (@ symbol)
2. "User#123" (# symbol)
3. "Name$pecial" ($ symbol)
4. "User<>Name" (< > symbols)

**Expected Results**:
- ✅ Error: "Display name can only contain letters, numbers, and underscores"
- ✅ All special chars rejected except underscore
- ✅ Clear validation message

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Allowed Characters: 
Rejected Characters: 
```

---

### Step 6: Test Special Characters - Valid

**Actions**:
Try valid formats:
1. "Test_User" (underscore)
2. "User123" (numbers)
3. "User_Name_123" (combination)

**Expected Results**:
- ✅ All accepted as valid format
- ✅ No errors shown
- ✅ Can proceed to submit

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 7: Test Leading/Trailing Whitespace

**Actions**:
1. Enter: "  TestUser  " (spaces before/after)
2. Submit

**Expected Results**:
- ✅ Whitespace is trimmed automatically
- ✅ Saves as "TestUser" (no spaces)
- ✅ Or shows error if whitespace not allowed

**Test Result**: [ ] PASS / [ ] FAIL

**Behavior**:
```
Auto-Trim: [ ] YES / [ ] NO
Saved As: 
```

---

### Step 8: Test Empty Submission

**Actions**:
1. Leave display name field empty
2. Try to submit

**Expected Results**:
- ✅ Error: "Display name is required"
- ✅ Form doesn't submit
- ✅ Field marked as required

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 9: Test Successful Unique Name

**Actions**:
1. Enter: "TestUser678"
2. Submit

**Expected Results**:
- ✅ No errors
- ✅ Form submits successfully
- ✅ Community enabled
- ✅ Success message shown
- ✅ Database updated with display name
- ✅ State syncs immediately

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 10: Test Display Name Update

**Actions**:
1. User already has display name "TestUser678"
2. Navigate to Settings → Community
3. Change to "UpdatedName123"
4. Submit

**Expected Results**:
- ✅ Update succeeds
- ✅ New name appears in UI
- ✅ Database updated
- ✅ Old name now available for others

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 11: Test Update to Existing Name

**Actions**:
1. Try to update to "StoicSeeker" (taken)

**Expected Results**:
- ✅ Error: "Display name already taken"
- ✅ Update rejected
- ✅ Previous name retained

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 12: Test Profanity Filter (If Implemented)

**Actions**:
1. Test common profanities (use judgment)

**Expected Results**:
- ✅ Rejected with appropriate error
- ✅ Or allowed if no filter implemented

**Test Result**: [ ] PASS / [ ] FAIL / [ ] NOT IMPLEMENTED

---

## Edge Cases

### Test: SQL Injection Attempt

**Actions**: Enter: `' OR '1'='1`

**Expected**:
- ✅ Treated as normal string
- ✅ Validation rejects or sanitizes
- ✅ No database errors

**Result**: [ ] PASS / [ ] FAIL

---

### Test: Unicode/Emoji Characters

**Actions**: Enter: "Test👍User" or "TestÜser"

**Expected**:
- ✅ Either accepted or rejected with clear error
- ✅ No crashes
- ✅ Consistent behavior

**Result**: [ ] PASS / [ ] FAIL

**Behavior**:
```
Unicode: [ ] ALLOWED / [ ] REJECTED
Emoji: [ ] ALLOWED / [ ] REJECTED
```

---

### Test: Reserved Names (If Applicable)

**Actions**: Try: "admin", "moderator", "system"

**Expected**:
- ✅ Either accepted or rejected if reserved
- ✅ Clear error if reserved

**Result**: [ ] PASS / [ ] FAIL / [ ] NOT IMPLEMENTED

---

### Test: Real-Time Validation

**Actions**: Type "StoicSeeker" slowly

**Expected**:
- ✅ Error appears after typing (debounced check)
- ✅ Or on blur/submit
- ✅ Good UX timing

**Result**: [ ] PASS / [ ] FAIL

**Validation Timing**:
```
Type: [ ] Real-time / [ ] On Blur / [ ] On Submit
Debounce Delay: 
```

---

## Validation Summary

### Character Rules
- [ ] Min length: 3 characters
- [ ] Max length: 30 characters
- [ ] Allowed: Letters, numbers, underscores
- [ ] Case-insensitive uniqueness

### Error Messages
| Rule | Error Message | Clear? |
|------|---------------|--------|
| Duplicate | | [ ] YES / [ ] NO |
| Too short | | [ ] YES / [ ] NO |
| Too long | | [ ] YES / [ ] NO |
| Invalid chars | | [ ] YES / [ ] NO |
| Required | | [ ] YES / [ ] NO |

---

## Console Error Check

**Errors Found**: [ ] YES / [ ] NO

**Details**:
```

```

---

## Test Summary

**Overall Result**: [ ] PASS / [ ] PASS WITH WARNINGS / [ ] FAIL

**Steps Passed**: ___ / 12

**Critical Issues**:
1. 

**Validation Strengths**:
```

```

**Validation Weaknesses**:
```

```

**Recommendations**:
```

```

---

## Test Metadata

**Tested By**: ________________  
**Date**: ________________  
**Browser**: ________________  
**Invalid Names Tested**: ___

---

## Next Steps

✅ **If PASS**: Proceed to [09-content-type-rendering.md](./09-content-type-rendering.md)  
❌ **If FAIL**: Fix validation issues before proceeding
