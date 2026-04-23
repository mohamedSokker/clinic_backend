import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: any) {
    const { uid, email, role, name, mobile, photoURL, ...profileData } =
      createUserDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If email exists but UID is different, update the UID and photo to the new one
      if (existingUser.uid !== uid) {
        return this.prisma.user.update({
          where: { email },
          data: { uid, name, mobile, photoURL },
          include: { patient: true, doctor: true, lab: true },
        });
      }
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        uid,
        email,
        role,
        name,
        mobile,
        photoURL,
        [role]: {
          create: profileData,
        },
      },
      include: {
        patient: true,
        doctor: true,
        lab: true,
      },
    });
  }

  async findByUid(uid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uid },
      include: {
        patient: true,
        doctor: true,
        lab: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(uid: string, updateUserDto: any) {
    const user = await this.findByUid(uid);
    const {
      name,
      mobile,
      photoURL,
      fcmToken,
      uid: _uid,
      role: _role,
      email: _email,
      ...profileData
    } = updateUserDto;

    return this.prisma.user.update({
      where: { uid },
      data: {
        name,
        mobile,
        photoURL,
        fcmToken,
        [user.role]: {
          update: profileData,
        },
      },
      include: {
        patient: true,
        doctor: true,
        lab: true,
      },
    });
  }
}
