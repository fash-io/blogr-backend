import { Response } from 'express';

export async function setAuthCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function clearAuthCookie(res: Response) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    signed: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}
