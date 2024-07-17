import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const sortOrder = url.searchParams.get("sortOrder") || "DESC";

    // Validate and set default values
    const limitClause = limit ? `LIMIT ${parseInt(limit, 10)}` : "";
    const sortOrderClause = ["ASC", "DESC"].includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    // Construct the SQL query
    const sqlQuery = `SELECT * FROM dollar_blue_historical ORDER BY date ${sortOrderClause} ${limitClause}`;

    // Execute the query
    const result = await query(sqlQuery);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
