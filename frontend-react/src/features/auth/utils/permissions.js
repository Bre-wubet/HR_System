export function hasPermission(user, perm) {
  const permissions = user?.permissions || [];
  return permissions.includes(perm);
}

export function hasAnyPermission(user, perms = []) {
  const permissions = user?.permissions || [];
  return perms.some((p) => permissions.includes(p));
}


