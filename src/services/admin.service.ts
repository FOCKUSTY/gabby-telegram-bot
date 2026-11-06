import { Prisma } from "@/database";

export class AdminService {
  public constructor(private readonly prisma: Prisma = new Prisma()) {}

  public async create(userId: string) {
    const admin = await this.prisma.admin.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return admin;
  }
}
