import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { addDays, addMinutes, isPast } from 'date-fns';
import { randomInt } from 'crypto';
import { clearAuthCookie, setAuthCookie } from 'src/common/utils/cookie.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly config: ConfigService,
  ) {}

  async login(loginDto: LoginDto, res: Response) {
    const { type, password } = loginDto;
    const user = await this.validateUser(type, password);
    if (!user) throw new NotFoundException('Invalid credentials');

    const token = await this.generateToken(user.id, user.email, res);
    return { token };
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findUser(username, { password: true });
    if (!user) return null;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;
    return user;
  }

  async register(registerDto: RegisterDto, res: Response) {
    const existingUser = await this.userService.findUser(
      registerDto.email || registerDto.username,
      { password: true },
    );

    if (existingUser) throw new ForbiddenException('Account already exists');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(registerDto.password, salt);

    const emailToken = this.randomTokenGenerator();
    const hashedToken = await bcrypt.hash(emailToken, 10);

    const data = {
      ...registerDto,
      password,
      emailToken: hashedToken,
      emailTokenExpiry: addMinutes(Date.now(), 30),
    };

    //TODO send welcome and email verification email
    //TODO frontend redirect to the verifyemail page

    const user = await this.userService.create(data);
    const token = await this.generateToken(user.id, user.email, res);
    return { ...this.sanitizeUser(user), token };
  }

  async resendVerification(id: string) {
    const user = await this.userService.exists(id, {
      emailVerified: true,
    });
    if (!user) throw new NotFoundException('Invalid credentials');

    if (user.emailVerified) throw new ForbiddenException('Email already verified');

    const emailToken = this.randomTokenGenerator();
    const hashedToken = await bcrypt.hash(emailToken, 10);

    await this.userService.update(id, {
      emailToken: hashedToken,
      emailTokenExpiry: addMinutes(Date.now(), 30),
    });

    //TODO send mail and redirect fronend
  }

  async refresh(refreshToken: string, res: Response) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
      const user = await this.userService.exists(payload.sub, {
        refreshToken: true,
      });
      if (!user || !user.refreshToken || !payload || payload.sub !== user.id) {
        throw new ForbiddenException('Invalid refresh token');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) throw new ForbiddenException('Invalid refresh token');

      const token = await this.generateToken(user.id, user.email, res);
      return { token };
    } catch (error) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }
  }

  async signout(userId: string, res: Response) {
    await this.userService.update(userId, { refreshToken: null });
    await clearAuthCookie(res);
    return { returnMessageBlogr: 'User Logged out' };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findUser(email, { id: true });
    if (!user) throw new ForbiddenException('User not found');

    const token = this.randomTokenGenerator();
    const hashedToken = await bcrypt.hash(token, 10);

    await this.userService.update(user.id, {
      resetToken: hashedToken,
      resetTokenExpiry: addMinutes(new Date(), 30),
    });

    const resetLink = `${this.config.get<string>('FRONTEND_URL')}/reset-password/${user.id}?token=${token}`;

    //Todo "stop sending the uderid and token send the token with a mialer service and the a redirect link to the rest password page waiting for a token to reset the password when the token is accepted then input then sends the data to the reset-password with the param beign the userid, body beign the password and the query of token to then reset the password"  WITH AN EXPIRY TIME OF 30 MINUTES

    return { resetLink };
  }

  async resetPassword(resetPasswordDto: { id: string; password: string }, token: string) {
    const user = await this.userService.exists(resetPasswordDto.id, {
      resetToken: true,
      resetTokenExpiry: true,
    });
    if (!user || !user.id) throw new ForbiddenException('User not found');
    if (!user.resetToken || !user.resetTokenExpiry || isPast(user.resetTokenExpiry)) {
      throw new ForbiddenException('Token expired or invalid');
    }

    const isValid = await bcrypt.compare(token, user.resetToken);
    if (!isValid) throw new ForbiddenException('Invalid token');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, salt);

    const updatedUser = await this.userService.update(user.id, {
      refreshToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      emailVerified: true,
      emailToken: null,
      password: hashedPassword,
    });

    return updatedUser;
  }

  async verifyEmail(userId: string, token: string) {
    const user = await this.userService.exists(userId, {
      emailToken: true,
      emailTokenExpiry: true,
      emailVerified: true,
    });
    if (!user) throw new NotFoundException('Invalid credentials');

    if (user.emailVerified) throw new ForbiddenException('Email already verified');

    if (!user.emailToken || !user.emailTokenExpiry) throw new ForbiddenException('Invalid token');

    if (isPast(user.emailTokenExpiry!)) throw new ForbiddenException('Token expired');
    if (user.emailToken !== token) throw new ForbiddenException('Invalid token');

    await this.userService.update(user.id, {
      emailToken: null,
      emailTokenExpiry: null,
      emailVerified: true,
    });

    return { returnMessageBlogr: 'Email verified' };
  }

  private async generateToken(userId: string, email: string, res: Response) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    await this.updateRefreshToken(userId, refreshToken);
    setAuthCookie(res, refreshToken);

    return accessToken;
  }

  private randomTokenGenerator(): string {
    return randomInt(100000, 1000000).toString();
  }

  private sanitizeUser(user: any) {
    const { password, refreshToken, emailToken, emailTokenExpiry, ...safeUser } = user;
    return safeUser;
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(userId, { refreshToken: hashed });
  }
}
