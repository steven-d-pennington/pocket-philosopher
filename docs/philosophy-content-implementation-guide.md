# Philosophy Content Ingestion - Implementation Guide

## Quick Start: Adding Your First Philosopher

This guide walks through adding Aristotle to the corpus as a practical example.

### Step 1: Research & Content Selection

**Primary Sources to Review:**
- Nicomachean Ethics (Books I, II, VI, X)
- Politics (Book III on citizenship)
- Stanford Encyclopedia of Philosophy: "Aristotle's Ethics"

**Key Passages to Extract:**
1. **The Golden Mean** (Nicomachean Ethics, Book II)
2. **Eudaimonia** (Nicomachean Ethics, Book I)
3. **Practical Wisdom** (Nicomachean Ethics, Book VI)
4. **Friendship** (Nicomachean Ethics, Book VIII)
5. **Contemplation** (Nicomachean Ethics, Book X)

### Step 2: Content Structuring

Create `data/corpus/aristotle-content.json`:

```json
{
  "works": [
    {
      "title": "Nicomachean Ethics",
      "author": "Aristotle",
      "tradition": "aristotelian",
      "era": "ancient",
      "sections": [
        {
          "title": "The Golden Mean",
          "content": "Virtue, then, is a state of character concerned with choice, lying in a mean, i.e. the mean relative to us, this being determined by a rational principle, and by that principle by which the man of practical wisdom would determine it. Now it is a mean between two vices, that which depends on excess and that which depends on defect; and again it is a mean because the vices respectively fall short of or exceed what is right in both passions and actions, while virtue both finds and chooses that which is intermediate.",
          "virtue": "temperance",
          "persona_tags": ["aristotle", "ethics", "golden_mean"],
          "key_concepts": ["virtue ethics", "practical wisdom", "eudaimonia"],
          "applications": ["decision making", "habit formation", "emotional balance"]
        },
        {
          "title": "Eudaimonia",
          "content": "If, then, there is some end of the things we do, which we desire for its own sake (everything else being desired for the sake of this), and if we do not choose everything for the sake of something else (for at that rate the process would go on to infinity, so that our desire would be empty and vain), clearly this must be the good and the chief good. Will not the knowledge of it, then, have a great influence on life? Shall we not, like archers who have a mark to aim at, be more likely to hit upon what is right?",
          "virtue": "wisdom",
          "persona_tags": ["aristotle", "ethics", "eudaimonia"],
          "key_concepts": ["human flourishing", "chief good", "purpose"],
          "applications": ["goal setting", "life purpose", "meaning"]
        }
      ]
    }
  ]
}
```

### Step 3: Persona Profile Creation

Add to `lib/ai/personas.ts`:

```typescript
aristotle: {
  id: "aristotle",
  name: "Aristotle",
  title: "Practical Philosopher",
  tradition: "aristotelian",
  voice: "Analytical yet approachable, emphasizing systematic inquiry and practical application.",
  focus: "Guide users toward eudaimonia through balanced character development and practical wisdom.",
  virtues: ["practical_wisdom", "temperance", "justice", "courage"],
  signaturePractices: ["virtue assessment", "golden mean reflection", "character examination"],
  conversationStyle: "Systematic analysis of situations followed by concrete steps toward virtue development.",
  knowledgeTags: ["aristotle", "ethics", "golden_mean", "eudaimonia", "virtue_ethics"],
  defaultModel: "gpt-4o-mini",
  temperature: 0.6,
  toneChecks: [
    "Maintain analytical clarity while being encouraging",
    "Connect ancient wisdom to modern applications",
    "Emphasize balance and moderation in all things",
  ],
  closingReminder: "Invite the user to identify one virtue they can practice more fully today.",
  microActionExamples: [
    "Assess a recent decision using the golden mean framework",
    "Identify one character strength to cultivate this week",
    "Reflect on how a current challenge develops virtue",
  ],
},
```

### Step 4: Content Ingestion

**Prerequisites:**
- Supabase running locally (`npx supabase start`)
- OpenAI API key configured
- Database schema deployed

**Ingestion Process:**
```bash
# Merge new content into main corpus
node scripts/merge-corpus.js aristotle-content.json

# Run ingestion script
npx tsx scripts/ingest-corpus.ts

# Validate ingestion
npx tsx scripts/validate-corpus.js
```

### Step 5: Testing & Validation

**Unit Tests:**
```typescript
// Test retrieval for Aristotle content
describe("Aristotle Content Retrieval", () => {
  it("retrieves golden mean content for virtue queries", async () => {
    const results = await retrievePhilosophicalContent({
      query: "How do I find balance in my decisions?",
      persona: "aristotle",
      limit: 3
    });

    expect(results.some(r => r.virtue === "temperance")).toBe(true);
    expect(results.some(r => r.persona_tags.includes("golden_mean"))).toBe(true);
  });
});
```

**Integration Tests:**
- Test conversation flow with Aristotle persona
- Validate content relevance for ethical dilemmas
- Check response quality and philosophical accuracy

## Content Research Templates

### Philosopher Research Checklist
- [ ] **Core Texts**: Identify 3-5 primary works
- [ ] **Key Concepts**: List 5-8 fundamental ideas
- [ ] **Historical Context**: Brief biography and cultural background
- [ ] **Modern Applications**: How ideas apply to contemporary life
- [ ] **Virtue Connections**: Map to cardinal virtues or tradition-specific values
- [ ] **Distinctive Voice**: Unique conversational style and emphases

### Content Quality Criteria
- [ ] **Authenticity**: Based on primary sources or faithful scholarship
- [ ] **Accessibility**: Clear language while preserving depth
- [ ] **Actionability**: Suggests practical applications
- [ ] **Balance**: Represents philosopher's full range of thought
- [ ] **Context**: Includes necessary historical/cultural background

## Batch Processing Workflow

### Weekly Content Pipeline
1. **Monday**: Research and content selection for 2 philosophers
2. **Tuesday**: Content structuring and persona profile creation
3. **Wednesday**: Technical implementation and ingestion
4. **Thursday**: Testing, validation, and quality assurance
5. **Friday**: Integration testing and deployment preparation

### Quality Gates
- **Content Review**: Philosophical accuracy verified by subject matter expert
- **Technical Review**: Code quality and performance validated
- **User Testing**: Conversation flows tested with sample queries
- **Performance Testing**: Retrieval latency and relevance scores validated

## Monitoring & Maintenance

### Content Metrics to Track
- Retrieval relevance scores
- User engagement by philosopher
- Content usage patterns
- Philosophical accuracy feedback

### Maintenance Tasks
- Regular content quality audits
- Update outdated references
- Add contemporary applications
- Expand underrepresented traditions

## Getting Started Checklist

- [ ] Review existing corpus structure in `data/corpus/philosophy-corpus.json`
- [ ] Study ingestion script `scripts/ingest-corpus.ts`
- [ ] Examine persona profiles in `lib/ai/personas.ts`
- [ ] Set up local Supabase environment
- [ ] Configure OpenAI API key
- [ ] Run existing ingestion to understand pipeline
- [ ] Begin with Aristotle as first addition
- [ ] Test complete flow from content to conversation

This implementation guide provides a systematic approach to expanding the philosophical knowledge base while maintaining quality and performance standards.