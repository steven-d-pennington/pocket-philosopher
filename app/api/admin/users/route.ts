import { NextRequest, NextResponse } from "next/server";
import { adminAuthMiddleware } from "@/lib/middleware/admin-auth";
import { Client } from 'pg';

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) return authResult;

  const client = new Client({
    host: '127.0.0.1',
    port: 55433,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    // Build search condition
    let searchCondition = '';
    const queryParams: any[] = [limit, offset];

    if (search) {
      searchCondition = `
        WHERE au.email ILIKE $3
        OR p.preferred_virtue ILIKE $3
        OR p.preferred_persona ILIKE $3
        OR p.experience_level ILIKE $3
      `;
      queryParams.push(`%${search}%`);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM profiles p
      INNER JOIN auth.users au ON p.user_id = au.id
      ${searchCondition}
    `;

    const countResult = await client.query(countQuery, searchCondition ? [queryParams[2]] : []);
    const total = parseInt(countResult.rows[0].total);

    // Get users with pagination
    const query = `
      SELECT
        p.user_id,
        au.email,
        au.email_confirmed_at,
        p.preferred_virtue,
        p.preferred_persona,
        p.experience_level,
        p.is_admin,
        p.created_at,
        p.updated_at,
        p.last_active_at
      FROM profiles p
      INNER JOIN auth.users au ON p.user_id = au.id
      ${searchCondition}
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await client.query(query, queryParams);

    await client.end();

    return NextResponse.json({
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    await client.end().catch(() => {});
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
