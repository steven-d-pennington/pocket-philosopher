import { createClient } from '@supabase/supabase-js';
import { subDays, format, startOfDay, addDays } from 'date-fns';

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:55432';
// Using service role key for admin API access
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const MONTHS_OF_DATA = 6;
const DAYS_OF_DATA = MONTHS_OF_DATA * 30; // Approximately 180 days

// Sample data pools
const VIRTUES = ['wisdom', 'courage', 'temperance', 'justice'];
const PERSONAS = ['marcus', 'epictetus', 'lao', 'simone', 'aristotle', 'plato'];

const HABITS_BY_VIRTUE = {
  wisdom: [
    { name: 'Morning Reading', description: 'Read philosophical texts for 15 minutes', difficulty_level: 'easy' },
    { name: 'Evening Journaling', description: 'Reflect on the day\'s lessons', difficulty_level: 'medium' },
    { name: 'Meditation Practice', description: '10 minutes of mindfulness', difficulty_level: 'medium' },
    { name: 'Learn Something New', description: 'Study a new topic or skill', difficulty_level: 'hard' },
  ],
  courage: [
    { name: 'Face a Fear', description: 'Do something outside comfort zone', difficulty_level: 'hard' },
    { name: 'Speak Up', description: 'Voice your opinion in a discussion', difficulty_level: 'medium' },
    { name: 'Cold Shower', description: 'Take a cold shower', difficulty_level: 'medium' },
    { name: 'Try New Activity', description: 'Attempt something unfamiliar', difficulty_level: 'easy' },
  ],
  temperance: [
    { name: 'Mindful Eating', description: 'Eat slowly and consciously', difficulty_level: 'easy' },
    { name: 'Digital Detox Hour', description: 'One hour without screens', difficulty_level: 'medium' },
    { name: 'Moderate Exercise', description: '30 minutes of gentle movement', difficulty_level: 'easy' },
    { name: 'Practice Patience', description: 'Pause before reacting', difficulty_level: 'hard' },
  ],
  justice: [
    { name: 'Act of Kindness', description: 'Help someone without expectation', difficulty_level: 'easy' },
    { name: 'Fairness Check', description: 'Ensure fair treatment in interactions', difficulty_level: 'medium' },
    { name: 'Community Service', description: 'Contribute to community wellbeing', difficulty_level: 'hard' },
    { name: 'Listen Actively', description: 'Truly listen without judgment', difficulty_level: 'medium' },
  ],
};

const MORNING_INTENTIONS = [
  'Today I will practice patience in difficult moments',
  'I choose to approach challenges with wisdom and calm',
  'I will be present and mindful in all my interactions',
  'Today I focus on being of service to others',
  'I embrace discomfort as a path to growth',
  'I will respond thoughtfully rather than react impulsively',
  'Today I seek to learn from every experience',
  'I will practice gratitude for what I have',
];

const REFLECTION_TEMPLATES = {
  morning: {
    intentions: MORNING_INTENTIONS,
    challenges: [
      'Meeting with difficult colleague',
      'Staying focused on long-term project',
      'Managing stress and anxiety',
      'Maintaining healthy boundaries',
      'Resisting unhealthy habits',
    ],
  },
  evening: {
    wins: [
      'Completed my meditation practice',
      'Had a meaningful conversation',
      'Stayed calm during a stressful situation',
      'Made progress on my goals',
      'Practiced kindness with a stranger',
      'Learned something valuable',
      'Helped someone in need',
    ],
    lessons: [
      'Patience is a practice, not a destination',
      'Small consistent actions lead to big changes',
      'I am more resilient than I think',
      'Listening is more powerful than speaking',
      'Discomfort is temporary, growth is lasting',
      'I can choose my response to any situation',
    ],
    gratitude: [
      'My health and ability to practice',
      'Supportive friends and family',
      'Opportunities to learn and grow',
      'The wisdom of philosophers past',
      'Moments of peace and clarity',
      'Challenges that strengthen me',
    ],
  },
};

