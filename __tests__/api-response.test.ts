import { error as errorResponse, success as successResponse } from "@/app/api/_lib/response";

const EXAMPLE_DATA = { ok: true };

describe("API response helpers", () => {
  it("returns success payloads with optional message and request id", async () => {
    const response = successResponse(EXAMPLE_DATA, {
      message: "All good",
      requestId: "req-123",
    });

    expect(response.headers.get("x-request-id")).toBe("req-123");
    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      success: true,
      data: EXAMPLE_DATA,
      message: "All good",
    });
  });

  it("returns error payloads with status code, details, and request id", async () => {
    const response = errorResponse("Nope", {
      status: 418,
      details: { reason: "teapot" },
      requestId: "req-999",
    });

    expect(response.headers.get("x-request-id")).toBe("req-999");
    expect(response.status).toBe(418);

    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Nope",
      details: { reason: "teapot" },
    });
  });
});
