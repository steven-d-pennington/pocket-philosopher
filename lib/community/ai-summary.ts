/**
 * Community Features - AI Summary Generation
 * Created: 2025-10-04
 */

import { getPersonaProfile } from '@/lib/ai/personas';
import type { SummaryRequest, SummaryResponse } from './types';

// ============================================================================
// Summary Prompts
// ============================================================================

function buildSummaryPrompt(personaId: string, messages: any[]): string {
  const persona = getPersonaProfile(personaId);
  
  const conversationText = messages
    .map((msg) => {
      const role = msg.role === 'user' ? 'Seeker' : persona.name;
      return `${role}: ${msg.content}`;
    })
    .join('\n\n');

  return `You are ${persona.name}, ${persona.title}.

A seeker had an insightful conversation with you and wants to share the key wisdom with their community.

Conversation:
${conversationText}

Create a brief summary (2-3 sentences, maximum 200 tokens) that captures the core philosophical insight from this exchange. Write in your authentic voice as ${persona.name}. Focus on the universal wisdom, not specific personal details of the seeker.

Summary:`;
}

// ============================================================================
// Generate Summary
// ============================================================================

export async function generateChatSummary(
  request: SummaryRequest
): Promise<SummaryResponse> {
  const { conversation_id, user_id, persona_id, max_tokens = 200 } = request;

  try {
    // Fetch conversation messages
    const messages = await fetchConversationMessages(conversation_id, user_id);

    if (!messages || messages.length === 0) {
      throw new Error('No messages found in conversation');
    }

    // Build prompt
    const prompt = buildSummaryPrompt(persona_id, messages);
    
    const persona = getPersonaProfile(persona_id);

    // TODO: Integrate with AI orchestrator for actual summary generation
    // For now, return a placeholder that will be implemented in API route
    
    return {
      summary: '',
      persona: persona_id,
      token_count: 0,
      error: 'AI summary generation not yet implemented - use excerpt mode',
    };
  } catch (error) {
    return {
      summary: '',
      persona: persona_id,
      token_count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Helper: Fetch Conversation Messages
// ============================================================================

async function fetchConversationMessages(
  conversationId: string,
  userId: string
): Promise<any[]> {
  const { createSupabaseServerClient } = await import('@/lib/supabase/server-client');
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('marcus_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching conversation messages', { error, conversationId });
    throw error;
  }

  return data || [];
}

// ============================================================================
// Persona-Specific Summary Templates
// ============================================================================

export const summaryTemplates: Record<string, string> = {
  marcus: `As a Stoic emperor, summarize this conversation's core wisdom. Focus on virtue, duty, and acceptance of what we cannot control.`,
  
  epictetus: `As a Stoic teacher, distill the essential lesson from this conversation. Emphasize the dichotomy of control and proper use of impressions.`,
  
  lao: `As a Taoist sage, capture the essence of this exchange in simple, poetic terms. Highlight naturalness, simplicity, and the Way.`,
  
  simone: `As an existentialist philosopher, summarize the key insight about freedom, authenticity, and responsibility from this dialogue.`,
  
  aristotle: `As a virtue ethicist, extract the core teaching about eudaimonia and character from this conversation.`,
  
  plato: `As a classical philosopher, summarize the dialectical insight gained, focusing on truth and the Good.`,
};

// ============================================================================
// Batch Summary Generation (for future use)
// ============================================================================

export async function generateBatchSummaries(
  requests: SummaryRequest[]
): Promise<SummaryResponse[]> {
  const promises = requests.map((req) => generateChatSummary(req));
  return Promise.all(promises);
}