const COACH_QUESTIONS = [
  'How can I stay calm when things don\'t go my way?',
  'What does it mean to live virtuously?',
  'How do I find meaning in difficult times?',
  'What practices help develop wisdom?',
  'How can I be more present in daily life?',
  'What is the relationship between virtue and happiness?',
  'How do I balance self-care with service to others?',
  'What role does community play in personal growth?',
];

const COACH_INSIGHTS = [
  'Remember, what disturbs people is not things, but their judgments about things.',
  'The obstacle is the way. What stands in the path becomes the path.',
  'You have power over your mind, not outside events. Realize this, and you will find strength.',
  'The best revenge is not to be like your enemy.',
  'Waste no more time arguing what a good person should be. Be one.',
  'The happiness of your life depends upon the quality of your thoughts.',
];

// Utility functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[randomInt(0, array.length - 1)];
}

function randomBool(probability = 0.5) {
  return Math.random() < probability;
}

function randomChoices(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Seed functions
async function seedHabitsForUser(userId, userVirtue) {
  console.log(`    Creating habits...`);
  
  // Create 3-5 habits per user, focused on their preferred virtue
  const habitCount = randomInt(3, 5);
  const habits = [];
  
  // Ensure at least 2 from preferred virtue
  const preferredHabits = randomChoices(HABITS_BY_VIRTUE[userVirtue], 2);
  habits.push(...preferredHabits);
  
  // Add random habits from other virtues
  const remainingCount = habitCount - habits.length;
  const otherVirtues = VIRTUES.filter(v => v !== userVirtue);
  for (let i = 0; i < remainingCount; i++) {
    const virtue = randomChoice(otherVirtues);
    const habit = randomChoice(HABITS_BY_VIRTUE[virtue]);
    habits.push(habit);
  }
  
  const createdHabits = [];
  for (let i = 0; i < habits.length; i++) {
    const habit = habits[i];
    const virtue = Object.keys(HABITS_BY_VIRTUE).find(v => 
      HABITS_BY_VIRTUE[v].some(h => h.name === habit.name)
    );
    
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name: habit.name,
        description: habit.description,
        virtue: virtue,
        difficulty_level: habit.difficulty_level,
        frequency: 'daily',
        is_active: true,
        sort_order: i,
      })
      .select()
      .single();
    
    if (error) {
      console.error(`      ❌ Error creating habit ${habit.name}:`, error.message);
    } else {
      createdHabits.push(data);
    }
  }
  
  console.log(`      ✓ Created ${createdHabits.length} habits`);
  return createdHabits;
}

