import { createRootRoute, createRoute, createRouter, Outlet, useLocation } from '@tanstack/react-router';
import { LandingPage } from './pages/LandingPage';
import { RoomPage } from './pages/RoomPage';
import { CreateGamePage } from './pages/CreateGamePage';
import { MyRoomsPage } from './pages/MyRoomsPage';
import { NotFoundView } from './components/NotFoundView';

// Create a root route
const RootComponent = () => {
    const location = useLocation();
    const isLanding = location.pathname === '/';

    return (
        <div
            className="min-h-screen w-full font-sans text-slate-200"
            style={isLanding ? {
                backgroundImage: "url('/intro-bg.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            } : { background: '#0f172a' }}
        >
            <div className="max-w-7xl mx-auto">
                <Outlet />
            </div>
        </div>
    );
};

const rootRoute = createRootRoute({
    component: RootComponent,
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

// Create My Rooms route
const myRoomsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/my',
    component: MyRoomsPage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute, createGameRoute, roomRoute, myRoomsRoute]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
