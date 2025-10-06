# Pre-Merge Checklist: Community Features

**Feature Branch**: feature/community  
**Target Branch**: main  
**Created**: October 5, 2025  
**Updated**: _______________

---

## ⚠️ CRITICAL: Do Not Merge Until Complete

This checklist must be 100% complete before merging community features to main. Review each section carefully.

---

## 📋 1. Testing Requirements

### Core Functionality Testing
- [ ] **01-Community Onboarding** - PASSED
  - Display name creation works
  - Uniqueness validation works
  - State syncs correctly
  - Database updates persist
  
- [ ] **02-Coach Sharing** - PASSED
  - SharePreviewModal opens correctly
  - Metadata includes persona_id, messages, context
  - Posts appear in community feed
  - All 6 personas work (Marcus, Epictetus, Laozi, Simone, Aristotle, Plato)
  
- [ ] **03-Community Feed** - PASSED
  - Posts load and render
  - Reactions work (like, bookmark)
  - Infinite scroll functions
  - Timestamps display correctly
  - All content types render
  
- [ ] **04-Reflection Sharing** - PASSED
  - Morning reflections share correctly
  - Evening reflections share correctly
  - Metadata includes type, mood, virtue
  - Posts appear in feed with correct badges

### Integration Testing
- [ ] **05-Today Widget** - PASSED
  - Widget appears when community enabled
  - Widget hidden when community disabled
  - Shows recent posts (3-5)
  - "View All" link works
  - Updates when new posts created
  
- [ ] **06-Practice Milestones** - PASSED or N/A
  - Milestone detection works (if implemented)
  - Share prompts trigger correctly
  - Posts have celebration styling
  - OR gracefully handles not implemented

### Edge Case Testing
- [ ] **07-State Sync** - PASSED
  - Enable/disable flow works
  - CommunityStateProvider syncs correctly
  - localStorage matches database
  - Multi-tab sync works
  - Logout/login persists state
  
- [ ] **08-Display Name Validation** - PASSED
  - Duplicate names rejected
  - Character limits enforced (3-30 chars)
  - Invalid characters rejected
  - Clear error messages shown
  
- [ ] **09-Content Type Rendering** - PASSED
  - All content types render without errors
  - Null/undefined handling works
  - Error boundaries catch issues
  - No XSS vulnerabilities

---

## 🐛 2. Bug Resolution

### Critical Bugs (Must Fix)
- [ ] No blocker issues remain
- [ ] All P1/Critical bugs resolved
- [ ] Core features fully functional

**Remaining Critical Bugs**: _____ (must be 0)

### High Priority Bugs
- [ ] All high-priority bugs fixed OR documented as known issues
- [ ] Workarounds documented if not fixed

**Remaining High-Priority Bugs**: _____

### Known Issues Documentation
- [ ] All known issues documented in `docs/testing/KNOWN_ISSUES.md`
- [ ] Each issue has severity, workaround, and timeline for fix

---

## 💻 3. Code Quality

