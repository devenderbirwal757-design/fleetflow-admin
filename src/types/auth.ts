export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OPERATOR: "OPERATOR",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  OPERATOR: 1,
  SUPER_ADMIN: 2,
};

export function hasPermission(userRole: Role | null | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  OPERATOR: "Operator",
};
