import { normalizeAnalyticsProperties } from "@/lib/analytics/server";

describe("normalizeAnalyticsProperties", () => {
  it("returns undefined when input is empty", () => {
    expect(normalizeAnalyticsProperties()).toBeUndefined();
    expect(normalizeAnalyticsProperties({})).toBeUndefined();
  });

  it("coerces primitives and removes nullish values", () => {
    const normalized = normalizeAnalyticsProperties({
      stringValue: "hello",
      numberValue: 42,
      boolTrue: true,
      boolFalse: false,
      nullish: null,
      undefinedValue: undefined,
    });

    expect(normalized).toEqual({
      stringValue: "hello",
      numberValue: 42,
      boolTrue: 1,
      boolFalse: 0,
    });
  });

  it("stringifies objects when necessary", () => {
    const normalized = normalizeAnalyticsProperties({
      objectValue: { nested: "value" },
      arrayValue: [1, 2, 3],
    });

    expect(normalized?.objectValue).toBe('{"nested":"value"}');
    expect(normalized?.arrayValue).toBe('[1,2,3]');
  });
});