async function seedHabitLogsForUser(userId, habits, startDate, endDate) {
  console.log(`    Creating habit logs...`);
  
  const logs = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  // Track streaks for realism
  const habitStreaks = habits.map(() => ({ current: 0, target: randomInt(5, 15) }));
  
  while (currentDate <= end) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    for (let i = 0; i < habits.length; i++) {
      const habit = habits[i];
      const streak = habitStreaks[i];
      
      // Realistic completion rate: 60-80% for easy, 50-70% for medium, 40-60% for hard
      let completionChance = 0.7;
      if (habit.difficulty_level === 'easy') completionChance = 0.75;
      if (habit.difficulty_level === 'hard') completionChance = 0.5;
      
      // Boost completion if we're in a streak
      if (streak.current > 0 && streak.current < streak.target) {
        completionChance += 0.15;
      }
      
      const completed = randomBool(completionChance);
      
      if (completed) {
        streak.current++;
        logs.push({
          user_id: userId,
          habit_id: habit.id,
          date: dateStr,
          value: 1,
          mood_after: randomChoice(['calm', 'energized', 'accomplished', 'peaceful']),
          notes: randomBool(0.3) ? randomChoice([
            'Felt great today!',
            'This is getting easier',
            'Struggled but pushed through',
            'Very rewarding',
          ]) : null,
        });
      } else {
        // Reset streak
        if (streak.current >= streak.target || randomBool(0.3)) {
          streak.current = 0;
          streak.target = randomInt(5, 15);
        }
      }
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  // Batch insert for performance
  const batchSize = 100;
  for (let i = 0; i < logs.length; i += batchSize) {
    const batch = logs.slice(i, i + batchSize);
    const { error } = await supabase.from('habit_logs').insert(batch);
    if (error) {
      console.error(`      ❌ Error inserting habit logs batch:`, error.message);
    }
  }
  
  console.log(`      ✓ Created ${logs.length} habit logs`);
  return logs.length;
}

async function seedReflectionsForUser(userId, userVirtue, startDate, endDate) {
  console.log(`    Creating reflections...`);
  
  const reflections = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (currentDate <= end) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // 70% chance of morning reflection
    if (randomBool(0.7)) {
      reflections.push({
        user_id: userId,
        date: dateStr,
        type: 'morning',
        virtue_focus: randomBool(0.7) ? userVirtue : randomChoice(VIRTUES),
        intention: randomChoice(REFLECTION_TEMPLATES.morning.intentions),
        challenge: randomChoice(REFLECTION_TEMPLATES.morning.challenges),
        mood: randomInt(6, 8),
      });
    }
    
    // 40% chance of midday reflection (less common)
    if (randomBool(0.4)) {
      reflections.push({
        user_id: userId,
        date: dateStr,
        type: 'midday',
        virtue_focus: userVirtue,
        journal_entry: 'Quick check-in: ' + randomChoice([
          'Feeling good about progress so far',
          'Need to refocus on intentions',
          'Managing challenges well',
          'Struggling a bit, but persisting',
        ]),
        mood: randomInt(5, 7),
      });
    }
    
    // 80% chance of evening reflection
    if (randomBool(0.8)) {
      const wins = randomChoices(REFLECTION_TEMPLATES.evening.wins, randomInt(1, 3));
      reflections.push({
        user_id: userId,
        date: dateStr,
        type: 'evening',
        virtue_focus: userVirtue,
        lesson: randomChoice(REFLECTION_TEMPLATES.evening.lessons),
        gratitude: randomChoice(REFLECTION_TEMPLATES.evening.gratitude),
        wins_celebrated: wins,
        mood: randomInt(6, 9),
      });
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  // Batch insert
  const batchSize = 50;
  for (let i = 0; i < reflections.length; i += batchSize) {
    const batch = reflections.slice(i, i + batchSize);
    const { error } = await supabase.from('reflections').insert(batch);
    if (error) {
      console.error(`      ❌ Error inserting reflections batch:`, error.message);
    }
  }
  
  console.log(`      ✓ Created ${reflections.length} reflections`);
  return reflections.length;
}

async function seedCoachConversationsForUser(userId, userVirtue, userPersona) {
  console.log(`    Creating coach conversations...`);
  
  // Create 2-4 conversations per user
  const conversationCount = randomInt(2, 4);
  const conversations = [];
  
  for (let i = 0; i < conversationCount; i++) {
    const persona = i === 0 ? 'marcus' : randomChoice(PERSONAS); // First one is always free Marcus
    
    const { data: conversation, error: convError } = await supabase
      .from('marcus_conversations')
      .insert({
        user_id: userId,
        title: randomChoice(COACH_QUESTIONS),
        virtue_focus: randomBool(0.7) ? userVirtue : randomChoice(VIRTUES),
        active_persona: persona,
        is_active: randomBool(0.5), // 50% still active
      })
      .select()
      .single();
    
    if (convError) {
      console.error(`      ❌ Error creating conversation:`, convError.message);
      continue;
    }
    
    // Create 2-6 messages per conversation
    const messageCount = randomInt(2, 6);
    const messages = [];
    
    for (let j = 0; j < messageCount; j++) {
      // Alternate between user and assistant
      const isUserMessage = j % 2 === 0;
      
      messages.push({
        user_id: userId,
        conversation_id: conversation.id,
        role: isUserMessage ? 'user' : 'assistant',
        content: isUserMessage 
          ? randomChoice(COACH_QUESTIONS)
          : randomChoice(COACH_INSIGHTS),
        persona_id: persona,
        message_order: j,
      });
    }
    
    const { error: msgError } = await supabase
      .from('marcus_messages')
      .insert(messages);
    
    if (msgError) {
      console.error(`      ❌ Error creating messages:`, msgError.message);
    } else {
      conversations.push(conversation);
    }
  }
  
  console.log(`      ✓ Created ${conversations.length} conversations with messages`);
  return conversations;
}

async function seedCommunityPostsForUser(userId, displayName, userVirtue) {
  if (!displayName) return 0; // Skip if community not enabled
  
  console.log(`    Creating community posts...`);
  
  // Create 1-3 posts per community-enabled user
  const postCount = randomInt(1, 3);
  const posts = [];
  
  const reflectionContent = [
    {
      text: 'Today I learned that patience truly is a virtue. When faced with delays, I chose calm over frustration.',
      type: 'evening',
      summary: 'Practiced patience during unexpected delays',
      highlights: ['Chose calm over frustration', 'Patience is an active practice'],
    },
    {
      text: 'Morning meditation helped me find clarity before a challenging day. Small practices, big impact.',
      type: 'morning',
      summary: 'Found clarity through meditation',
      highlights: ['10 minutes of mindful breathing', 'Set clear intentions for the day'],
    },
    {
      text: 'Grateful for the wisdom in Meditations. "The impediment to action advances action."',
      type: 'evening',
      summary: 'Reflecting on Stoic wisdom',
      highlights: ['The obstacle is the way', 'Grateful for philosophical guidance'],
    },
  ];
  
  const chatContent = [
    {
      text: 'Had an insightful conversation about dealing with difficult people. The key is to focus on what we can control.',
      persona: 'marcus',
      personaName: 'Marcus Aurelius',
      insight: 'Focus on what you can control',
    },
    {
      text: 'Discussing the nature of virtue with my AI coach. Interesting perspective on courage vs. recklessness.',
      persona: 'aristotle',
      personaName: 'Aristotle',
      insight: 'Courage is the mean between cowardice and recklessness',
    },
    {
      text: 'Marcus reminded me today: "You have power over your mind, not outside events."',
      persona: 'marcus',
      personaName: 'Marcus Aurelius',
      insight: 'Inner power transcends external circumstances',
    },
  ];
  
  for (let i = 0; i < postCount; i++) {
    const useReflection = randomBool(0.5);
    const daysAgo = randomInt(0, 30); // Posts from last 30 days
    const postDate = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
    
    if (useReflection) {
      const reflection = randomChoice(reflectionContent);
      posts.push({
        user_id: userId,
        display_name: displayName,
        content_type: 'reflection',
        content_text: reflection.text,
        content_metadata: {
          reflection_type: reflection.type,
          fields_shared: ['intention', 'gratitude', 'lesson'],
          include_virtue: true,
          summary: reflection.summary,
          highlights: reflection.highlights,
          mood: randomInt(7, 9),
        },
        virtue: randomBool(0.7) ? userVirtue : randomChoice(VIRTUES),
        persona_id: null,
        share_method: null,
        is_visible: true,
        reaction_count: randomInt(0, 15),
        original_date: postDate,
      });
    } else {
      const chat = randomChoice(chatContent);
      const persona = randomChoice(PERSONAS);
      posts.push({
        user_id: userId,
        display_name: displayName,
        content_type: 'chat',
        content_text: chat.text,
        content_metadata: {
          conversation_id: 'seed-conv-' + randomInt(1000, 9999),
          share_method: 'excerpt',
          coach_name: chat.personaName,
          persona_id: chat.persona,
          messages: [
            { role: 'user', content: 'How do I handle difficult situations with grace?' },
            { role: 'assistant', content: chat.text },
          ],
          context: chat.insight,
        },
        virtue: randomBool(0.7) ? userVirtue : randomChoice(VIRTUES),
        persona_id: chat.persona,
        share_method: 'excerpt',
        is_visible: true,
        reaction_count: randomInt(0, 15),
        original_date: postDate,
      });
    }
  }
  
  const { error } = await supabase.from('community_posts').insert(posts);
  
  if (error) {
    console.error(`      ❌ Error creating community posts:`, error.message);
    return 0;
  }
  
  console.log(`      ✓ Created ${posts.length} community posts`);
  return posts.length;
}

async function seedDailyProgressForUser(userId, userVirtue, habits, startDate, endDate) {
  console.log(`    Creating daily progress records...`);
  
  const progressRecords = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  let currentStreak = 0;
  let maxStreak = 0;
  
  while (currentDate <= end) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Get habit logs for this day
    const { data: dayLogs } = await supabase
      .from('habit_logs')
      .select('habit_id, value')
      .eq('user_id', userId)
      .eq('date', dateStr);
    
    const completedCount = dayLogs?.length || 0;
    const totalHabits = habits.length;
    const completionRate = totalHabits > 0 ? (completedCount / totalHabits) : 0;
    
    // Check for reflections
    const { data: reflections } = await supabase
      .from('reflections')
      .select('type')
      .eq('user_id', userId)
      .eq('date', dateStr);
    
    const hasMorning = reflections?.some(r => r.type === 'morning') || false;
    const hasEvening = reflections?.some(r => r.type === 'evening') || false;
    
    // Calculate virtue scores based on completed habits
    const virtueScores = { wisdom: 0, justice: 0, temperance: 0, courage: 0 };
    
    if (dayLogs) {
      for (const log of dayLogs) {
        const habit = habits.find(h => h.id === log.habit_id);
        if (habit && habit.virtue) {
          virtueScores[habit.virtue] = (virtueScores[habit.virtue] || 0) + (log.value || 1);
        }
      }
    }
    
    // Normalize virtue scores (0-100 scale based on habits per virtue)
    const normalizeScore = (virtue, score) => {
      const habitsForVirtue = habits.filter(h => h.virtue === virtue).length;
      if (habitsForVirtue === 0) return 0;
      return Math.min(100, (score / habitsForVirtue) * 100);
    };
    
    const wisdomScore = normalizeScore('wisdom', virtueScores.wisdom);
    const justiceScore = normalizeScore('justice', virtueScores.justice);
    const temperanceScore = normalizeScore('temperance', virtueScores.temperance);
    const courageScore = normalizeScore('courage', virtueScores.courage);
    
    // Calculate return score (average virtue score * completion rate)
    const avgVirtueScore = (wisdomScore + justiceScore + temperanceScore + courageScore) / 4;
    const returnScore = avgVirtueScore * completionRate;
    
    // Update streak
    if (completionRate >= 0.5 || hasMorning || hasEvening) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
    
    // Get morning intention from morning reflection
    let morningIntention = null;
    if (hasMorning) {
      const { data: morningRef } = await supabase
        .from('reflections')
        .select('intention')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .eq('type', 'morning')
        .single();
      
      morningIntention = morningRef?.intention;
    }
    
    progressRecords.push({
      user_id: userId,
      date: dateStr,
      morning_intention: morningIntention,
      habits_completed: completedCount,
      completion_rate: Math.round(completionRate * 100) / 100,
      return_score: Math.round(returnScore * 100) / 100,
      streak_days: currentStreak,
      wisdom_score: Math.round(wisdomScore * 100) / 100,
      justice_score: Math.round(justiceScore * 100) / 100,
      temperance_score: Math.round(temperanceScore * 100) / 100,
      courage_score: Math.round(courageScore * 100) / 100,
      morning_reflection_complete: hasMorning,
      evening_reflection_complete: hasEvening,
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  // Batch insert
  const batchSize = 50;
  for (let i = 0; i < progressRecords.length; i += batchSize) {
    const batch = progressRecords.slice(i, i + batchSize);
    const { error } = await supabase.from('daily_progress').insert(batch);
    if (error) {
      console.error(`      ❌ Error inserting daily progress batch:`, error.message);
    }
  }
  
  console.log(`      ✓ Created ${progressRecords.length} daily progress records (max streak: ${maxStreak} days)`);
  return progressRecords.length;
}

async function seedDataForUser(user, index, total) {
  console.log(`\n[${index + 1}/${total}] Seeding data for ${user.email}...`);
  
  try {
    const endDate = new Date();
    const startDate = subDays(endDate, DAYS_OF_DATA);
    
    // 1. Create habits
    const habits = await seedHabitsForUser(user.id, user.preferred_virtue);
    
    // 2. Create habit logs
    await seedHabitLogsForUser(user.id, habits, startDate, endDate);
    
    // 3. Create reflections
    await seedReflectionsForUser(user.id, user.preferred_virtue, startDate, endDate);
    
    // 4. Create daily progress (after habits and reflections exist)
    await seedDailyProgressForUser(user.id, user.preferred_virtue, habits, startDate, endDate);
    
    // 5. Create coach conversations
    await seedCoachConversationsForUser(user.id, user.preferred_virtue, user.preferred_persona);
    
    // 6. Create community posts (if community enabled)
    if (user.community_enabled && user.display_name) {
      await seedCommunityPostsForUser(user.id, user.display_name, user.preferred_virtue);
    }
    
    console.log(`  ✅ Completed seeding for ${user.email}`);
    return { success: true, email: user.email };
    
  } catch (error) {
    console.error(`  ❌ Error seeding data for ${user.email}:`, error.message);
    return { success: false, email: user.email, error: error.message };
  }
}

async function main() {
  console.log('🌱 Starting comprehensive data seeding...\n');
  console.log(`Generating ${MONTHS_OF_DATA} months (~${DAYS_OF_DATA} days) of data per user\n`);
  console.log('=' .repeat(60) + '\n');
  
  // Fetch all non-admin users
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, preferred_virtue, preferred_persona, display_name, community_enabled')
    .eq('is_admin', false);
  
  if (profileError) {
    console.error('❌ Error fetching users:', profileError.message);
    return;
  }
  
  console.log(`Found ${profiles.length} users to seed\n`);
  
  // Get auth users to get email
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('❌ Error fetching auth users:', usersError.message);
    return;
  }
  
  // Merge profile and auth data
  const usersToSeed = profiles.map(profile => {
    const authUser = users.find(u => u.id === profile.user_id);
    return {
      id: profile.user_id,
      email: authUser?.email || 'unknown',
      preferred_virtue: profile.preferred_virtue || 'wisdom',
      preferred_persona: profile.preferred_persona || 'marcus',
      display_name: profile.display_name,
      community_enabled: profile.community_enabled,
    };
  });
  
  const results = [];
  
  for (let i = 0; i < usersToSeed.length; i++) {
    const result = await seedDataForUser(usersToSeed[i], i, usersToSeed.length);
    results.push(result);
    
    // Small delay between users
    if (i < usersToSeed.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 SEEDING SUMMARY\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${usersToSeed.length}`);
  console.log(`❌ Failed: ${failed.length}/${usersToSeed.length}`);
  
  if (failed.length > 0) {
    console.log('\nFailed users:');
    failed.forEach(f => console.log(`  - ${f.email}: ${f.error}`));
  }
  
  console.log('\n📈 Data Generated Per User (approximately):');
  console.log(`  - Habits: 3-5`);
  console.log(`  - Habit Logs: ~500-700 (over ${DAYS_OF_DATA} days)`);
  console.log(`  - Reflections: ~200-300 (morning/evening over ${DAYS_OF_DATA} days)`);
  console.log(`  - Coach Conversations: 2-4 with 2-6 messages each`);
  console.log(`  - Community Posts: 1-3 (if community enabled)`);
  
  console.log('\n✅ Seeding complete!\n');
}

main();
