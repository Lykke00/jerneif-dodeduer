import type { UserDto } from "../generated-ts-client";

export const AccessLevel = {
  Anonymous: "anonymous",
  Protected: "protected",
  Player: "player",
  Admin: "admin",
} as const;

export type AccessLevel = typeof AccessLevel[keyof typeof AccessLevel];

export const canAccess = (accessLevel: AccessLevel, user: UserDto | null): boolean => {
    switch (accessLevel) {
        case AccessLevel.Anonymous:
            return true;
        case AccessLevel.Protected:
            return user !== null;
        case AccessLevel.Admin:
            return user !== null && user.isAdmin;
        case AccessLevel.Player:
            return user !== null && !user.isAdmin;
        default:
            return false;
    }
};