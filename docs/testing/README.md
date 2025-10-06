# Community Features Testing Guide

**Last Updated**: October 5, 2025  
**Feature Branch**: `feature/community`  
**Status**: Ready for Testing

---

## Overview

This folder contains comprehensive testing documentation for the Community Features implementation in Pocket Philosopher. Each workflow has its own dedicated test document with step-by-step instructions, expected results, and space for recording test outcomes.

## Test Documents

### Core Workflows (Priority Order)

1. **[01-community-onboarding.md](./01-community-onboarding.md)** - PRIORITY 1
   - Foundation test - must pass before other tests
   - Tests user opt-in, display name creation, and state synchronization
   - Estimated time: 5-10 minutes

2. **[02-coach-sharing.md](./02-coach-sharing.md)** - PRIORITY 2
   - Core sharing feature from AI coach conversations
   - Tests SharePreviewModal, metadata generation, and post creation
   - Estimated time: 10-15 minutes

3. **[03-community-feed.md](./03-community-feed.md)** - PRIORITY 3
   - Community feed viewing and interactions
   - Tests post rendering, reactions, and infinite scroll
   - Estimated time: 10-15 minutes

4. **[04-reflection-sharing.md](./04-reflection-sharing.md)** - PRIORITY 4
   - Sharing journal reflections to community
   - Tests reflection metadata and share flow
   - Estimated time: 10-15 minutes

5. **[05-today-widget.md](./05-today-widget.md)** - PRIORITY 5
   - CommunityWidget integration on dashboard
   - Tests widget visibility and state responsiveness
   - Estimated time: 5-10 minutes

6. **[06-practice-milestones.md](./06-practice-milestones.md)** - PRIORITY 6
   - Auto-triggered sharing from practice achievements
   - Tests milestone detection and celebration posts
   - Estimated time: 15-20 minutes

### Edge Cases & Validation

7. **[07-state-sync.md](./07-state-sync.md)**
   - Enable/disable flow and state synchronization
   - Tests CommunityStateProvider behavior
   - Estimated time: 10-15 minutes

8. **[08-display-name-validation.md](./08-display-name-validation.md)**
   - Display name uniqueness and validation rules
   - Tests duplicate prevention and format validation
   - Estimated time: 5-10 minutes

9. **[09-content-type-rendering.md](./09-content-type-rendering.md)**
   - All post content types and metadata structures
   - Tests defensive rendering and error handling
   - Estimated time: 10-15 minutes

---

## Test Environment Setup

### Prerequisites

1. **Database State**: Fresh seed data loaded
   ```bash
   npm run seed:admin
   npm run seed:users
   npm run seed:data
   ```

2. **Development Server**: Running on http://localhost:3001
   ```bash
   npm run dev
   ```

3. **Browser**: Chrome/Edge with DevTools available for console inspection

### Test User Accounts

All test users have password: `test123`

**Community-Enabled Users** (10):
- test1@example.com - StoicSeeker
- test3@example.com - EpicureanDreamer
- test5@example.com - AureliusFollower
- test7@example.com - DialogueLover
- test9@example.com - MindfulThinker
- test11@example.com - CourageousHeart
- test13@example.com - BalancedMind
- test15@example.com - DailyPractice
- test17@example.com - PlatonicIdeal
- test19@example.com - EthicalWarrior

**Community-Disabled Users** (10):
- test2@example.com - TaoistWanderer (use for onboarding test)
- test4@example.com - CynicalPhilosopher
- test6@example.com - ZenMaster
- test8@example.com - VirtuePractitioner
- test10@example.com - ReflectiveScribe
- test12@example.com - WisdomSeeker99
- test14@example.com - JustAction
- test16@example.com - InnerPeace
- test18@example.com - SenecaStudent
- test20@example.com - ContemplativeOne

---

## How to Use These Documents

### For Human Testers

1. **Start with Prerequisites**: Ensure database is seeded and dev server is running
2. **Follow Priority Order**: Complete tests 1-6 in sequence
3. **Record Results**: Use the checkboxes and notes sections in each document
4. **Report Bugs**: Use the "Issues Found" section to document any failures
5. **Review Summary**: Update the test summary at the end of each document

### For AI Agents

1. **Parse Test Steps**: Each step has clear expected outcomes marked with ✅
2. **Execute Actions**: Follow step-by-step instructions using browser automation
3. **Validate Results**: Check for expected UI states, console outputs, and database states
4. **Record Outcomes**: Mark each step as PASS/FAIL with error details
5. **Generate Report**: Compile results into summary format

---

## Test Reporting Format

### Passing Test
```markdown
- [x] Step 1: Action description
  - Result: PASS
  - Notes: Everything worked as expected
```

### Failing Test
```markdown
- [ ] Step 3: Action description
  - Result: FAIL
  - Error: "Cannot read property 'includes' of undefined"
  - Screenshot: attached-error-screenshot.png
  - Console Log: [error stack trace]
```

---

## Success Criteria

All tests must meet these criteria:

- ✅ **No Console Errors**: Browser console should be free of unhandled errors
- ✅ **Expected UI States**: All UI elements appear and behave as documented
- ✅ **Data Persistence**: Changes persist across page refreshes
- ✅ **State Synchronization**: Store state matches database state
- ✅ **Error Handling**: Validation errors display helpful messages
- ✅ **Responsive Behavior**: UI updates immediately without requiring refresh

---

## Known Issues & Limitations

### Fixed Issues (October 5, 2025)
- ✅ Store/database sync for community_enabled state
- ✅ Community post card metadata rendering
- ✅ Chat metadata validation errors
- ✅ Modal component rendering in layout
- ✅ Practice modal activeDays undefined error
- ✅ Daily progress calculation trigger bug

### Current Limitations
- Practice milestone sharing not yet implemented (test will verify graceful handling)
- Community settings page may need additional UX polish
- Infinite scroll may need performance optimization for large datasets

---

## Contact & Support

**Questions or Issues?**
- Create a GitHub issue on the `feature/community` branch
- Tag findings with `testing` label
- Include test document reference and step number

**Documentation Updates**
- Update test documents as features evolve
- Add new test cases for edge cases discovered
- Keep README.md in sync with test file list

---

## Test Execution Log

| Date | Tester | Tests Passed | Tests Failed | Notes |
|------|--------|--------------|--------------|-------|
| Oct 5, 2025 | [Name] | 0/9 | 0/9 | Initial test run pending |

---

**Ready to Begin Testing?**  
Start with **[01-community-onboarding.md](./01-community-onboarding.md)** 🚀
