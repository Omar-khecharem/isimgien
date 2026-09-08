import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { config } from "../../config";
import { User, IUser } from "../../models/user.model";
import { ApiError } from "../../shared/utils/ApiError";
import { Role } from "../../shared/enums/roles";
import { JwtPayload } from "../../shared/types/express";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: Record<string, unknown>;
  tokens: TokenPair;
}

function generateAccessToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: config.jwt.accessExpiry as any };
  return jwt.sign(payload as object, config.jwt.accessSecret, options);
}

function generateRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: config.jwt.refreshExpiry as any };
  return jwt.sign(payload as object, config.jwt.refreshSecret, options);
}

function buildJwtPayload(user: IUser): JwtPayload {
  return {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError.unauthorized("Account is deactivated");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  user.lastLogin = new Date();
  await user.save();

  const jwtPayload = buildJwtPayload(user);
  const tokens: TokenPair = {
    accessToken: generateAccessToken(jwtPayload),
    refreshToken: generateRefreshToken(jwtPayload),
  };

  const userObj = user.toJSON();
  return { user: userObj, tokens };
}

export async function refreshToken(
  refreshTokenValue: string
): Promise<TokenPair> {
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(
      refreshTokenValue,
      config.jwt.refreshSecret
    ) as JwtPayload;
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.userId);

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("User not found or deactivated");
  }

  const jwtPayload = buildJwtPayload(user);
  return {
    accessToken: generateAccessToken(jwtPayload),
    refreshToken: generateRefreshToken(jwtPayload),
  };
}

export async function getCurrentUser(userId: string): Promise<IUser> {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return user;
}
