interface User {
  permissions: string[];
  roles: string[];
}

interface validateUserPermissionsProps {
  user: User;
  permissions?: string[];
  roles?: string[];
}

export function validateUserPermissions({
  user,
  permissions,
  roles,
}: validateUserPermissionsProps) {
  // se o usuario tiver alguma verificação ele pesquisa para ver se ele tem a permissão que precisa para acessar algo
  //permissão para escrever por exemplo
  if (permissions?.length > 0) {
    const hasAllPermissions = permissions?.every((permission) => {
      return user.permissions.includes(permission);
    });

    // se não tiver a permissão retorna false
    if (!hasAllPermissions) {
      return false;
    }
  }

  // faz a verificação das regras do usuario se ele tem ou não
  if (roles?.length > 0) {
    const hasAllRoles = roles?.some((role) => {
      return user.roles.includes(role);
    });

    // se não tiver a permissão retorna false
    if (!hasAllRoles) {
      return false;
    }
  }

  return true;
}
