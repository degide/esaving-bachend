import { UserRole } from "@/modules/prisma/client/enums";
import { Reflector } from "@nestjs/core";

/**
 * Decorator to specify required user roles for accessing a route.
 * Accepts either a single UserRole or an array of UserRoles.
 */
export const UserHasRoles = Reflector.createDecorator<UserRole | [UserRole, ...UserRole[]], [UserRole, ...UserRole[]]>({
  transform(value) {
    if (Array.isArray(value)) {
      return value;
    } else return [value];
  },
});

/**
 * Decorator to specify that a user must have at least one of the specified roles to access a route.
 * Accepts either an array of UserRoles.
 */
export const UserHasAnyRole = Reflector.createDecorator<[UserRole, ...UserRole[]]>();
