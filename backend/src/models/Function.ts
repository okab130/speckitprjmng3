import pool from '../db/connection';
import { Function } from '../types/function';

export class FunctionModel {
  // Get all functions
  static async getAll(): Promise<Function[]> {
    const result = await pool.query(
      `SELECT * FROM prjmng3.functions ORDER BY system_name, function_name, function_detail`
    );
    return result.rows;
  }

  // Get function by ID
  static async getById(id: string): Promise<Function | null> {
    const result = await pool.query(
      `SELECT * FROM prjmng3.functions WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Create new function
  static async create(data: {
    system_name: string;
    function_name: string;
    function_detail: string;
  }): Promise<Function> {
    const result = await pool.query(
      `INSERT INTO prjmng3.functions (system_name, function_name, function_detail)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.system_name, data.function_name, data.function_detail]
    );
    return result.rows[0];
  }

  // Delete function
  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM prjmng3.functions WHERE id = $1`,
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Get distinct system names
  static async getSystemNames(): Promise<string[]> {
    const result = await pool.query(
      `SELECT DISTINCT system_name FROM prjmng3.functions ORDER BY system_name`
    );
    return result.rows.map((row: any) => row.system_name);
  }

  // Get function names by system
  static async getFunctionNamesBySystem(systemName: string): Promise<string[]> {
    const result = await pool.query(
      `SELECT DISTINCT function_name FROM prjmng3.functions 
       WHERE system_name = $1 ORDER BY function_name`,
      [systemName]
    );
    return result.rows.map((row: any) => row.function_name);
  }

  // Get function details by system and function
  static async getFunctionDetails(systemName: string, functionName: string): Promise<string[]> {
    const result = await pool.query(
      `SELECT function_detail FROM prjmng3.functions 
       WHERE system_name = $1 AND function_name = $2 ORDER BY function_detail`,
      [systemName, functionName]
    );
    return result.rows.map((row: any) => row.function_detail);
  }
}
