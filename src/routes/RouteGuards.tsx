import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resolvePostLoginPath } from "./roleRouting";

function AuthLoading() {
  return (
    <main className="min-h-screen grid place-items-center bg-surface px-6">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="mt-3 text-sm text-gray-600">Validando sessão...</p>
      </div>
    </main>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, roles } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to={resolvePostLoginPath(roles)} replace />;
  }

  return <>{children}</>;
}

export function RoleBasedHomeRedirect() {
  const { roles } = useAuth();

  return <Navigate to={resolvePostLoginPath(roles)} replace />;
}

export function RequireRoles({
  acceptedRoles,
  children,
  fallback,
}: {
  acceptedRoles: string[];
  children: ReactNode;
  fallback: ReactNode;
}) {
  const { roles } = useAuth();
  const hasAccess = acceptedRoles.some((role) => roles.includes(role));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
