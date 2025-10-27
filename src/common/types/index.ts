import { UserRole } from "@/modules/prisma/client/enums";

export type JwtPayload = {
  id: number;
  email: string;
  role: UserRole;
  sub: number;
};
