import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AnalyticsPage from "./pages/AnalyticsPage";
import ChannelsPage from "./pages/ChannelsPage";
import DashboardPage from "./pages/DashboardPage";
import IdeasPage from "./pages/IdeasPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MonetizationPage from "./pages/MonetizationPage";
import ScriptsPage from "./pages/ScriptsPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Toaster />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const channelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/channels",
  component: ChannelsPage,
});

const scriptsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scripts",
  component: ScriptsPage,
});

const ideasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ideas",
  component: IdeasPage,
});

const monetizationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/monetization",
  component: MonetizationPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  channelsRoute,
  scriptsRoute,
  ideasRoute,
  monetizationRoute,
  analyticsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
