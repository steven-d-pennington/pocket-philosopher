# Test Case 01: Community Onboarding Flow

**Priority**: 1 (CRITICAL - Foundation Test)  
**Estimated Time**: 5-10 minutes  
**Prerequisites**: Database seeded, dev server running  
**Test User**: test2@example.com (password: test123)

---

## Objective

Verify that users can successfully opt into the community feature, create a unique display name, and have their state properly synchronized across the application.

---

## Test Setup

### Before Starting
- [ ] Database has been reset and re-seeded with test data
- [ ] Development server is running on http://localhost:3001
- [ ] Browser DevTools console is open to monitor errors
- [ ] Logged out of any existing sessions

### Initial State Verification
- [ ] User test2@example.com exists in database
- [ ] User test2@example.com has `community_enabled = false`
- [ ] User test2@example.com has no `display_name` set

---

## Test Steps

### Step 1: Login as Non-Community User

**Actions**:
1. Navigate to http://localhost:3001/login
2. Enter email: `test2@example.com`
3. Enter password: `test123`
4. Click "Sign In"

**Expected Results**:
- ✅ Successfully redirected to `/today` dashboard
- ✅ No console errors during login
- ✅ User profile loads correctly

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record any observations, warnings, or issues]
```

---

### Step 2: Navigate to Community Settings

**Actions**:
1. Click on profile icon/menu in top navigation
2. Click "Settings" from dropdown menu
3. Click "Community" tab

**Expected Results**:
- ✅ Settings page loads successfully
- ✅ Community tab is visible and clickable
- ✅ "Enable Community" section is displayed
- ✅ Current state shows community as disabled
- ✅ No community-related widgets visible on dashboard

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record any observations]
```

---

### Step 3: Initiate Community Enablement

**Actions**:
1. Locate "Enable Community" button/toggle
2. Click to enable community features

**Expected Results**:
- ✅ Display name input field appears
- ✅ Instructions/helper text explains display name purpose
- ✅ Save/Submit button becomes available
- ✅ No console errors

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record UI state changes]
```

---

### Step 4: Test Display Name Uniqueness Validation

**Actions**:
1. Enter display name: `StoicSeeker` (already taken by test1@example.com)
2. Attempt to save/submit

**Expected Results**:
- ✅ Validation error message appears: "Display name already taken" or similar
- ✅ Form does not submit
- ✅ Input field shows error state (red border, etc.)
- ✅ Error message is clear and actionable

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record exact error message shown]
```

---

### Step 5: Submit Valid Display Name

**Actions**:
1. Clear the input field
2. Enter unique display name: `TestUser789`
3. Click Save/Submit button

**Expected Results**:
- ✅ Form submits successfully
- ✅ Success message or confirmation appears
- ✅ Display name is saved to profile
- ✅ Community features become enabled
- ✅ No console errors during submission

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record success message or confirmation UI]
```

---

### Step 6: Verify Onboarding Modal (if applicable)

**Actions**:
1. After successful submission, check for onboarding modal
2. If modal appears, review welcome content
3. Complete modal workflow (click "Get Started" or similar)

**Expected Results**:
- ✅ Modal displays welcome message (if implemented)
- ✅ Modal explains community features
- ✅ Modal can be dismissed/completed
- ✅ User is returned to settings or dashboard

**Test Result**: [ ] PASS / [ ] FAIL / [ ] N/A (if modal not implemented)

**Notes**:
```
[Record modal content and behavior]
```

---

### Step 7: Verify Immediate State Sync

**Actions**:
1. Stay on current page (do NOT refresh)
2. Navigate to different sections of the app
3. Check for community-related UI elements

**Expected Results**:
- ✅ Share buttons now visible in coach conversations
- ✅ Share buttons visible on reflection cards
- ✅ Community link appears in navigation (if applicable)
- ✅ CommunityWidget appears on Today dashboard
- ✅ All changes visible WITHOUT page refresh

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[List all UI elements that appeared after enabling]
```

---

### Step 8: Verify Database Persistence

**Actions**:
1. Refresh the page (F5 or Ctrl+R)
2. Navigate to Settings → Community tab again
3. Check community status

**Expected Results**:
- ✅ Community still shows as enabled after refresh
- ✅ Display name persists: `TestUser789`
- ✅ All community UI elements still visible
- ✅ No need to re-enable community

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Verify state persists across refresh]
```

---

### Step 9: Access Community Feed

**Actions**:
1. Navigate to http://localhost:3001/community
2. Observe community feed page

**Expected Results**:
- ✅ Community feed page loads successfully
- ✅ Can view posts from other community members
- ✅ Display name shows in header/profile area
- ✅ No permission errors or access denied messages

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record what appears in the feed]
```

---

### Step 10: Verify LocalStorage State

**Actions**:
1. Open Browser DevTools → Application → Local Storage
2. Find key related to community store (e.g., `community-storage`)
3. Inspect the stored value

**Expected Results**:
- ✅ `isEnabled: true` in stored state
- ✅ `displayName: "TestUser789"` in stored state
- ✅ State matches database values

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```javascript
// Paste localStorage value here
{
  "state": {
    "isEnabled": true,
    "displayName": "TestUser789"
  }
}
```

---

## Console Error Check

**Actions**: Review browser console for any errors during entire test flow

**Expected Results**:
- ✅ No unhandled errors or exceptions
- ✅ No 400/500 HTTP errors
- ✅ No React rendering errors
- ✅ No database query errors

**Console Errors Found**: [ ] YES / [ ] NO

**Error Details** (if any):
```
[Paste console errors here with stack traces]
```

---

## Test Summary

### Overall Result
- [ ] **PASS** - All steps completed successfully
- [ ] **PASS WITH WARNINGS** - Completed with minor issues (document below)
- [ ] **FAIL** - Critical issues prevent completion

### Steps Passed: ___ / 10

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues / Warnings
1. 
2. 
3. 

### Recommendations
```
[Any suggestions for improvements or fixes]
```

---

## Test Metadata

**Tested By**: ________________  
**Date**: ________________  
**Browser**: ________________  
**Environment**: [ ] Local Dev / [ ] Staging / [ ] Production  
**Git Branch**: feature/community  
**Git Commit**: ________________

---

## Next Steps

✅ **If PASS**: Proceed to [02-coach-sharing.md](./02-coach-sharing.md)  
❌ **If FAIL**: Document issues and assign for bug fixing before proceeding
