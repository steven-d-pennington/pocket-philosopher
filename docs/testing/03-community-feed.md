# Test Case 03: Community Feed Functionality

**Priority**: 3 (HIGH - Core Feature)  
**Estimated Time**: 10-15 minutes  
**Prerequisites**: Tests 01-02 PASSED, multiple posts exist in feed  
**Test User**: test1@example.com (password: test123)

---

## Objective

Verify that the community feed displays posts correctly, supports user interactions (reactions), and handles different content types with proper metadata rendering.

---

## Test Setup

### Before Starting
- [ ] Tests 01-02 have PASSED
- [ ] Database contains seeded community posts (from seed:data script)
- [ ] At least one post shared from coach conversation (Test 02)
- [ ] Development server is running
- [ ] Browser DevTools console open

### Initial State Verification
- [ ] Community feed accessible at `/community`
- [ ] Seed data created multiple post types (reflection, chat_excerpt)
- [ ] User test1@example.com is logged in

---

## Test Steps

### Step 1: Navigate to Community Feed

**Actions**:
1. Click "Community" link in navigation OR
2. Navigate directly to http://localhost:3001/community

**Expected Results**:
- ✅ Community feed page loads successfully
- ✅ Page title/header indicates "Community" section
- ✅ Feed container is visible and properly styled
- ✅ Loading state appears briefly if applicable
- ✅ No console errors during page load

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record page load behavior]
Loading Time: 
Initial Post Count Visible: 
```

---

### Step 2: Verify Seeded Posts Display

**Actions**:
1. Scroll through the feed
2. Count visible posts
3. Observe post variety

**Expected Results**:
- ✅ Multiple posts are visible (at least 5-10)
- ✅ Posts from different users appear
- ✅ Posts show author display names (e.g., "StoicSeeker", "MindfulThinker")
- ✅ Posts show timestamps (relative or absolute)
- ✅ Posts have proper spacing and layout
- ✅ No broken layouts or overlapping content

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Total Posts Visible: 
Unique Authors Seen: 
Content Types Observed: [ ] Reflection [ ] Chat [ ] Other
```

---

### Step 3: Verify Chat/Coach Post Rendering

**Actions**:
1. Find a post with `content_type: "chat_excerpt"` or `"chat"`
2. Examine the post content display

**Expected Results**:
- ✅ Post shows coach name (e.g., "Marcus Aurelius")
- ✅ User's question is displayed
- ✅ Coach's response is displayed
- ✅ Text is properly formatted and readable
- ✅ Optional context/note appears if present
- ✅ Persona-specific styling/icons present (if implemented)
- ✅ No metadata rendering errors
- ✅ No undefined/null values displayed

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Describe chat post appearance]
Coach Name Display: 
Message Format: 
Styling: 
```

---

### Step 4: Verify Reflection Post Rendering

**Actions**:
1. Find a post with `content_type: "reflection"`
2. Examine the reflection content display

**Expected Results**:
- ✅ Reflection type shown (Morning/Evening)
- ✅ Reflection summary or key content displayed
- ✅ Highlights/wins visible (if part of metadata)
- ✅ Mood indicator shown (if applicable)
- ✅ Virtue focus displayed (if applicable)
- ✅ Text is formatted and readable
- ✅ No metadata errors or missing fields

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Describe reflection post appearance]
Reflection Type: 
Content Displayed: 
Metadata Fields: 
```

---

### Step 5: Test Reaction - Like/Heart

**Actions**:
1. Find a post you haven't reacted to
2. Click the heart/like icon or button
3. Observe the reaction

**Expected Results**:
- ✅ Heart icon changes state (filled vs outlined)
- ✅ Reaction count increments by 1
- ✅ Change happens immediately (optimistic update)
- ✅ Network request sent to record reaction
- ✅ Reaction persists after page refresh
- ✅ No console errors

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Initial Count: 
After Click Count: 
Visual Feedback: 
```

---

### Step 6: Test Reaction - Unlike

**Actions**:
1. Click the heart/like icon again on the same post
2. Observe the reaction removal

**Expected Results**:
- ✅ Heart icon changes back to unfilled state
- ✅ Reaction count decrements by 1
- ✅ Change happens immediately
- ✅ Network request sent to remove reaction
- ✅ State persists after refresh
- ✅ No errors

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Verify toggle behavior]
```

---

### Step 7: Test Reaction - Bookmark (if implemented)

**Actions**:
1. Find bookmark icon on a post
2. Click to bookmark
3. Observe behavior

