export function isRequesterOnly(roles: string[]): boolean {
  return roles.length === 1 && roles[0] === "REQUESTER";
}

export function resolvePostLoginPath(roles: string[]): string {
  if (isRequesterOnly(roles)) {
    return "/requests";
  }

  if (roles.includes("DONOR") || roles.includes("SYSTEM_ADMIN")) {
    return "/dashboard";
  }

  if (roles.includes("REQUESTER")) {
    return "/requests";
  }

  return "/dashboard";
}