import pool from './connection';
import { PoolClient, QueryResult, QueryResultRow } from 'pg';

/**
 * Execute a query with parameters
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', { text, error });
    throw error;
  }
}

/**
 * Execute a transaction with multiple queries
 * @param callback Function that receives a client and performs queries
 * @returns Result of the callback function
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check for optimistic lock conflicts
 * Returns true if the version matches the current database version
 */
export async function checkVersion(
  tableName: string,
  id: string,
  expectedVersion: number
): Promise<boolean> {
  const result = await query(
    `SELECT version FROM prjmng3.${tableName} WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error(`Record not found: ${tableName}#${id}`);
  }

  return result.rows[0].version === expectedVersion;
}

/**
 * Execute an update with version increment for optimistic locking
 * Throws error if version mismatch (conflict detected)
 */
export async function updateWithVersion(
  tableName: string,
  id: string,
  expectedVersion: number,
  updates: Record<string, any>
): Promise<QueryResult> {
  const setClause = Object.keys(updates)
    .map((key, idx) => `${key} = $${idx + 3}`)
    .join(', ');

  const values = [id, expectedVersion, ...Object.values(updates)];

  const result = await query(
    `UPDATE prjmng3.${tableName} 
     SET ${setClause}, version = version + 1 
     WHERE id = $1 AND version = $2 
     RETURNING *`,
    values
  );

  if (result.rowCount === 0) {
    throw new Error(`Optimistic lock conflict: ${tableName}#${id} version ${expectedVersion}`);
  }

  return result;
}

/**
 * Format query errors into user-friendly messages
 */
export function formatDbError(error: any): string {
  if (error.code === '23505') {
    return 'A record with this unique value already exists';
  }
  if (error.code === '23503') {
    return 'Referenced record does not exist';
  }
  if (error.code === '23514') {
    return 'Invalid value for field: ' + error.constraint;
  }
  return error.message || 'Database error occurred';
}
