import { NextResponse } from "next/server";

/**
 * The Pillar 2 snippet and A/B endpoints are called from arbitrary customer
 * domains, so these public collection endpoints allow any origin. No cookies
 * or credentials are involved — the session id travels in the request body,
 * not a cookie — so a wildcard origin is safe here.
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export function corsJson(body: unknown, init?: { status?: number }): NextResponse {
  return NextResponse.json(body, { status: init?.status ?? 200, headers: CORS_HEADERS });
}

export function corsPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
