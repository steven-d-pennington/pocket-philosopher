# Test Case 09: Content Type Rendering & Defensive Programming

**Priority**: Edge Case Testing  
**Estimated Time**: 15-20 minutes  
**Prerequisites**: Tests 01-08 completed  
**Test User**: test7@example.com, test8@example.com (password: test123)

---

## Objective

Verify that all community post content types (`chat_excerpt`, `reflection`, `practice_milestone`) render correctly with proper metadata handling, null/undefined safety, and graceful error recovery.

---

## Test Setup

### Before Starting
- [ ] Previous tests completed
- [ ] Both test users have community enabled
- [ ] Seeded posts include all content types
- [ ] Browser DevTools open (Console tab)

---

## Test Steps

### Step 1: Test Chat Excerpt Rendering

**Actions**:
1. Login as test7@example.com
2. Navigate to /community
3. Find a `chat_excerpt` post (Marcus conversation)

**Expected Results**:
- ✅ Coach name displayed (e.g., "Marcus Aurelius")
- ✅ Persona icon/badge visible
- ✅ Message Q&A format:
  - User question
  - Coach response
- ✅ Timestamp shown
- ✅ "View Full Conversation" link (optional)

**Test Result**: [ ] PASS / [ ] FAIL

**Post Appearance**:
```
Coach: 
Format: 
Metadata Visible: 
```

---

### Step 2: Test Chat Excerpt with Minimal Metadata

**Actions**:
1. Inspect a chat post with only required fields:
   ```json
   {
     "content_type": "chat_excerpt",
     "content_metadata": {
       "persona_id": "marcus",
       "messages": [{"role": "user", "content": "Test"}]
     }
   }
   ```

**Expected Results**:
- ✅ Still renders without errors
- ✅ Falls back to defaults:
  - Default coach name from persona_id
  - Empty context handled gracefully
- ✅ No "undefined" or "null" text in UI

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 3: Test Reflection Post Rendering

**Actions**:
1. Find a `reflection` post in feed

**Expected Results**:
- ✅ Reflection type badge (Morning/Midday/Evening)
- ✅ Mood indicator (emoji or number)
- ✅ Virtue badge (if present)
- ✅ Summary text or highlights
- ✅ Proper formatting for reflection fields

**Test Result**: [ ] PASS / [ ] FAIL

**Post Appearance**:
```
Type Badge: 
Mood Display: 
Virtue Badge: 
Summary Format: 
```

---

### Step 4: Test Reflection with Missing Fields

**Actions**:
1. Create or inspect reflection post with:
   ```json
   {
     "content_type": "reflection",
     "content_metadata": {
       "reflection_type": "morning",
       "mood": null,
       "summary": null
     }
   }
   ```

**Expected Results**:
- ✅ Renders without crashing
- ✅ Shows type badge
- ✅ Gracefully handles null mood (no indicator or default)
- ✅ Handles null summary (shows fallback text or hides section)
- ✅ No console errors

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 5: Test Practice Milestone Post

**Actions**:
1. Find a `practice_milestone` post (if available)
2. Or create one manually via database

**Expected Results**:
- ✅ Milestone badge (🎉 or "Milestone Achieved")
- ✅ Shows practice name
- ✅ Shows milestone type (7-day, 30-day)
- ✅ Celebratory styling
- ✅ Virtue badge if practice has virtue

**Test Result**: [ ] PASS / [ ] FAIL / [ ] NOT IMPLEMENTED

**Post Appearance**:
```
Milestone Badge: 
Practice Name: 
Streak Info: 
```

---

### Step 6: Test Undefined Content Type

**Actions**:
1. Create post with invalid content_type:
   ```json
   {
     "content_type": "invalid_type",
     "content_metadata": {}
   }
   ```
2. Load feed

**Expected Results**:
- ✅ Post either:
  - Renders with generic fallback layout
  - Shows error boundary component
  - Skipped gracefully (not rendered)
- ✅ No app crash
- ✅ Other posts render normally

**Test Result**: [ ] PASS / [ ] FAIL

**Error Handling**:
```
Behavior: [ ] Fallback / [ ] Error Boundary / [ ] Skip
Console Warning: [ ] YES / [ ] NO
```

---

### Step 7: Test Completely Null Metadata

