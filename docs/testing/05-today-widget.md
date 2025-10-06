# Test Case 05: Today Page Community Widget

**Priority**: 5 (MEDIUM - Widget Integration)  
**Estimated Time**: 5-10 minutes  
**Prerequisites**: Tests 01-04 PASSED, community posts exist  
**Test User**: test1@example.com (password: test123)

---

## Objective

Verify that the CommunityWidget displays correctly on the Today dashboard, shows recent community posts, and respects community enabled/disabled state.

---

## Test Setup

### Before Starting
- [ ] Tests 01-04 have PASSED
- [ ] Community feed has multiple posts
- [ ] User test1 has community enabled
- [ ] Development server running

---

## Test Steps

### Step 1: Navigate to Today Dashboard (Community Enabled)

**Actions**:
1. Login as test1@example.com
2. Navigate to http://localhost:3001/today

**Expected Results**:
- ✅ Dashboard loads successfully
- ✅ CommunityWidget visible in layout
- ✅ Widget positioned in right column/sidebar
- ✅ Widget has clear title/header

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Widget Location: 
Widget Size: 
```

---

### Step 2: Verify Widget Content

**Actions**:
1. Examine posts shown in widget
2. Count number of posts displayed

**Expected Results**:
- ✅ Shows 3-5 recent community posts
- ✅ Posts have condensed/preview format
- ✅ Author names visible
- ✅ Timestamps visible (relative time)
- ✅ Content excerpts readable
- ✅ Posts are recent/relevant

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Posts Shown: 
Format: 
```

---

### Step 3: Test "View All" Link

**Actions**:
1. Click "View All" or "Go to Community" link in widget

**Expected Results**:
- ✅ Navigates to /community page
- ✅ Full feed loads correctly
- ✅ Link styling consistent with app

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 4: Test Widget with No Posts

**Actions**:
1. If possible, clear community posts temporarily OR
2. View as new user with no posts available

**Expected Results**:
- ✅ Empty state displays in widget
- ✅ Message like "No recent activity" shown
- ✅ No broken layout
- ✅ Suggests creating first post (optional)

**Test Result**: [ ] PASS / [ ] FAIL / [ ] N/A

---

### Step 5: Test Community Disabled State

**Actions**:
1. Logout
2. Login as test2@example.com (community disabled)
3. Navigate to /today

**Expected Results**:
- ✅ CommunityWidget does NOT appear
- ✅ Dashboard layout adjusts properly
- ✅ No blank spaces or broken layout
- ✅ No console errors

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Layout Adjustment: 
```

---

### Step 6: Test Enable → Widget Appears

**Actions**:
1. While logged in as test2, enable community
2. Return to /today WITHOUT refreshing
3. Check for widget

**Expected Results**:
- ✅ Widget appears immediately (via CommunityStateProvider)
- ✅ No page refresh needed
- ✅ Widget loads with content
- ✅ Smooth transition

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 7: Verify Widget Updates

**Actions**:
1. Create a new community post
2. Return to /today
3. Check if new post appears in widget

**Expected Results**:
- ✅ New post appears in widget (may need refresh)
- ✅ Widget shows most recent posts
- ✅ Order is chronological (newest first)

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 8: Test Widget Responsiveness

**Actions**:
1. Resize browser window
2. Test mobile breakpoint (~375px width)

**Expected Results**:
- ✅ Widget adapts to screen size
- ✅ May move position on mobile (stacks below main content)
- ✅ Content remains readable
- ✅ No horizontal scroll

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 9: Test Widget Performance

**Actions**:
1. Monitor page load time with widget
2. Check network requests

**Expected Results**:
- ✅ Widget doesn't significantly slow page load
- ✅ Loads asynchronously (doesn't block main content)
- ✅ Shows loading state if needed
- ✅ Efficient query (only fetches needed posts)

**Test Result**: [ ] PASS / [ ] FAIL

**Performance**:
```
Page Load Time: 
Widget Load Time: 
Network Requests: 
```

---

### Step 10: Test Widget Interactions

**Actions**:
1. Click on a post preview in widget
2. Try any available interactions (reactions, etc.)

**Expected Results**:
- ✅ Post click navigates to full view OR community feed
- ✅ Interactions work (if implemented in widget)
- ✅ Links are functional

**Test Result**: [ ] PASS / [ ] FAIL

---

## Accessibility Checks

### Screen Reader

**Actions**: Test with screen reader (if available)

**Expected**:
- ✅ Widget has proper heading structure
- ✅ Posts are navigable
- ✅ Links have descriptive text

**Result**: [ ] PASS / [ ] FAIL / [ ] N/A

---

### Keyboard Navigation

**Actions**: Tab through widget

**Expected**:
- ✅ Can tab to "View All" link
- ✅ Can tab to post links
- ✅ Focus indicators visible

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

✅ **If PASS**: Proceed to [06-practice-milestones.md](./06-practice-milestones.md)  
❌ **If FAIL**: Fix issues before proceeding
