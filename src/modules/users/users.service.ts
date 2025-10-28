import { HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, GeneralStatus, User, UserRole, AccountType } from "@/modules/prisma/prisma.models";
import { PaginatedResBodyDTO, ResBodyDTO } from "@/common/dto/response.dto";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ChangeUserRoleDTO, CreateUserDTO, UserDTO } from "./dto/user.dto";
import { hashSync } from "bcryptjs";
import { plainToClass } from "class-transformer";
import { UserProfileDTO } from "./dto/user-profile.dto";
import { UserSessionDTO } from "@/modules/sessions/dto/session.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResBodyDTO<Omit<UserDTO, "password">>> {
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const [users, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        omit: {
          password: true,
        },
      }),
      this.prismaService.user.count({
        where,
      }),
    ]);

    return {
      statusCode: HttpStatus.OK,
      message: "Users found",
      data: users.map((user) =>
        plainToClass(UserDTO, {
          ...user,
        }),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  async getUserProfile(userId: number): Promise<ResBodyDTO<UserProfileDTO>> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        sessions: {
          where: {
            status: GeneralStatus.ACTIVE,
          },
        },
      },
      omit: {
        password: true,
      },
    });

    if (!user)
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "User not found",
      };
    return {
      statusCode: HttpStatus.OK,
      message: "User found",
      data: {
        user: plainToClass(UserDTO, { ...user, sessions: undefined }),
        activeSessions: user.sessions.map((userSession) =>
          plainToClass(UserSessionDTO, {
            ...userSession,
          }),
        ),
      },
    };
  }

  async findById(id: number): Promise<ResBodyDTO<User>> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user)
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "User not found",
      };
    return {
      statusCode: HttpStatus.OK,
      message: "User found",
      data: user,
    };
  }

  async createUser(dto: CreateUserDTO): Promise<ResBodyDTO<Omit<UserDTO, "password"> | undefined>> {
    const res = await this.findOneByEmail(dto.email);

    if (res.data) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Username or Email already taken",
      };
    }

    const newUser = await this.prismaService.user.create({
      data: {
        ...dto,
        status: GeneralStatus.PENDING,
        password: hashSync(dto.password, this.configService.get<number>("BCRYPT_SALT", 10)),
      },
      omit: {
        password: true,
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: "User created",
      data: plainToClass(UserDTO, {
        ...newUser,
      }),
    };
  }

  async findOneByEmail(email: string): Promise<ResBodyDTO<User>> {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user)
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "User not found",
      };
    return {
      statusCode: HttpStatus.OK,
      message: "User found",
      data: user,
    };
  }

  async getUserById(id: number): Promise<ResBodyDTO<Omit<UserDTO, "password">>> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      omit: {
        password: true,
      },
    });
    if (!user) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "User not found",
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: "User found",
      data: plainToClass(UserDTO, {
        ...user,
      }),
    };
  }

  async updateStatus(userId: number, newStatus: GeneralStatus): Promise<ResBodyDTO<UserDTO>> {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });

    if (!user)
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "User not found",
      };

    const userAccounts = await this.prismaService.account.findMany({
      where: { userId: user.id },
    });

    //create account upon approval of customer accounts
    if (user.role == UserRole.CUSTOMER && userAccounts.length == 0 && newStatus == GeneralStatus.ACTIVE) {
      await this.prismaService.account.create({
        data: {
          status: GeneralStatus.ACTIVE,
          userId: user.id,
          balance: 0.0,
          accountType: AccountType.SAVINGS,
          accountNumber: `${Date.now()}`,
        },
      });
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { status: newStatus },
      omit: { password: true },
    });

    return {
      statusCode: HttpStatus.OK,
      message: "User updated",
      data: plainToClass(UserDTO, updatedUser),
    };
  }

  async assignRole(dto: ChangeUserRoleDTO): Promise<ResBodyDTO<Omit<UserDTO, "password">>> {
    const res = await this.findById(dto.userId);
    if (!res.data) return res;
    const updatedUser = await this.prismaService.user.update({
      where: {
        id: dto.userId,
      },
      data: {
        role: dto.role,
      },
      omit: {
        password: true,
      },
    });
    return {
      data: updatedUser,
      statusCode: HttpStatus.OK,
      message: "User role updated",
    };
  }
}