**Actions**:
1. Create post with:
   ```json
   {
     "content_type": "chat_excerpt",
     "content_metadata": null
   }
   ```

**Expected Results**:
- ✅ Error boundary catches issue
- ✅ Shows fallback UI: "Unable to load post"
- ✅ No crash
- ✅ Feed continues to function

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 8: Test Malformed JSON in Metadata

**Actions**:
1. Corrupt a post's content_metadata in database
2. Load feed

**Expected Results**:
- ✅ Error caught during JSON parsing
- ✅ Post skipped or shows error
- ✅ No infinite error loop
- ✅ Logged to console for debugging

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 9: Test Missing Required Fields

**Actions**:
Test each content type with missing required fields:

1. **Chat without messages**:
   ```json
   {
     "content_type": "chat_excerpt",
     "content_metadata": {
       "persona_id": "marcus"
       // messages array missing
     }
   }
   ```

2. **Reflection without type**:
   ```json
   {
     "content_type": "reflection",
     "content_metadata": {
       "summary": "Test"
       // reflection_type missing
     }
   }
   ```

**Expected Results**:
- ✅ Each handled gracefully
- ✅ Shows partial data or error message
- ✅ No crashes

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
Chat without messages: 
Reflection without type: 
```

---

### Step 10: Test Very Long Content

**Actions**:
1. Create post with very long content:
   - 5000+ character coach response
   - Very long reflection summary

**Expected Results**:
- ✅ Content truncated with "Read More" link
- ✅ Or scrollable container
- ✅ Doesn't break layout
- ✅ Performance acceptable

**Test Result**: [ ] PASS / [ ] FAIL

**Truncation**:
```
Max Length Shown: 
Expansion Method: [ ] Modal / [ ] Inline / [ ] None
```

---

### Step 11: Test Special Characters in Content

**Actions**:
1. Create post with:
   - HTML tags: `<script>alert('test')</script>`
   - Markdown: `**bold** _italic_`
   - Emojis: 😊🎉✨

**Expected Results**:
- ✅ HTML is sanitized (not executed)
- ✅ Markdown rendered correctly (if supported)
- ✅ Emojis display properly
- ✅ No XSS vulnerability

**Test Result**: [ ] PASS / [ ] FAIL

---

### Step 12: Test Error Boundary Recovery

**Actions**:
1. Force an error in a post component
2. Continue browsing feed

**Expected Results**:
- ✅ Error boundary catches error
- ✅ Shows error UI for that post only
- ✅ Other posts render normally
- ✅ Can refresh to retry

**Test Result**: [ ] PASS / [ ] FAIL

---

## Content Type Matrix

| Content Type | Required Fields | Optional Fields | Tested |
|--------------|----------------|-----------------|--------|
| `chat_excerpt` | persona_id, messages | coach_name, context | [ ] |
| `reflection` | reflection_type | summary, mood, virtue, highlights | [ ] |
| `practice_milestone` | practice_name, milestone_type | virtue, streak_count | [ ] |

---

## Defensive Programming Checklist

- [ ] Null checks on all metadata fields
- [ ] Undefined checks before accessing nested properties
- [ ] Default values for missing fields
- [ ] Error boundaries around post components
- [ ] Graceful degradation for unknown content types
- [ ] HTML sanitization for user-generated content
- [ ] Type guards for content_metadata
- [ ] Try/catch around JSON parsing

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

**Content Types Tested**: [ ] chat_excerpt [ ] reflection [ ] practice_milestone

**Critical Issues**:
1. 

**Defensive Programming Score**: ___ / 8

**Recommendations**:
```

```

---

## Test Metadata

**Tested By**: ________________  
**Date**: ________________  
**Browser**: ________________  
**Edge Cases Found**: ___

---

## Final Testing Notes

✅ **All 9 Test Documents Complete**

This completes the comprehensive test suite for community features. Execute tests in order (01-09) for best results.

**Test Execution Workflow**:
1. Run prerequisite setup (seed database, start server)
2. Execute tests 01-06 sequentially (core features)
3. Execute tests 07-09 in any order (edge cases)
4. Document results in each file
5. Compile summary report
6. Address critical issues before production

**Next Steps After Testing**:
- Review all test results
- Fix critical/high-priority issues
- Retest failed scenarios
- Create production deployment checklist
- Merge feature/community branch to main
