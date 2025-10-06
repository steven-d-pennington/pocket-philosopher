# Test Case 07: Community State Synchronization

**Priority**: Edge Case Testing  
**Estimated Time**: 10-15 minutes  
**Prerequisites**: Tests 01-06 completed  
**Test User**: test4@example.com (password: test123)

---

## Objective

Verify that the CommunityStateProvider properly synchronizes community enabled/disabled state between localStorage, Zustand store, and database, especially after database resets or state changes.

---

## Test Setup

### Before Starting
- [ ] Previous tests completed
- [ ] User test4 has community disabled initially
- [ ] Development server running
- [ ] Browser DevTools open (Application tab)

---

## Test Steps

### Step 1: Initial State - Community Disabled

**Actions**:
1. Clear browser localStorage (DevTools → Application → Clear Storage)
2. Login as test4@example.com
3. Navigate to /today

**Expected Results**:
- ✅ No CommunityWidget visible
- ✅ No share buttons in coach/reflections
- ✅ Community link hidden/disabled in navigation
- ✅ localStorage has `isEnabled: false`
- ✅ Database has `community_enabled = false`

**Test Result**: [ ] PASS / [ ] FAIL

**LocalStorage State**:
```json
{
  "state": {
    "isEnabled": false,
    "displayName": null
  }
}
```

---

### Step 2: Enable Community Via Settings

**Actions**:
1. Navigate to Settings → Community
2. Enable community
3. Create display name: "TestUser456"
4. Save changes
5. **DO NOT REFRESH PAGE**

**Expected Results**:
- ✅ State updates immediately in UI
- ✅ Share buttons appear without refresh
- ✅ CommunityWidget appears on /today
- ✅ Community link becomes active
- ✅ localStorage updates to `isEnabled: true`
- ✅ Database updates to `community_enabled = true`

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Time to State Sync: 
UI Elements That Appeared: 
```

---

### Step 3: Verify CommunityStateProvider Sync

**Actions**:
1. Open DevTools Console
2. Check Zustand store state:
   ```javascript
   // In console
   JSON.parse(localStorage.getItem('community-storage'))
   ```

**Expected Results**:
- ✅ Store shows:
  - `isEnabled: true`
  - `displayName: "TestUser456"`
- ✅ Matches database state

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 4: Refresh Page - State Persists

**Actions**:
1. Refresh page (F5)
2. Wait for page load
3. Check community features

**Expected Results**:
- ✅ Community still enabled after refresh
- ✅ Widget still visible
- ✅ Share buttons still present
- ✅ No flash of disabled state
- ✅ CommunityStateProvider fetched DB state on mount

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 5: Simulate Database Reset (Stale localStorage)

**Actions**:
1. While logged in, simulate this scenario:
   - Keep browser open with localStorage `isEnabled: true`
   - Reset database (or manually set `community_enabled = false` in DB)
2. Refresh the page

**Expected Results**:
- ✅ CommunityStateProvider detects DB has `false`
- ✅ Updates store to `isEnabled: false`
- ✅ UI updates to hide community features
- ✅ No errors from stale localStorage

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Recovery Behavior: 
Time to Sync: 
```

---

### Step 6: Disable Community

**Actions**:
1. Re-enable community if needed
2. Navigate to Settings → Community
3. Disable community
4. Confirm disable action

**Expected Results**:
- ✅ Immediate UI update (no refresh needed)
- ✅ Widget disappears from /today
- ✅ Share buttons removed
- ✅ Community link becomes inactive
- ✅ localStorage updates to `isEnabled: false`
- ✅ Database updates to `community_enabled = false`

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 7: Test Rapid Enable/Disable Toggle

**Actions**:
1. Enable community
2. Immediately disable
3. Enable again
4. Wait for all state updates

**Expected Results**:
- ✅ No race conditions
- ✅ Final state is correct (enabled)
- ✅ No duplicate network requests
- ✅ No UI flashing or errors

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 8: Test Multiple Tabs

**Actions**:
1. Open app in two browser tabs
2. In Tab 1: Enable community
3. In Tab 2: Refresh page

**Expected Results**:
- ✅ Tab 2 picks up enabled state after refresh
- ✅ Both tabs show consistent state
- ✅ LocalStorage updates sync across tabs (if using storage events)

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 9: Test Logout/Login State Persistence

**Actions**:
1. Enable community
2. Logout
3. Login as same user

**Expected Results**:
- ✅ Community state persists across sessions
- ✅ Display name persists
- ✅ Features still enabled

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 10: Test Different User Switch

**Actions**:
1. Logout from test4
2. Login as test5 (community enabled)
3. Check state

**Expected Results**:
- ✅ State loads correctly for new user
- ✅ No bleed-over from previous user
- ✅ LocalStorage updates to new user's state

**Test Result**: [ ] PASS / [ ] FAIL

---

## Edge Cases

### Test: CommunityStateProvider on Mount

**Actions**: Clear localStorage, load page

**Expected**:
- ✅ Provider fetches from database
- ✅ Initializes store correctly
- ✅ Shows loading state if needed

**Result**: [ ] PASS / [ ] FAIL

---

### Test: Network Error During Sync

**Actions**: Block network, try to enable community

**Expected**:
- ✅ Error handling shows message
- ✅ Doesn't update localStorage until confirmed
- ✅ Graceful degradation

**Result**: [ ] PASS / [ ] FAIL

---

### Test: Invalid State Recovery

**Actions**: Manually corrupt localStorage state

**Expected**:
- ✅ Provider detects invalid state
- ✅ Fetches fresh state from DB
- ✅ Recovers gracefully

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

**State Sync Performance**:
```
Average Sync Time: 
Race Conditions Found: [ ] YES / [ ] NO
```

**Recommendations**:
```

```

---

## Test Metadata

**Tested By**: ________________  
**Date**: ________________  
**Browser**: ________________  
**Scenarios Tested**: [ ] Enable [ ] Disable [ ] Reset [ ] Multi-tab

---

## Next Steps

✅ **If PASS**: Proceed to [08-display-name-validation.md](./08-display-name-validation.md)  
❌ **If FAIL**: Fix state sync issues before proceeding
