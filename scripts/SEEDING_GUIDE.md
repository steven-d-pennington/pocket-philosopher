# Database Seeding Quick Reference

## 🚀 Complete Setup (Fresh Database)

```bash
# Full setup in 4 commands
npx supabase db reset    # Clear & migrate
npm run seed:admin       # Create admin@test.com
npm run seed:users       # Create 20 test users
npm run seed:data        # Generate 6 months of data
```

**Time:** ~5-10 minutes  
**Result:** Fully populated test environment with 15,000+ records

---

## 📦 What Gets Created

### Users (21 total)
- ✅ 1 admin (admin@test.com / password123)
- ✅ 20 test users (test1-20@example.com / test123)
  - 10 with community enabled
  - 10 without (for testing onboarding)

### Data Per User (~6 months)
- ✅ **3-5 Habits** (virtue-aligned)
- ✅ **~500-700 Habit Logs** (realistic streaks & completion)
- ✅ **~200-300 Reflections** (morning/evening entries)
- ✅ **2-4 Coach Conversations** (4-12 messages total)
- ✅ **1-3 Community Posts** (if community enabled)

### Total Database Records
- ~10,000 habit logs
- ~4,000 reflections  
- ~60 conversations
- ~150 messages
- ~20 community posts

---

## 🔑 Test Credentials

### Admin
```
Email: admin@test.com
Password: password123
```

### Regular Users
```
Email: test1@example.com (or test2, test3... up to test20)
Password: test123
```

### Community-Enabled Users (for sharing tests)
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

---

## 🧪 Common Testing Scenarios

### Test Feature-Rich User
```bash
# Login as test1@example.com
# Has: habits, logs, reflections, conversations, community posts
# Can: share to community, interact with feed
```

### Test Onboarding Flow
```bash
# Login as test2@example.com
# Has: habits, logs, reflections
# Missing: community (perfect for testing onboarding)
```

### Test Admin Dashboard
```bash
# Login as admin@test.com
# Access: /admin routes
# Can: view analytics, manage users
```

### Test Data Visualization
```bash
# Login as any user
# Navigate to: /progress or /today
# View: 6 months of charts, streaks, Return Score trends
```

---

## 🔄 Reset & Reseed

### Option 1: Complete Reset
```bash
npx supabase db reset
npm run seed:admin
npm run seed:users
npm run seed:data
```

### Option 2: Keep Users, Regenerate Data
```bash
# Manually delete data from Supabase Studio:
# - habit_logs
# - reflections
# - marcus_conversations
# - marcus_messages
# - community_posts

npm run seed:data  # Regenerate
```

### Option 3: Add More Data
```bash
# Just run seed:data again (may create duplicates)
npm run seed:data
```

---

## 📊 Data Characteristics

### Realistic Patterns
- ✅ Habit completion varies by difficulty (50-75%)
- ✅ Streaks build and break naturally (5-15 day cycles)
- ✅ Morning reflections more common than midday
- ✅ Community posts recent (last 30 days, not spread over 6 months)
- ✅ Engagement varies (0-15 reactions per post)

### Virtue Distribution
Each user's data focuses on their `preferred_virtue`:
- **Wisdom**: Reading, meditation, journaling habits
- **Courage**: Fear-facing, speaking up, trying new things
- **Temperance**: Mindful eating, digital detox, patience
- **Justice**: Kindness, fairness, community service

### Time Coverage
- **Start Date**: 180 days ago
- **End Date**: Today
- **Daily Data**: Habit logs (60-80% of days)
- **Reflections**: Morning (70% of days), Evening (80% of days)
- **Conversations**: Spread randomly over period

---

## 🐛 Troubleshooting

### "User already exists"
```bash
# Reset database first
npx supabase db reset
```

### "Could not find column"
```bash
# Make sure migrations are applied
npx supabase db reset  # Applies all migrations
```

### Seed script slow/hanging
```bash
# Check Supabase running
npx supabase status

# Reduce MONTHS_OF_DATA in seed-user-data.mjs
# Change from 6 to 3 for faster seeding
```

### Not enough data variety
```bash
# Edit seed-user-data.mjs:
# - Increase habit count (line ~80)
# - Add more templates to sample pools
# - Adjust completion probabilities
```

---

## 💡 Tips

1. **Always reset first** when testing from scratch
2. **Seed data after users** (dependencies)
3. **Use community-enabled users** for share/feed testing
4. **Login as different users** to see varied data
5. **Check Supabase Studio** to verify data: http://127.0.0.1:55434
6. **Test analytics** with 6 months of data for meaningful charts

---

## 🎯 Next Steps After Seeding

1. **Login as test1@example.com**
2. **Check Today page** - See populated widgets, Return Score
3. **View Practices** - See active habits with completion history
4. **Check Reflections** - Browse 6 months of entries
5. **Visit Coach** - See existing conversations
6. **Browse Community** - See posts from other users
7. **Test Sharing** - Create new post, see it in feed
8. **Admin Dashboard** - Login as admin, view metrics

---

**Last Updated**: October 5, 2025  
**Scripts Version**: 1.0.0
