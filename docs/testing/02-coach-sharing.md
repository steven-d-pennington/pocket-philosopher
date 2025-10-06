# Test Case 02: Coach Conversation Sharing

**Priority**: 2 (CRITICAL - Core Feature)  
**Estimated Time**: 10-15 minutes  
**Prerequisites**: Test 01 PASSED, user has community enabled  
**Test User**: test1@example.com (password: test123) - already community-enabled

---

## Objective

Verify that users can share AI coach conversations to the community feed, including proper metadata generation, preview modal functionality, and post creation.

---

## Test Setup

### Before Starting
- [ ] Test 01 (Community Onboarding) has PASSED
- [ ] Database contains seeded community posts
- [ ] Development server is running
- [ ] Browser DevTools console is open
- [ ] Logged out of previous test session

### Initial State Verification
- [ ] User test1@example.com has `community_enabled = true`
- [ ] User test1@example.com has `display_name = "StoicSeeker"`
- [ ] Coach conversation page is accessible at `/marcus`

---

## Test Steps

### Step 1: Login as Community-Enabled User

**Actions**:
1. Navigate to http://localhost:3001/login
2. Enter email: `test1@example.com`
3. Enter password: `test123`
4. Click "Sign In"

**Expected Results**:
- ✅ Successfully logged in and redirected to dashboard
- ✅ Community features visible (share buttons, widget)
- ✅ No console errors

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record login state]
```

---

### Step 2: Navigate to Coach Workspace

**Actions**:
1. Click on "Marcus" or navigate to http://localhost:3001/marcus
2. Wait for coach page to load

**Expected Results**:
- ✅ Coach workspace loads successfully
- ✅ Marcus Aurelius persona is active
- ✅ Chat interface is ready
- ✅ Share buttons visible on interface
- ✅ No loading errors

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record initial page state]
```

---

### Step 3: Start a Conversation with Marcus

**Actions**:
1. Type a philosophical question in chat input
   - Suggested: "How can I find peace when facing uncertainty?"
2. Press Enter or click Send
3. Wait for Marcus to respond

**Expected Results**:
- ✅ Message sends successfully
- ✅ Marcus responds with streaming text
- ✅ Response completes without errors
- ✅ Conversation is saved to database
- ✅ Share button appears on Marcus's response

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record conversation content]
User: "How can I find peace when facing uncertainty?"
Marcus: [paste response]
```

---

### Step 4: Locate Share Button

**Actions**:
1. Find the share icon/button on Marcus's response message
2. Hover over the button to see tooltip (if any)

**Expected Results**:
- ✅ Share button is visible and clearly marked (icon/text)
- ✅ Button is clickable and not disabled
- ✅ Tooltip or label indicates "Share to Community" or similar
- ✅ Button styling matches app design system

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Describe button location and appearance]
```

---

### Step 5: Click Share Button

**Actions**:
1. Click the share button on Marcus's response

**Expected Results**:
- ✅ SharePreviewModal opens immediately
- ✅ Modal displays with smooth animation
- ✅ Modal is centered and properly styled
- ✅ Modal backdrop dims background content
- ✅ No console errors when modal opens

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record modal appearance and behavior]
```

---

### Step 6: Verify SharePreviewModal Content

**Actions**:
1. Review all content displayed in the preview modal
2. Check that conversation context is shown

**Expected Results**:
- ✅ Modal title: "Share to Community" or similar
- ✅ User's question is displayed in preview
- ✅ Marcus's response is displayed in preview
- ✅ Persona name shown: "Marcus Aurelius"
- ✅ Optional note/caption input field is available
- ✅ Character count or limit shown (if applicable)
- ✅ "Cancel" button is present
- ✅ "Share" or "Post" button is present

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[List all visible elements in modal]
Modal Title: 
User Message Preview: 
Coach Response Preview: 
Persona Display: 
Additional Fields: 
```

---

### Step 7: Add Optional Note

**Actions**:
1. Click in the optional note/caption field
2. Type: "Marcus helped me reframe my anxiety about the future"
3. Verify character count updates (if shown)

**Expected Results**:
- ✅ Text input works smoothly
- ✅ Character count updates in real-time
- ✅ No input lag or performance issues
- ✅ Text is properly sanitized/escaped

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record input behavior]
Character limit (if any): 
```

---

### Step 8: Submit Share to Community

**Actions**:
1. Click "Share" or "Post to Community" button
2. Observe submission process

**Expected Results**:
- ✅ Loading indicator appears during submission
- ✅ Button shows "Posting..." or similar loading state
- ✅ Button is disabled during submission
- ✅ Success message/toast appears after completion
- ✅ Modal closes automatically after success
- ✅ No console errors during submission

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Record submission feedback]
Success Message: 
Time to Complete: 
```

