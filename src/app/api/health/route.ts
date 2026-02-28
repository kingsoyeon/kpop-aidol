import { NextResponse } from 'next/server'
export const dynamic = "force-dynamic";

export async function GET() {
    const checks = {
        GEMINI_API_KEY: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy_key',
        GCP_PROJECT_ID: !!process.env.GCP_PROJECT_ID,
        GCP_SERVICE_ACCOUNT_JSON: !!process.env.GCP_SERVICE_ACCOUNT_JSON,
        NEXT_PUBLIC_FORCE_MOCK: process.env.NEXT_PUBLIC_FORCE_MOCK,
        ENABLE_REAL_API: process.env.ENABLE_REAL_API,
        isVercel: !!process.env.VERCEL,
        nodeEnv: process.env.NODE_ENV,
    };

    const missing = Object.entries(checks)
        .filter(([key, val]) => ['GEMINI_API_KEY', 'GCP_PROJECT_ID', 'GCP_SERVICE_ACCOUNT_JSON'].includes(key) && !val)
        .map(([key]) => key);

    return NextResponse.json({
        status: missing.length === 0 ? 'ok' : 'missing_env_vars',
        missing,
        checks,
    }, { status: missing.length === 0 ? 200 : 503 });
}
