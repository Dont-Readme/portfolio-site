import { NextResponse } from "next/server";

import {
  completeAiCoachRun,
  prepareAiCoachRun,
} from "@/features/ai-coach/engine";
import { isUserFixtureId } from "@/features/ai-coach/fixtures";
import {
  benchmarkAiCoach,
  evaluateAiCoachRun,
} from "@/features/ai-coach/metrics";
import {
  evaluateAiCoachWithOpenAi,
  type AiCoachApiTelemetry,
} from "@/features/ai-coach/openai-evaluator";
import type {
  AiCoachRunResult,
  BenchmarkResult,
  LiveEvaluation,
} from "@/features/ai-coach/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type AiCoachRecommendResponse = AiCoachRunResult & {
  evaluation: LiveEvaluation;
  benchmark: BenchmarkResult;
  api: AiCoachApiTelemetry;
};

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

function isStrictFixtureRequest(
  value: unknown,
): value is { fixtureId: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);
  if (keys.length !== 1 || keys[0] !== "fixtureId") return false;

  return isUserFixtureId(
    (value as Record<string, unknown>).fixtureId,
  );
}

function requestError(message: string) {
  return NextResponse.json(
    {
      error: {
        code: "INVALID_REQUEST",
        message,
      },
    },
    {
      status: 400,
      headers: NO_STORE_HEADERS,
    },
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return requestError("JSON 요청 본문에 fixtureId를 보내주세요.");
  }

  if (!isStrictFixtureRequest(body)) {
    return requestError("허용된 fixtureId 하나만 보낼 수 있습니다.");
  }

  try {
    const prepared = prepareAiCoachRun(body.fixtureId);
    const evaluated = await evaluateAiCoachWithOpenAi(prepared.promptInput);
    const run = completeAiCoachRun(prepared, {
      aiResponses: evaluated.aiResponses,
      aiSource: evaluated.api.source === "openai" ? "openai" : "fallback",
    });

    const response: AiCoachRecommendResponse = {
      ...run,
      evaluation: evaluateAiCoachRun(run),
      benchmark: benchmarkAiCoach(),
      api: evaluated.api,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: NO_STORE_HEADERS,
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "AI 학습 코치 데모를 실행하지 못했습니다.",
        },
      },
      {
        status: 500,
        headers: NO_STORE_HEADERS,
      },
    );
  }
}
