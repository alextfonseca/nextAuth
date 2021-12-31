import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

// tipagem dos dados recebidos no hook
interface useCanProps {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions, roles }: useCanProps) {
  // pegando o usuario do contexto e a verificação se ele logado na aplicação
  const { user, isAuthenticated } = useContext(AuthContext);

  // se ele não estiver logado ele não vai ter permissão
  if (!isAuthenticated) {
    return false;
  }

  const userHasValidPermissions = validateUserPermissions({
    user,
    permissions,
    roles,
  });

  // se passar por todas as verificação retorna true indicando que ele tem autorização
  return userHasValidPermissions;
}
