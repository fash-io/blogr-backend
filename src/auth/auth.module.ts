import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from '../common/strategies/jwt.strategy';

@Module({
  providers: [AuthService, JwtStrategy],
  imports: [UsersModule],
  controllers: [AuthController],
})
export class AuthModule {}
