function normalizeRole(role: string): string {
  return role.trim().toUpperCase();
}

function isRequesterRole(role: string): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "REQUESTER" || normalizedRole === "ORGANIZATION";
}

export function hasRequesterRole(roles: string[]): boolean {
  return roles.some(isRequesterRole);
}

export function hasDonorRole(roles: string[]): boolean {
  return roles.some((role) => normalizeRole(role) === "DONOR");
}

export function hasAdminRole(roles: string[]): boolean {
  return roles.some((role) => normalizeRole(role) === "SYSTEM_ADMIN");
}

export function isRequesterOnly(roles: string[]): boolean {
  return hasRequesterRole(roles) && !hasDonorRole(roles) && !hasAdminRole(roles);
}

export function resolvePostLoginPath(roles: string[]): string {
  if (isRequesterOnly(roles)) {
    return "/requests";
  }

  if (hasDonorRole(roles) || hasAdminRole(roles)) {
    return "/dashboard";
  }

  if (hasRequesterRole(roles)) {
    return "/requests";
  }

  return "/dashboard";
}