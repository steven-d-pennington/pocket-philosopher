import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// For development seeding, we'll use the anon key
// Note: This requires temporarily modifying RLS policies to allow inserts
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test users with rich datasets
const testUsers = [
  {
    email: 'alex.johnson@example.com',
    password: 'testpass123',
    profile: {
      preferred_virtue: 'wisdom',
      preferred_persona: 'marcus',
      experience_level: 'intermediate',
      daily_practice_time: '07:30:00',
      timezone: 'America/New_York',
      notifications_enabled: true,
      privacy_level: 'public',
      onboarding_complete: true,
      is_admin: false
    }
  },
  {
    email: 'sara.chen@example.com',
    password: 'testpass123',
    profile: {
      preferred_virtue: 'courage',
      preferred_persona: 'zhuangzi',
      experience_level: 'advanced',
      daily_practice_time: '06:00:00',
      timezone: 'America/Los_Angeles',
      notifications_enabled: true,
      privacy_level: 'private',
      onboarding_complete: true,
      is_admin: false
    }
  },
  {
    email: 'mike.rodriguez@example.com',
    password: 'testpass123',
    profile: {
      preferred_virtue: 'temperance',
      preferred_persona: 'sartre',
      experience_level: 'beginner',
      daily_practice_time: '08:00:00',
      timezone: 'Europe/London',
      notifications_enabled: false,
      privacy_level: 'friends_only',
      onboarding_complete: false,
      is_admin: true
    }
  }
];

// Habits data for each user
const habitsData: Record<string, any[]> = {
  'alex.johnson@example.com': [
    {
      name: 'Morning Meditation',
      description: '10 minutes of focused breathing and mindfulness',
      virtue: 'wisdom',
      tracking_type: 'boolean',
      target_value: null,
      difficulty_level: 'easy',
      frequency: 'daily',
      active_days: [1, 2, 3, 4, 5, 6, 7],
      reminder_time: '07:00:00',
      is_active: true,
      sort_order: 1
    },
    {
      name: 'Reading Philosophy',
      description: 'Read philosophical texts for personal growth',
      virtue: 'wisdom',
      tracking_type: 'numeric',
      target_value: 30,
      difficulty_level: 'medium',
      frequency: 'daily',
      active_days: [1, 2, 3, 4, 5, 6, 7],
      reminder_time: '19:00:00',
      is_active: true,
      sort_order: 2
    },
    {
      name: 'Gratitude Journal',
      description: 'Write down 3 things I\'m grateful for',
      virtue: 'temperance',
      tracking_type: 'boolean',
      target_value: null,
      difficulty_level: 'easy',
      frequency: 'daily',
      active_days: [1, 2, 3, 4, 5, 6, 7],
      reminder_time: '21:00:00',
      is_active: true,
      sort_order: 3
    }
  ],
  'sara.chen@example.com': [
    {
      name: 'Exercise Routine',
      description: '45-minute workout session',
      virtue: 'courage',
      tracking_type: 'boolean',
      target_value: null,
      difficulty_level: 'hard',
      frequency: 'daily',
      active_days: [1, 3, 5],
      reminder_time: '06:30:00',
      is_active: true,
      sort_order: 1
    },
    {
      name: 'Mindful Eating',
      description: 'Eat meals without distractions',
      virtue: 'temperance',
      tracking_type: 'boolean',
      target_value: null,
      difficulty_level: 'medium',
      frequency: 'daily',
      active_days: [1, 2, 3, 4, 5, 6, 7],
      reminder_time: null,
      is_active: true,
      sort_order: 2
    },
    {
      name: 'Creative Writing',
      description: 'Write 500 words of creative content',
      virtue: 'wisdom',
      tracking_type: 'numeric',
      target_value: 500,
      difficulty_level: 'medium',
      frequency: 'weekly',
      active_days: [7],
      reminder_time: '10:00:00',
      is_active: true,
      sort_order: 3
    }
  ],
  'mike.rodriguez@example.com': [
    {
      name: 'Learn New Skill',
      description: 'Spend 30 minutes learning something new',
      virtue: 'wisdom',
      tracking_type: 'boolean',
      target_value: null,
      difficulty_level: 'medium',
      frequency: 'daily',
      active_days: [1, 2, 3, 4, 5],
      reminder_time: '20:00:00',
      is_active: true,
      sort_order: 1
    },
    {
      name: 'Digital Detox',
      description: 'No screens for 2 hours before bed',
      virtue: 'temperance',
      tracking_type: 'boolean',
      target_value: null,
      difficulty_level: 'hard',
      frequency: 'daily',
      active_days: [1, 2, 3, 4, 5, 6, 7],
      reminder_time: '21:00:00',
      is_active: true,
      sort_order: 2
    }
  ]
};

