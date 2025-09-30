import { resolveCitations } from "@/lib/ai/orchestrator";
import type { CoachKnowledgeChunk } from "@/lib/ai/types";

const mockKnowledge: CoachKnowledgeChunk[] = [
  {
    id: "chunk-1",
    work: "Meditations",
    author: "Marcus Aurelius",
    tradition: "Stoic",
    section: "Book II",
    content: "Remember that you have power over your mind.",
    metadata: { reference: "Book II, 1" },
  },
  {
    id: "chunk-2",
    work: "Enchiridion",
    author: "Epictetus",
    tradition: "Stoic",
    section: "Chapter 1",
    content: "Some are things which are up to us.",
    metadata: { reference: "Chapter 1" },
  },
];

describe("resolveCitations", () => {
  it("removes inline citation markers and creates citation objects", () => {
    const content = "Remember that you have power over your mind [[chunk-1]]. Some are things which are up to us [[chunk-2]].";

    const result = resolveCitations(content, mockKnowledge);

    expect(result.sanitized).toBe("Remember that you have power over your mind. Some are things which are up to us.");
    expect(result.citations).toHaveLength(2);
    expect(result.citations).toEqual([
      {
        id: "chunk-1",
        title: "Meditations",
        reference: "Book II",
        url: undefined,
      },
      {
        id: "chunk-2",
        title: "Enchiridion",
        reference: "Chapter 1",
        url: undefined,
      },
    ]);
  });

  it("removes citations sections despite instructions", () => {
    const content = `Remember that you have power over your mind [[chunk-1]].

Citations:
- [[chunk-1]]: Meditations, Book II
- [[chunk-2]]: Enchiridion, Chapter 1`;

    const result = resolveCitations(content, mockKnowledge);

    expect(result.sanitized).toBe("Remember that you have power over your mind.");
    expect(result.citations).toHaveLength(2);
  });

  it("removes citations sections in different formats", () => {
    const content = `Remember that you have power over your mind [[chunk-1]].

Citations

Meditations · Book III: Inner Citadel`;

    const result = resolveCitations(content, mockKnowledge);

    expect(result.sanitized).toBe("Remember that you have power over your mind.");
    expect(result.citations).toHaveLength(1);
  });

  it("handles unknown chunk IDs", () => {
    const content = "Some text [[unknown-chunk]].";

    const result = resolveCitations(content, mockKnowledge);

    expect(result.sanitized).toBe("Some text.");
    expect(result.citations).toEqual([
      {
        id: "unknown-chunk",
        title: "unknown-chunk",
        reference: null,
        url: undefined,
      },
    ]);
  });

  it("handles content without citations", () => {
    const content = "Some regular text without citations.";

    const result = resolveCitations(content, mockKnowledge);

    expect(result.sanitized).toBe("Some regular text without citations.");
    expect(result.citations).toHaveLength(0);
  });
});