### Build & Compilation
- [ ] `npm run build` completes without errors
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run lint` passes with 0 errors
- [ ] No TypeScript `any` types without justification

### Code Review
- [ ] All new files follow existing patterns
- [ ] Component structure matches existing conventions
- [ ] State management uses established stores
- [ ] API routes follow standardized format
- [ ] Error handling consistent across codebase

### Performance
- [ ] No memory leaks (tested in long sessions)
- [ ] Feed loads in < 2 seconds
- [ ] Infinite scroll smooth (no jank)
- [ ] SharePreviewModal opens instantly
- [ ] No unnecessary re-renders (React DevTools)

### Console Cleanliness
- [ ] No errors during normal usage
- [ ] No warnings in production build
- [ ] All console.logs removed or behind debug flags
- [ ] Proper error logging to analytics

---

## 🗄️ 4. Database & Backend

### Schema & Migrations
- [ ] All migrations tested on fresh database
- [ ] Migration rollback tested
- [ ] No breaking changes to existing tables
- [ ] Indexes created for performance-critical queries

### Seed Data
- [ ] `npm run seed:admin` works
- [ ] `npm run seed:users` creates 20 test users
- [ ] `npm run seed:data` creates realistic community data
- [ ] Seed scripts are idempotent (can run multiple times)

### Row-Level Security (RLS)
- [ ] RLS policies on `profiles` table tested
- [ ] RLS policies on `community_posts` table tested
- [ ] RLS policies on `post_reactions` table tested
- [ ] Users cannot access other users' private data
- [ ] Admin access works correctly

### API Endpoints
- [ ] All routes return consistent response format
- [ ] Error responses include proper status codes
- [ ] Request validation implemented
- [ ] Rate limiting considered (if needed)

**New API Routes**:
- [ ] `GET /api/community/posts` - tested
- [ ] `POST /api/community/posts` - tested
- [ ] `POST /api/community/posts/:id/reactions` - tested
- [ ] `DELETE /api/community/posts/:id/reactions` - tested
- [ ] `GET /api/admin/community/reports` - tested
- [ ] `POST /api/admin/community/reports/:id/action` - tested

---

## 🔒 5. Security

### Input Validation
- [ ] Display name validation enforced
- [ ] Content sanitization prevents XSS
- [ ] SQL injection prevention (via Supabase RLS)
- [ ] No user input rendered as HTML without sanitization

### Authentication & Authorization
- [ ] All community routes require authentication
- [ ] Users can only modify own posts (when editing implemented)
- [ ] Admin routes properly gated
- [ ] Session handling secure

### Data Privacy
- [ ] Users can control community visibility (enable/disable)
- [ ] Display names are unique but privacy-preserving
- [ ] No PII exposed in public posts without consent
- [ ] GDPR compliance considered (data deletion)

---

## 📚 6. Documentation

### Code Documentation
- [ ] All new components have JSDoc comments
- [ ] Complex logic has inline comments
- [ ] Types are well-defined (no `any` abuse)
- [ ] README.md updated with community features

### User Documentation
- [ ] Feature overview in `docs/COMMUNITY_FEATURES_YOLO_PROGRESS.md`
- [ ] Testing documentation complete in `docs/testing/`
- [ ] Known issues documented
- [ ] User-facing help text in UI (tooltips, placeholders)

### Developer Documentation
- [ ] AGENTS.md updated with community system
- [ ] Database schema documented
- [ ] API routes documented
- [ ] State management patterns documented

### Changelog
- [ ] CHANGELOG.md updated with new features
- [ ] Breaking changes noted (if any)
- [ ] Migration instructions included (if needed)

---

## 🧪 7. Test Coverage

### Unit Tests
- [ ] New utility functions have unit tests
- [ ] Validation logic tested
- [ ] Scoring algorithms tested
- [ ] Store logic tested

### Integration Tests
- [ ] API route tests written
- [ ] Database operations tested
- [ ] State management tested

### E2E Tests
- [ ] Core user journeys tested (Playwright)
- [ ] Regression tests for existing features
- [ ] Community-specific E2E tests written

**Test Coverage**:
- Unit Tests: _____%
- Integration Tests: _____%
- E2E Tests: ____% of critical paths

---

## 🚀 8. Deployment Readiness

### Environment Variables
- [ ] All required env vars documented
- [ ] `.env.example` updated
- [ ] Production env vars configured (if applicable)
- [ ] No secrets in code

**New Environment Variables**:
```
# (List any new env vars needed)
```

### Database Migrations
- [ ] Migration plan for production database
- [ ] Downtime estimate (if any): _____
- [ ] Rollback plan documented

### Feature Flags
- [ ] Community features can be disabled via flag (if implemented)
- [ ] Graceful degradation if disabled

### Monitoring & Observability
- [ ] PostHog events for community actions
- [ ] Error tracking configured
- [ ] Performance monitoring in place
- [ ] Key metrics identified:
  - [ ] Community adoption rate
  - [ ] Posts created per day
  - [ ] Reaction engagement rate
  - [ ] Display name creation success rate

---

## 📱 9. Cross-Browser & Mobile

### Browser Testing
- [ ] Chrome (latest) - tested
- [ ] Firefox (latest) - tested
- [ ] Safari (latest) - tested
- [ ] Edge (latest) - tested

### Mobile Testing
- [ ] iOS Safari - responsive layout works
- [ ] Android Chrome - responsive layout works
- [ ] Touch interactions work (tap, swipe)
- [ ] Mobile feed scrolling smooth

### Responsive Design
- [ ] Feed works on mobile (320px+)
- [ ] SharePreviewModal mobile-friendly
- [ ] Widget adapts to screen size
- [ ] No horizontal scrolling

---

## ♿ 10. Accessibility

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Tab order logical
- [ ] Modals trappable with keyboard
- [ ] Share button accessible via keyboard

### Screen Readers
- [ ] Semantic HTML used
- [ ] ARIA labels on icons
- [ ] Form fields have labels
- [ ] Error messages announced

### Visual Accessibility
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators visible
- [ ] Text scalable without breaking layout
- [ ] No reliance on color alone for information

---

## 🔄 11. Backward Compatibility

### Existing Features
- [ ] Today dashboard still works
- [ ] Practices management unaffected
- [ ] Reflections flow unaffected
- [ ] Coach conversations unaffected
- [ ] Profile settings work
- [ ] Onboarding flow works

### Database
- [ ] No breaking changes to existing tables
- [ ] Old data migrates correctly
- [ ] Existing queries still work

### User Experience
- [ ] Users without community enabled see no changes
- [ ] Graceful degradation everywhere
- [ ] No forced adoption of community features

---

## 📊 12. Performance Benchmarks

### Load Times
- [ ] Initial feed load: < 2 seconds
- [ ] Post creation: < 1 second
- [ ] Reaction toggle: < 500ms
- [ ] SharePreviewModal open: < 200ms

### Database Queries
- [ ] Feed query uses indexes
- [ ] N+1 queries avoided
- [ ] Pagination implemented
- [ ] Query times logged

### Bundle Size
- [ ] New code doesn't bloat bundle significantly
- [ ] Code splitting used where appropriate
- [ ] Dependencies justified

**Bundle Impact**: +_____KB (acceptable if < 100KB)

---

## 📝 13. Final Review

### Stakeholder Approval
- [ ] Product owner reviewed and approved
- [ ] Designer reviewed UI/UX (if applicable)
- [ ] Lead developer code-reviewed
- [ ] QA signed off on testing

### Merge Preparation
- [ ] Branch rebased on latest main
- [ ] No merge conflicts
- [ ] Commit messages clean and descriptive
- [ ] Squash commits if needed (or keep atomic history)

### Communication
- [ ] Team notified of upcoming merge
- [ ] Release notes drafted
- [ ] User announcement prepared (if public-facing)
- [ ] Support team briefed on new features

---

## ✅ Final Sign-Off

**I certify that**:
- ✅ All critical tests have PASSED
- ✅ All critical bugs are resolved
- ✅ Code quality meets project standards
- ✅ Documentation is complete
- ✅ Security has been reviewed
- ✅ Performance is acceptable
- ✅ This feature is ready for production

**QA Tester**: _______________  
**Date**: _______________  
**Signature**: _______________

**Developer**: _______________  
**Date**: _______________  
**Signature**: _______________

**Product Owner**: _______________  
**Date**: _______________  
**Signature**: _______________

---

## 🚨 Merge Command

Only execute after ALL checkboxes above are complete:

```bash
# 1. Ensure on feature branch
git checkout feature/community

# 2. Pull latest changes
git pull origin feature/community

# 3. Rebase on main (resolve conflicts if any)
git fetch origin main
git rebase origin/main

# 4. Run final checks
npm run lint
npm run typecheck
npm run build
npm test

# 5. Push rebased branch
git push origin feature/community --force-with-lease

# 6. Create pull request (if using PR workflow)
# OR merge directly (if approved):
git checkout main
git merge feature/community
git push origin main

# 7. Tag release (optional)
git tag -a v1.1.0-community -m "Add community features"
git push origin v1.1.0-community
```

---

## 📞 Rollback Plan

If issues arise after merge:

```bash
# Option 1: Revert merge commit
git revert -m 1 <merge-commit-hash>
git push origin main

# Option 2: Hard reset (use with caution)
git reset --hard <commit-before-merge>
git push origin main --force

# Option 3: Feature flag disable
# Set COMMUNITY_ENABLED=false in production env
```

---

**Checklist Version**: 1.0  
**Last Updated**: October 5, 2025  
**Status**: 🔴 NOT READY TO MERGE
