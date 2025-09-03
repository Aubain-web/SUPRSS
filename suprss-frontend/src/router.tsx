import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from "./pages/auth/loginPage"
import { RegisterPage } from "./pages/auth/registerPage"
import {ProtectedRoute} from "./composants/auth/protectedRoutes.tsx";
import {Layout} from "lucide-react";
import { DashboardPage } from "./pages/dashboard/dashboardPage.tsx";
import { CollectionsPage } from "./pages/collections/collectionsPage.tsx";
import {CollectionDetailPage} from "./pages/collections/collectionDetails.tsx";
import {FeedsPage} from "./pages/feeds/feedsPage.tsx";
import {FeedDetailPage} from "./pages/feeds/feedsDetailPage.tsx";
import {ArticlesPage} from "./pages/articles/articlesPage.tsx";
import {ArticleDetailPage} from "./pages/articles/articlesDetailPage.tsx";
import {SettingsPage} from "./pages/settings/settingPage.tsx";
import {NotFoundPage} from "./pages/notFoundPage.tsx";


export const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },

    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard', element: <DashboardPage /> },
            {
                path: 'collections',
                children: [
                    { index: true, element: <CollectionsPage /> },
                    { path: ':id', element: <CollectionDetailPage /> },
                ],
            },
            {
                path: 'feeds',
                children: [
                    { index: true, element: <FeedsPage /> },
                    { path: ':id', element: <FeedDetailPage /> },
                ],
            },
            {
                path: 'articles',
                children: [
                    { index: true, element: <ArticlesPage /> },
                    { path: ':id', element: <ArticleDetailPage /> },
                ],
            },
            { path: 'settings', element: <SettingsPage /> },
        ],
    },

    { path: '*', element: <NotFoundPage /> },
])
