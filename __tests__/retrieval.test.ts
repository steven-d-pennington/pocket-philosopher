import type { SupabaseClient } from "@supabase/supabase-js";

import { retrieveKnowledgeForCoach } from "../lib/ai/retrieval";
import { getPersonaProfile } from "../lib/ai/personas";

jest.mock("../lib/ai/provider-registry", () => ({
  getActiveEmbeddingProvider: jest.fn(),
  recordProviderSuccess: jest.fn(),
  recordProviderFailure: jest.fn(),
}));

const { getActiveEmbeddingProvider, recordProviderSuccess } = jest.requireMock(
  "../lib/ai/provider-registry",
);

type BuilderOptions = {
  rows: Array<Record<string, any>>;
};

class QueryBuilder {
  private rows: Array<Record<string, any>>;
  private limitCount: number | null = null;

  constructor(options: BuilderOptions) {
    this.rows = options.rows;
  }

  select() {
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  order() {
    return this;
  }

  overlaps(_column: string, tags: string[]) {
    if (Array.isArray(tags) && tags.length > 0) {
      this.rows = this.rows.filter((row) =>
        Array.isArray(row.persona_tags)
          ? row.persona_tags.some((tag: string) => tags.includes(tag))
          : false,
      );
    }
    return this;
  }

  textSearch(_column: string, query: string) {
    if (query) {
      const tokens = query
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      this.rows = this.rows.filter((row) => {
        const content = String(row.content ?? "").toLowerCase();
        return tokens.some((token) => content.includes(token));
      });
    }
    return this;
  }

  not(_column: string, _operator: string, clause: string) {
    const ids = clause
      .replace(/[()']/g, "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (ids.length > 0) {
      this.rows = this.rows.filter((row) => !ids.includes(String(row.id)));
    }
    return this;
  }

  then<TResult>(resolve: (value: { data: any[]; error: null }) => TResult): TResult {
    const limited = this.limitCount ? this.rows.slice(0, this.limitCount) : this.rows;
    return resolve({ data: limited, error: null });
  }

  catch() {
    return this;
  }
}

describe("retrieveKnowledgeForCoach", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("combines embeddings, keyword filters, and caching for persona retrieval", async () => {
    const now = new Date("2024-03-01T12:00:00Z").toISOString();
    const personaRows = [
      {
        id: "persona-1",
        work: "Meditations",
        author: "Marcus Aurelius",
        tradition: "stoicism",
        section: "Book 3",
        virtue: "courage",
        persona_tags: ["marcus"],
        content: "Remember that fear is a choice; courage is trained daily.",
        embedding: [0.9, 0.1, 0],
        metadata: {},
        created_at: now,
      },
      {
        id: "persona-2",
        work: "Meditations",
        author: "Marcus Aurelius",
        tradition: "stoicism",
        section: "Book 6",
        virtue: "temperance",
        persona_tags: ["marcus"],
        content: "Discipline in thought prepares stoic courage in action.",
        embedding: [0.6, 0.2, 0.1],
        metadata: {},
        created_at: now,
      },
    ];

    const fallbackRows = [
      {
        id: "fallback-1",
        work: "Letters from a Stoic",
        author: "Seneca",
        tradition: "stoicism",
        section: "Letter 13",
        virtue: "courage",
        persona_tags: ["stoicism"],
        content: "True courage is quiet and deliberate.",
        embedding: [0.8, 0.1, 0],
        metadata: {},
        created_at: now,
      },
      {
        id: "fallback-2",
        work: "Discourses",
        author: "Epictetus",
        tradition: "stoicism",
        section: "1.1",
        virtue: "discipline",
        persona_tags: ["epictetus"],
        content: "Control the controllable and release the rest.",
        embedding: [0.4, 0.3, 0.4],
        metadata: {},
        created_at: now,
      },
    ];

    let callIndex = 0;
    const supabase = {
      from: jest.fn(() => {
        const rows = callIndex === 0 ? personaRows : fallbackRows;
        callIndex += 1;
        return new QueryBuilder({ rows });
      }),
    } as unknown as SupabaseClient<unknown>;

    const provider = {
      id: "openai",
      priority: 1,
      createEmbedding: jest.fn().mockResolvedValue({ embeddings: [[0.95, 0.05, 0.02]] }),
    };

    (getActiveEmbeddingProvider as jest.Mock).mockResolvedValue({
      provider,
      health: { providerId: "openai", status: "healthy", checkedAt: Date.now() },
      attempts: [{ providerId: "openai", status: "healthy" }],
      fallbackUsed: false,
    });

    const persona = getPersonaProfile("marcus");

    const results = await retrieveKnowledgeForCoach(
      supabase as unknown as SupabaseClient<any>,
      persona,
      "How do I practice stoic courage today?",
      3,
    );

    expect(results).toHaveLength(3);
    expect(results.map((item) => item.id)).toEqual(
      expect.arrayContaining(["persona-1", "persona-2", "fallback-1"]),
    );
    expect(results[0]?.personaTags).toEqual(expect.arrayContaining(["marcus"]));
    expect(results[0]?.relevance).toBeGreaterThanOrEqual(results[1]?.relevance ?? 0);
    expect(provider.createEmbedding).toHaveBeenCalledWith(
      expect.objectContaining({ model: "text-embedding-3-small" }),
    );
    expect(recordProviderSuccess).toHaveBeenCalledWith(
      "openai",
      expect.objectContaining({ latencyMs: expect.any(Number) }),
    );

    (supabase.from as jest.Mock).mockClear();
    await retrieveKnowledgeForCoach(
      supabase as unknown as SupabaseClient<any>,
      persona,
      "How do I practice stoic courage today?",
      3,
    );
    expect((supabase.from as jest.Mock).mock.calls).toHaveLength(0);
  });
});
