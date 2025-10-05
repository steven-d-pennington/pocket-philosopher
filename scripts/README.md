# Scripts

Automation utilities for seeding data, syncing corpora, running batch jobs, or performing environment diagnostics. Prefer TypeScript scripts when interacting with the Supabase client.

## Database Seeding Scripts

### Create Admin User
Creates a single admin user for testing admin features.

```bash
npm run seed:admin
```

**Credentials:**
- Email: `admin@test.com`
- Password: `password123`
- Admin: `true`

---

### Create Test Users
Creates 20 non-admin test users with varied profiles.

```bash
npm run seed:users
```

**Features:**
- 20 unique users with philosophical display names
- Each user has a preferred virtue (wisdom, courage, temperance, or justice)
- **10 users** have community features enabled (display names set)
- **10 users** do not have community enabled (for testing onboarding flow)
- All users use password: `test123`

**Community-Enabled Users (every other user):**
1. StoicSeeker (test1@example.com)
2. EpicureanDreamer (test3@example.com)
3. AureliusFollower (test5@example.com)
4. DialogueLover (test7@example.com)
5. MindfulThinker (test9@example.com)
6. CourageousHeart (test11@example.com)
7. BalancedMind (test13@example.com)
8. DailyPractice (test15@example.com)
9. PlatonicIdeal (test17@example.com)
10. EthicalWarrior (test19@example.com)

**Community-Disabled Users (for testing onboarding):**
1. TaoistWanderer (test2@example.com)
2. CynicalPhilosopher (test4@example.com)
3. ZenMaster (test6@example.com)
4. VirtuePractitioner (test8@example.com)
5. ReflectiveScribe (test10@example.com)
6. WisdomSeeker99 (test12@example.com)
7. JustAction (test14@example.com)
8. InnerPeace (test16@example.com)
9. SenecaStudent (test18@example.com)
10. ContemplativeOne (test20@example.com)

---

### Seed User Data
Generates 6 months of realistic usage data for all existing users.

```bash
npm run seed:data
```

**What it creates:**
- **Habits**: 3-5 per user (aligned with preferred virtue)
- **Habit Logs**: ~500-700 entries over 180 days (realistic completion rates)
- **Reflections**: ~200-300 morning/evening reflections
- **Coach Conversations**: 2-4 conversations with 2-6 messages each
- **Community Posts**: 1-3 posts (for community-enabled users only)

**Features:**
- Realistic streaks and completion patterns
- Varied content based on virtue focus
- Different difficulty levels affect completion rates
- Community posts from last 30 days with realistic engagement
- All data timestamped across 6-month period

---

## Prerequisites

Make sure your local Supabase instance is running:

```bash
npx supabase start
```

The scripts use the local Supabase configuration:
- **URL**: `http://127.0.0.1:55432`
- **Anon Key**: Local development key (hardcoded in scripts)

---

## Complete Setup Workflow

To set up a fully populated test environment from scratch:

```bash
# 1. Reset database (clears all data)
npx supabase db reset

# 2. Create admin user
npm run seed:admin

# 3. Create 20 test users
npm run seed:users

# 4. Generate 6 months of data for all users
npm run seed:data
```

**Total setup time:** ~5-10 minutes depending on your machine.

**Result:** A fully populated database with:
- 1 admin user
- 20 test users (10 with community enabled)
- ~10,000+ habit logs across all users
- ~4,000+ reflections
- ~60 coach conversations
- ~20 community posts

---

## Testing Workflows

### Community Features Testing

1. **Test Onboarding Flow:**
   - Login as a community-disabled user (e.g., `test2@example.com`)
   - Go to Settings → Community
   - Enable community and choose a display name
   - Verify profile updates correctly

2. **Test Sharing & Feed:**
   - Login as a community-enabled user (e.g., `test1@example.com`)
   - Navigate to coach conversation
   - Share a message to community
   - Check community feed for the post
   - React to posts from other users

3. **Test Permissions:**
   - Login as a community-disabled user
   - Verify share buttons are hidden
   - Verify community feed redirects or shows onboarding

### Multi-User Testing

Use these users to test:
- Post interactions (likes, reactions)
- Feed filtering by persona/virtue
- Display name uniqueness validation
- User search and discovery
- Report functionality

---

## Resetting Test Data

To clear all test users and start fresh:

```bash
# Reset entire local database
npx supabase db reset

# Then re-run seed scripts
npm run seed:admin
npm run seed:users
```

---

## Customization

### Change Password
Edit the `password` constant in `create-test-users.mjs`:

```javascript
const password = 'your-custom-password';
```

### Add More Users
Add entries to the `testUsers` array in `create-test-users.mjs`:

```javascript
{ 
  email: 'test21@example.com', 
  displayName: 'YourDisplayName', 
  virtue: 'wisdom' 
},
```

### Change Community Enablement Logic
Modify the `enableCommunity` logic in the script:

```javascript
// Current: Every other user (50%)
const enableCommunity = index % 2 === 0;

// All users:
const enableCommunity = true;

// Random 70%:
const enableCommunity = Math.random() > 0.3;
```

---

## Troubleshooting

### "User already exists" Error
If you see signup errors for existing emails:
- Either reset the database: `npx supabase db reset`
- Or manually delete users from Supabase Studio: http://127.0.0.1:55434

### Script Hangs or Times Out
- Check Supabase is running: `npx supabase status`
- Verify ports are correct in script (55432 for local)
- Increase delays if profile trigger is slow

### Profile Not Updated
The script waits 500ms for the database trigger to create the profile. If updates fail:
- Increase the delay: `await new Promise(resolve => setTimeout(resolve, 1000));`
- Check database logs for trigger errors

---

## Notes

- All test users are created in your **local** Supabase instance only
- Email confirmation is disabled in local development
- Users are immediately active and can login
- The script creates realistic test data for community features
- Half the users have community enabled to test both flows