// Reflections data
const reflectionsData: Record<string, any[]> = {
  'alex.johnson@example.com': [
    {
      date: '2025-09-25',
      virtue: 'wisdom',
      content: 'Today I practiced patience during a difficult work meeting. Instead of reacting impulsively, I took a moment to breathe and respond thoughtfully. This helped de-escalate the situation and led to a more productive conversation.',
      mood_before: 'frustrated',
      mood_after: 'calm',
      practice_type: 'reflection'
    },
    {
      date: '2025-09-24',
      virtue: 'temperance',
      content: 'I noticed myself getting caught up in social media scrolling. I put down my phone and spent 20 minutes meditating instead. The clarity I gained was worth it.',
      mood_before: 'restless',
      mood_after: 'peaceful',
      practice_type: 'reflection'
    }
  ],
  'sara.chen@example.com': [
    {
      date: '2025-09-25',
      virtue: 'courage',
      content: 'I had a difficult conversation with my manager about my career goals. It was uncomfortable but necessary. I\'m proud of myself for speaking up.',
      mood_before: 'anxious',
      mood_after: 'empowered',
      practice_type: 'reflection'
    },
    {
      date: '2025-09-23',
      virtue: 'temperance',
      content: 'Practiced mindful eating during lunch. Instead of rushing through my meal while working, I took time to appreciate the food and the company. It made the experience much more enjoyable.',
      mood_before: 'distracted',
      mood_after: 'present',
      practice_type: 'reflection'
    }
  ],
  'mike.rodriguez@example.com': [
    {
      date: '2025-09-25',
      virtue: 'wisdom',
      content: 'Started learning about Stoic philosophy. The concept of focusing on what I can control versus what I can\'t control is really resonating with me.',
      mood_before: 'confused',
      mood_after: 'curious',
      practice_type: 'reflection'
    }
  ]
};

// Purchases data
const purchasesData = [
  {
    user_email: 'alex.johnson@example.com',
    product_id: 'premium_subscription',
    amount: 29.99,
    currency: 'USD',
    status: 'completed',
    purchase_date: '2025-09-20',
    metadata: { plan: 'monthly', features: ['unlimited_reflections', 'advanced_analytics'] }
  },
  {
    user_email: 'sara.chen@example.com',
    product_id: 'persona_unlock',
    amount: 9.99,
    currency: 'USD',
    status: 'completed',
    purchase_date: '2025-09-15',
    metadata: { persona: 'zhuangzi', type: 'unlock' }
  }
];

async function createTestData() {
  console.log('🌱 Starting simplified development seed script...');

  try {
    // Use the existing user ID that we know works
    const existingUserId = 'dd9fc783-61c7-4961-9c70-3e11abef9407';

    console.log(`\n📧 Updating existing user profile with rich data...`);

    // Update the existing profile with more interesting data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        preferred_virtue: 'wisdom',
        preferred_persona: 'marcus',
        experience_level: 'intermediate',
        daily_practice_time: '07:30:00',
        timezone: 'America/New_York',
        notifications_enabled: true,
        privacy_level: 'public',
        onboarding_complete: true,
        is_admin: true, // Make this user admin for testing
        updated_at: new Date().toISOString()
      })
      .eq('user_id', existingUserId);

    if (profileError) {
      console.error(`  ❌ Failed to update profile:`, profileError);
    } else {
      console.log(`  ✅ Updated profile for existing user`);
    }

    // Create habits for the existing user
    const habits = [
      {
        name: 'Morning Meditation',
        description: '10 minutes of focused breathing and mindfulness',
        virtue: 'wisdom',
        tracking_type: 'boolean',
        target_value: null,
        difficulty_level: 'easy',
        frequency: 'daily',
        active_days: [1, 2, 3, 4, 5, 6, 7],
        reminder_time: '07:00:00',
        is_active: true,
        sort_order: 1
      },
      {
        name: 'Reading Philosophy',
        description: 'Read philosophical texts for personal growth',
        virtue: 'wisdom',
        tracking_type: 'numeric',
        target_value: 30,
        difficulty_level: 'medium',
        frequency: 'daily',
        active_days: [1, 2, 3, 4, 5, 6, 7],
        reminder_time: '19:00:00',
        is_active: true,
        sort_order: 2
      },
      {
        name: 'Gratitude Journal',
        description: 'Write down 3 things I am grateful for',
        virtue: 'temperance',
        tracking_type: 'boolean',
        target_value: null,
        difficulty_level: 'easy',
        frequency: 'daily',
        active_days: [1, 2, 3, 4, 5, 6, 7],
        reminder_time: '21:00:00',
        is_active: true,
        sort_order: 3
      }
    ];

    for (const habit of habits) {
      const { error: habitError } = await supabase
        .from('habits')
        .insert({
          user_id: existingUserId,
          ...habit,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (habitError) {
        console.error(`  ❌ Failed to create habit "${habit.name}":`, habitError);
      } else {
        console.log(`  ✅ Created habit: ${habit.name}`);
      }
    }

    // Create some reflections
    const reflections = [
      {
        date: new Date().toISOString().split('T')[0],
        virtue: 'wisdom',
        content: 'Today I practiced patience during a difficult work meeting. Instead of reacting impulsively, I took a moment to breathe and respond thoughtfully. This helped de-escalate the situation and led to a more productive conversation.',
        mood_before: 'frustrated',
        mood_after: 'calm',
        practice_type: 'reflection'
      },
      {
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        virtue: 'temperance',
        content: 'I noticed myself getting caught up in social media scrolling. I put down my phone and spent 20 minutes meditating instead. The clarity I gained was worth it.',
        mood_before: 'restless',
        mood_after: 'peaceful',
        practice_type: 'reflection'
      }
    ];

    for (const reflection of reflections) {
      const { error: reflectionError } = await supabase
        .from('reflections')
        .insert({
          user_id: existingUserId,
          ...reflection,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (reflectionError) {
        console.error(`  ❌ Failed to create reflection:`, reflectionError);
      } else {
        console.log(`  ✅ Created reflection for ${reflection.date}`);
      }
    }

    console.log('\n🎉 Development seed script completed!');
    console.log('\n📊 Test Data Created:');
    console.log(`  • Updated profile for existing user (${existingUserId})`);
    console.log(`  • Created ${habits.length} habits`);
    console.log(`  • Created ${reflections.length} reflections`);

  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
}

createTestData();