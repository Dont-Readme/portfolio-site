import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const originalApiKey = process.env.OPENAI_API_KEY;
const originalModel = process.env.OPENAI_MODEL;

function request(body: unknown) {
  return new Request("http://localhost/api/ai-coach/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
});

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalApiKey;
  if (originalModel === undefined) delete process.env.OPENAI_MODEL;
  else process.env.OPENAI_MODEL = originalModel;
});

describe("POST /api/ai-coach/recommend", () => {
  it("accepts only a fixtureId and completes through server fallback without API config", async () => {
    const response = await POST(request({ fixtureId: "user-04" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(payload.fixtureId).toBe("user-04");
    expect(payload.api).toMatchObject({
      source: "fallback",
      status: "fallback",
      attempts: 0,
      errorCode: "MISSING_CONFIG",
    });
    expect(payload.finalRecommendations).toHaveLength(3);
    expect(
      payload.finalRecommendations.map((item: { contentId: string }) => item.contentId),
    ).toEqual(
      payload.mixedTop3.map((item: { contentId: string }) => item.contentId),
    );
    expect(
      payload.finalRecommendations.every(
        (item: { commentReason?: string }) => typeof item.commentReason === "string",
      ),
    ).toBe(true);
    expect(
      payload.finalRecommendations.every(
        (item: { comment: string }) =>
          [...item.comment].length <= 80 &&
          !/오답|취약|틀리|틀렸|틀린|자주\s*틀|\d+(?:\.\d+)?\s*(?:%|점)/u.test(
            item.comment,
          ),
      ),
    ).toBe(true);
    expect(payload.benchmark.labelCount).toBeGreaterThanOrEqual(85);
    expect(payload.benchmark.labelCount).toBeLessThanOrEqual(100);
  });

  it("rejects unknown fixtures and extra client fields", async () => {
    const unknown = await POST(request({ fixtureId: "user-99" }));
    const leaked = await POST(
      request({ fixtureId: "user-04", displayName: "보내면 안 됨" }),
    );

    expect(unknown.status).toBe(400);
    expect(leaked.status).toBe(400);
  });
});
