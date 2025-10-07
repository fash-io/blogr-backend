import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Query,
  Param,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Cookie } from '../common/decorators/cookie.decorator';
import { CurrentUser } from '../common/decorators/currentUser.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RateLimit } from 'nestjs-rate-limiter';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @RateLimit({ pointsConsumed: 100, duration: 60000, points: 600 })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.register(dto, res);
  }

  @Post('login')
  @RateLimit({ pointsConsumed: 100, duration: 60000, points: 600 })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('refresh')
  async refresh(
    @Cookie(['refreshToken', true]) refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!refreshToken) throw new ForbiddenException('No refresh token provided');
    return this.authService.refresh(refreshToken, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async signout(@CurrentUser('sub') id: string, @Res({ passthrough: true }) res: Response) {
    return this.authService.signout(id, res);
  }

  @Post('forgot-password')
  @RateLimit({ pointsConsumed: 100, duration: 60000, points: 600 })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password/:id')
  async resetPassword(
    @Param('id') id: string,
    @Body('password') password: string,
    @Query('token') token: string,
  ) {
    return this.authService.resetPassword({ id, password }, token);
  }

  @Get('verify-email/:id')
  async verifyEmail(@Param('id') id: string, @Query('token') token: string) {
    return this.authService.verifyEmail(id, token);
  }
}
