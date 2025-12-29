import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { LandingPage } from './pages/LandingPage';
import { RoomPage } from './pages/RoomPage';

// Create a root route
const rootRoute = createRootRoute({
    component: () => (
        <>
            <Outlet />
            {/* Add DevTools here if needed in future */}
        </>
    ),
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
});

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute, roomRoute]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
