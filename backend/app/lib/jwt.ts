import jwt from "jsonwebtoken";

interface SignOptions {
  expiresIn?: string | number;
}

// Sign access token (short-lived)
export const signAccessToken = (payload: object, options?: SignOptions) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, options);
};

// Sign refresh token (long-lived)
export const signRefreshToken = (payload: object, options?: SignOptions) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, options);
};

// Verify access token
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
};

// Verify refresh token
export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
};
