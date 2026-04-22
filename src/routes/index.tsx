import { createBrowserRouter } from "react-router-dom";
import DonorDashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import RequestsPage from "../pages/RequestsPage";
import NewRequestPage from "../pages/NewRequestPage";
import RegisterPage from "../pages/RegisterPage";
import RecommendationsPage from "../pages/RecommendationsPage";
import ExternalDonationPage from "../pages/ExternalDonationPage";
import { PublicOnlyRoute, RequireAuth, RoleBasedHomeRedirect } from "./RouteGuards";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <RoleBasedHomeRedirect />
      </RequireAuth>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <DonorDashboardPage />
      </RequireAuth>
    ),
  },
  {
    path: "/dashboard/recommendations",
    element: (
      <RequireAuth>
        <RecommendationsPage />
      </RequireAuth>
    ),
  },
  {
    path: "/donations/external/new",
    element: (
      <RequireAuth>
        <ExternalDonationPage />
      </RequireAuth>
    ),
  },
  {
    path: "/requests",
    element: (
      <RequireAuth>
        <RequestsPage />
      </RequireAuth>
    ),
  },
  {
    path: "/requests/new",
    element: (
      <RequireAuth>
        <NewRequestPage />
      </RequireAuth>
    ),
  },
], {
  basename: import.meta.env.BASE_URL,
});