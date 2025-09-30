# Release Checklist

This checklist ensures Pocket Philosopher releases are thoroughly tested, documented, and safely deployed across all environments.

## Pre-Release Preparation

### Code Quality Gates
- [ ] `npm run lint` passes with no errors or warnings
- [ ] `npm run typecheck` passes with no TypeScript errors
- [ ] `npm run test` passes all unit tests (server and client)
- [ ] `npm run e2e` passes all Playwright end-to-end tests
- [ ] Build completes successfully: `npm run build`
- [ ] Lighthouse PWA audit scores >90 on all metrics

### Feature Validation
- [ ] AI chat streaming works with citations and persona switching
- [ ] Offline functionality: service worker caching, draft sync, install prompts
- [ ] Authentication flows: email/password and anonymous sign-in
- [ ] Database operations: reflections, practices, daily progress
- [ ] PWA features: install banner, offline banner, connectivity indicators

### Telemetry Verification
- [ ] PostHog events firing: `i_chat_completed`, `i_request_failed`, `i_provider_health_changed`
- [ ] `/api/health` endpoint returns accurate provider statuses
- [ ] Provider failover working correctly
- [ ] Offline events tracked: `client_offline_event` for sync and install prompts

## Environment-Specific Checks

### Local Development
- [ ] Docker Compose starts all services successfully
- [ ] Database migrations apply without errors
- [ ] Seed data loads correctly
- [ ] All environment variables validated
- [ ] PWA service worker registers in development mode

### Staging Environment
- [ ] Supabase project configured with correct schema
- [ ] Environment variables match staging values
- [ ] Redis connection established
- [ ] Domain SSL certificate valid
- [ ] Monitoring dashboards accessible

### Production Environment
- [ ] Production Supabase project ready
- [ ] Production secrets configured
- [ ] Backup procedures tested
- [ ] Rollback plan documented
- [ ] CDN and edge caching configured

## Deployment Steps

### Database Migration
- [ ] Migration scripts reviewed and tested
- [ ] Backup created before migration
- [ ] Migration applied to staging first
- [ ] Data integrity verified post-migration
- [ ] Rollback scripts prepared

### Application Deployment
- [ ] Code merged to deployment branch
- [ ] CI/CD pipeline triggered
- [ ] Build artifacts generated successfully
- [ ] Smoke tests pass on deployed environment
- [ ] Health checks return 200 OK

### Post-Deployment Validation
- [ ] Application loads without errors
- [ ] Core user flows tested manually
- [ ] API endpoints responding correctly
- [ ] Telemetry events appearing in dashboards
- [ ] Performance metrics within acceptable ranges

## Rollback Preparation

### Rollback Plan
- [ ] Previous deployment identified and accessible
- [ ] Database backup available for restore
- [ ] Rollback commands documented
- [ ] Communication plan for rollback scenario
- [ ] Timeline for rollback execution

### Emergency Contacts
- [ ] On-call engineer notified of deployment
- [ ] Support team aware of new features
- [ ] Monitoring alerts configured
- [ ] Incident response plan reviewed

## Documentation Updates

### Release Notes
- [ ] New features documented
- [ ] Breaking changes highlighted
- [ ] Known issues listed
- [ ] Upgrade instructions provided

### Operational Documentation
- [ ] Runbooks updated with new procedures
- [ ] Monitoring dashboards documented
- [ ] Troubleshooting guides current
- [ ] Support knowledge base updated

## Sign-off

### Team Approval
- [ ] Product owner reviewed and approved
- [ ] Engineering lead signed off
- [ ] QA validation completed
- [ ] Security review passed
- [ ] Deployment authorized

### Post-Release Monitoring
- [ ] Error rates monitored for 24 hours
- [ ] User feedback collected
- [ ] Performance metrics tracked
- [ ] Success metrics validated

---

**Release Commander:** ____________________
**Date:** ____________________
**Version:** ____________________
**Target Environment:** ____________________</content>
<parameter name="filePath">c:\projects\pocket-philosopher\docs\deployment\release-checklist.md