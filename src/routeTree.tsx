import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { LandingPage } from './pages/LandingPage';
import { RoomPage } from './pages/RoomPage';
import { CreateGamePage } from './pages/CreateGamePage';
import { NotFoundView } from './components/NotFoundView';

// Create a root route
const rootRoute = createRootRoute({
    component: () => (
        <>
            <Outlet />
        </>
    ),
    notFoundComponent: () => <NotFoundView />
});

// Create index route (Landing Page)
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: LandingPage,
});

// Create room route
const roomRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'room/$roomId',
    component: RoomPage,
    validateSearch: (search: Record<string, unknown>): { name?: string } => {
        return {
            name: (search.name as string) || undefined,
        };
    },
});

// Create Create Game route
const createGameRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/create',
    component: CreateGamePage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute, createGameRoute, roomRoute]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
