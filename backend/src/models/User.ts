import { query } from '../db/queryHelpers';
import { User, UserWithPassword, CreateUserInput } from '../types/user';

export class UserModel {
  /**
   * Create a new user
   */
  static async create(data: CreateUserInput & { passwordHash: string }): Promise<User> {
    const result = await query<User>(
      `INSERT INTO prjmng3.users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at as "createdAt"`,
      [data.email, data.passwordHash, data.name]
    );

    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<UserWithPassword | null> {
    const result = await query<UserWithPassword>(
      `SELECT 
        id, 
        email, 
        password_hash as "passwordHash", 
        name, 
        created_at as "createdAt"
       FROM prjmng3.users
       WHERE email = $1`,
      [email]
    );

    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT 
        id, 
        email, 
        name, 
        created_at as "createdAt"
       FROM prjmng3.users
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Check if email already exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM prjmng3.users WHERE email = $1',
      [email]
    );

    return result.rows.length > 0;
  }

  /**
   * Get all users (for admin purposes)
   */
  static async findAll(): Promise<User[]> {
    const result = await query<User>(
      `SELECT 
        id, 
        email, 
        name, 
        created_at as "createdAt"
       FROM prjmng3.users
       ORDER BY created_at DESC`
    );

    return result.rows;
  }
}
