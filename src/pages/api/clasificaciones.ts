// src/pages/api/clasificaciones.ts
import type { APIRoute } from 'astro';
import Database from 'better-sqlite3';
import path from 'path';

export const GET: APIRoute = () => {
  const DB_PATH = path.resolve('.', 'src', 'data', 'plantscare.sqlite');
  let rows;
  try {
    const db = new Database(DB_PATH, { readonly: true });
    rows = db
      .prepare(`
        SELECT
          id,
          nombre_archivo    AS filename,
          clasificacion     AS label,
          probabilidad      AS probability,
          -- convertimos timestamp 'YYYYMMDD_HHMMSS' a legible
          datetime(
            substr(timestamp,1,8) || ' ' || substr(timestamp,10),
            'YYYYMMDD HHMMSS'
          ) AS fecha
        FROM clasificaciones
        ORDER BY id DESC
        LIMIT 5
      `)
      .all();
    db.close();
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'DB error', detail: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify(rows), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