**Expected Results**:
- ✅ Bookmark icon changes state
- ✅ Bookmark count updates (if shown)
- ✅ Optimistic update occurs
- ✅ Network request completes
- ✅ Can un-bookmark by clicking again

**Test Result**: [ ] PASS / [ ] FAIL / [ ] N/A (not implemented)

**Notes**:
```
[Record bookmark functionality]
```

---

### Step 8: Verify Post Timestamps

**Actions**:
1. Check timestamps on multiple posts
2. Verify relative time format

**Expected Results**:
- ✅ Recent posts show "just now" or "2 minutes ago"
- ✅ Older posts show "3 hours ago" or similar
- ✅ Very old posts might show absolute date
- ✅ Timestamps are consistent and make sense
- ✅ Timestamps update on refresh

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record timestamp formats seen]
Recent: 
Older: 
```

---

### Step 9: Test Infinite Scroll

**Actions**:
1. Scroll to the bottom of the feed
2. Wait for more posts to load
3. Continue scrolling

**Expected Results**:
- ✅ Loading indicator appears at bottom when approaching end
- ✅ More posts load automatically
- ✅ Scroll position is maintained smoothly
- ✅ No duplicate posts appear
- ✅ Loading completes without errors
- ✅ "No more posts" message appears when end is reached (if applicable)

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Initial Posts: 
After First Scroll: 
Total Posts Loaded: 
Performance Notes: 
```

---

### Step 10: Test Content Type Edge Cases

**Actions**:
1. Find posts with minimal metadata
2. Find posts with rich metadata
3. Verify defensive rendering works

**Expected Results**:
- ✅ Posts with missing metadata fields don't crash
- ✅ Null/undefined values handled gracefully
- ✅ Empty arrays/objects don't cause errors
- ✅ Fallback content displays when data is minimal
- ✅ No "undefined" or "null" text visible in UI

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Document how edge cases are handled]
Missing Fields: 
Fallback Behavior: 
```

---

### Step 11: Test Feed Refresh

**Actions**:
1. Note current posts in feed
2. Refresh page (F5 or Ctrl+R)
3. Compare feed state

**Expected Results**:
- ✅ Feed reloads successfully
- ✅ Same posts appear (assuming no new posts)
- ✅ Reaction states persist (liked posts still liked)
- ✅ Scroll position resets to top
- ✅ No errors during refresh

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Verify persistence]
```

---

### Step 12: Test Empty State (if applicable)

**Actions**:
1. If possible, view feed with no posts OR
2. Filter to a state that shows no results

**Expected Results**:
- ✅ Empty state message displays
- ✅ Message is helpful and friendly
- ✅ Suggests action (e.g., "Share your first reflection!")
- ✅ No broken layout or errors

**Test Result**: [ ] PASS / [ ] FAIL / [ ] N/A (cannot test)

**Notes**:
```
Empty State Message: 
```

---

## Accessibility & UX Checks

### Keyboard Navigation

**Actions**: Use Tab key to navigate through posts

**Expected**:
- ✅ Can tab to reaction buttons
- ✅ Focus indicators are visible
- ✅ Can activate buttons with Enter/Space

**Result**: [ ] PASS / [ ] FAIL

---

### Responsive Layout

**Actions**: Resize browser window to mobile width (375px)

**Expected**:
- ✅ Posts stack vertically
- ✅ Text remains readable
- ✅ Buttons remain accessible
- ✅ No horizontal scroll

**Result**: [ ] PASS / [ ] FAIL

---

### Performance

**Actions**: Monitor performance during scrolling

**Expected**:
- ✅ Smooth scroll performance
- ✅ No visible lag when loading posts
- ✅ Reactions respond instantly
- ✅ No memory leaks (check DevTools Performance)

**Result**: [ ] PASS / [ ] FAIL

---

## Console Error Check

**Console Errors Found**: [ ] YES / [ ] NO

**Error Details**:
```
[Paste errors]
```

---

## Test Summary

### Overall Result
- [ ] **PASS**
- [ ] **PASS WITH WARNINGS**
- [ ] **FAIL**

### Steps Passed: ___ / 12

### Critical Issues
1. 
2. 

### Minor Issues
1. 
2. 

### Performance Notes
```
[Page load time, scroll smoothness, etc.]
```

---

## Test Metadata

**Tested By**: ________________  
**Date**: ________________  
**Browser**: ________________  
**Posts Tested**: ________________

---

## Next Steps

✅ **If PASS**: Proceed to [04-reflection-sharing.md](./04-reflection-sharing.md)  
❌ **If FAIL**: Fix issues before proceeding
