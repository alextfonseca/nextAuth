import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

interface canProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
}

export function Can({ children, permissions, roles }: canProps) {
  const userCanSeeComponent = useCan({ permissions, roles });

  // mostrando o component ao usuario apenas se ele tiver a permissão de ver
  if (!userCanSeeComponent) {
    return null;
  }

  // mostrando o component se ele tiver a permissão
  return <>{children}</>;
}
