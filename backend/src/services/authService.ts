import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { CreateUserInput, AuthTokens, LoginInput, User } from '../types/user';

const SALT_ROUNDS = 10;

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: CreateUserInput): Promise<AuthTokens> {
    // Check if email already exists
    const emailExists = await UserModel.emailExists(data.email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await UserModel.create({
      ...data,
      passwordHash,
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user,
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginInput): Promise<AuthTokens> {
    // Find user by email
    const userWithPassword = await UserModel.findByEmail(data.email);
    if (!userWithPassword) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, userWithPassword.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Extract user without password hash
    const { passwordHash: _, ...user } = userWithPassword;

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret) {
        throw new Error('JWT_REFRESH_SECRET not configured');
      }

      const decoded = jwt.verify(refreshToken, secret) as { id: string; email: string };

      // Generate new access token
      const accessToken = this.generateAccessToken({ id: decoded.id, email: decoded.email });

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private static generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  /**
   * Generate access token (short-lived)
   */
  private static generateAccessToken(user: { id: string; email: string }): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as jwt.SignOptions
    );
  }

  /**
   * Generate refresh token (long-lived)
   */
  private static generateRefreshToken(user: { id: string; email: string }): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    return jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
  }
}
