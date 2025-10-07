import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { safeInclude, safeSelect } from './dto/safe-select.type';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: PrismaService,
    private userRepo: UsersRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: Prisma.UserCreateInput): Promise<SanitizedUser> {
    const user = await this.userRepo.create(createUserDto);
    await this.eventEmitter.emitAsync('user.created', createUserDto);
    return this.sanitizeUser(user);
  }

  async findAll() {
    return this.userRepo.findAll(safeSelect);
  }

  async findOne(id: string): Promise<Partial<SanitizedUser>> {
    const user = await this.userRepo.findById(id, {
      ...safeInclude,
      profile: true,
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async exists(id: string, select?: Prisma.UserSelect): Promise<User | null> {
    const user = await this.userRepo.findById(id, { id: true, ...select });

    return user;
  }

  async findUser(type: string, dataToSelect?: Prisma.UserSelect): Promise<User | null> {
    const users = await this.userRepo.findByEmailOrUsername(type, { id: true, ...dataToSelect });

    return users.length > 0 ? users[0] : null;
  }

  async update(id: string, updateUserDto: Prisma.UserUpdateInput): Promise<SanitizedUser> {
    const user = await this.userRepo.update(id, updateUserDto);
    return this.sanitizeUser(user);
  }

  async updateProfile(id: string, updateProfileDto: Prisma.ProfileUpdateInput) {
    await this.db.user.update({
      where: { id },
      data: {
        profile: {
          update: updateProfileDto,
        },
      },
    });
    return { message: 'Profile updated' };
  }

  async remove(id: string) {
    await this.userRepo.delete(id);
    
    return { returnMessageBlogr: 'User "Soft deleted"' };
  }

  private sanitizeUser(user: User): SanitizedUser {
    const { password, refreshToken, ...safeUser } = user;
    return safeUser;
  }
}
export type SanitizedUser = Omit<User, 'password' | 'refreshToken'>;