---

### Step 9: Verify Post Appears in Community Feed

**Actions**:
1. Navigate to http://localhost:3001/community
2. Look for the newly shared post at/near the top of the feed

**Expected Results**:
- ✅ Post appears in community feed (may be at top)
- ✅ Post shows correct author: "StoicSeeker"
- ✅ Post shows correct timestamp (just now)
- ✅ Post displays user's question and Marcus's response
- ✅ Post shows "Marcus Aurelius" as the coach persona
- ✅ Optional note appears in post: "Marcus helped me reframe..."
- ✅ Post is properly formatted and readable

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Describe post appearance in feed]
Post Position: 
Content Display: 
```

---

### Step 10: Inspect Post Metadata (Technical Validation)

**Actions**:
1. Open Browser DevTools → Network tab
2. Find the POST request to `/api/community/posts`
3. Review request payload

**Expected Results**:
- ✅ Request payload includes:
  - `content_type: "chat_excerpt"` or `"chat"`
  - `content_metadata.persona_id: "marcus"`
  - `content_metadata.coach_name: "Marcus Aurelius"`
  - `content_metadata.messages: [...]` (user + assistant messages)
  - `content_metadata.context: "..."` (optional note)
- ✅ Response status: 200 OK
- ✅ Response includes created post ID

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```json
// Paste request payload here
{
  "content_type": "",
  "content_metadata": {
    "persona_id": "",
    "coach_name": "",
    "messages": [],
    "context": ""
  }
}
```

---

### Step 11: Test Share Button on Different Personas (Optional)

**Actions**:
1. Switch to a different persona (e.g., Epictetus, Laozi) if user has access
2. Start a new conversation
3. Share a message from the new persona

**Expected Results**:
- ✅ Share works for all available personas
- ✅ Correct persona name appears in shared post
- ✅ Correct persona_id in metadata

**Test Result**: [ ] PASS / [ ] FAIL / [ ] N/A (no premium personas)

**Notes**:
```
[Test additional personas if available]
```

---

### Step 12: Test Cancel Flow

**Actions**:
1. Click share button on a different message
2. Modal opens
3. Add some text in optional note field
4. Click "Cancel" button

**Expected Results**:
- ✅ Modal closes without submitting
- ✅ No post is created in community feed
- ✅ No network requests sent
- ✅ Input is cleared when reopening modal
- ✅ Can reopen modal and try again

**Test Result**: [ ] PASS / [ ] FAIL

**Notes**:
```
[Verify cancel behavior]
```

---

## Edge Cases

### Test: Share Without Optional Note

**Actions**: Share a message without adding any note/caption

**Expected**:
- ✅ Submission succeeds
- ✅ Post displays without context field
- ✅ Post is still readable and complete

**Result**: [ ] PASS / [ ] FAIL

---

### Test: Very Long Optional Note

**Actions**: Try entering 500+ characters in optional note field

**Expected**:
- ✅ Character limit enforced (if applicable)
- ✅ Error message if exceeds limit
- ✅ Cannot submit if over limit

**Result**: [ ] PASS / [ ] FAIL

---

### Test: Rapid Successive Shares

**Actions**: Share 3 messages quickly in succession

**Expected**:
- ✅ All shares complete successfully
- ✅ No duplicate posts created
- ✅ All posts appear in feed

**Result**: [ ] PASS / [ ] FAIL

---

## Console Error Check

**Console Errors Found**: [ ] YES / [ ] NO

**Error Details**:
```
[Paste any errors here]
```

---

## Test Summary

### Overall Result
- [ ] **PASS** - All steps completed successfully
- [ ] **PASS WITH WARNINGS** - Minor issues noted
- [ ] **FAIL** - Critical issues prevent completion

### Steps Passed: ___ / 12

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
[Suggestions for improvements]
```

---

## Test Metadata

**Tested By**: ________________  
**Date**: ________________  
**Browser**: ________________  
**Environment**: [ ] Local Dev / [ ] Staging / [ ] Production

---

## Next Steps

✅ **If PASS**: Proceed to [03-community-feed.md](./03-community-feed.md)  
❌ **If FAIL**: Document issues and fix before proceeding
