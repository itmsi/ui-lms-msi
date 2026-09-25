import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { PageLoading } from '@/components/patterns/PageLoading';
import { AppShell } from '@/layout/AppShell';
import { GuestRoute } from '@/Routes/GuestRoute';
import { HomeLanding } from '@/Routes/HomeLanding';
import { MenuRoute } from '@/Routes/MenuRoute';
import { ProtectedRoute } from '@/Routes/ProtectedRoute';

const Login = lazy(() => import('@/pages/Auth/Login/Login'));
const Dashboard = lazy(() => import('@/pages/Candidate/Dashboard/Dashboard'));
const Materials = lazy(() => import('@/pages/Instructor/Materials/Materials'));
const MaterialEditor = lazy(() => import('@/pages/Instructor/Materials/MaterialEditor'));
const MaterialDetail = lazy(() => import('@/pages/Instructor/Materials/MaterialDetail'));
const Library = lazy(() => import('@/pages/Candidate/Library/Library'));
const LibraryDetail = lazy(() => import('@/pages/Candidate/Library/LibraryDetail'));
const History = lazy(() => import('@/pages/Candidate/History/History'));
const Profile = lazy(() => import('@/pages/Candidate/Profile/Profile'));
const Forbidden = lazy(() => import('@/pages/Errors/Forbidden'));
const NotFound = lazy(() => import('@/pages/Errors/NotFound'));

export const AppRoutes = () => (
    <Suspense fallback={<PageLoading />}>
        <Routes>
            <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                    <Route index element={<HomeLanding />} />
                    <Route path="/403" element={<Forbidden />} />

                    <Route element={<MenuRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/materials" element={<Materials />} />
                        <Route path="/materials/new" element={<MaterialEditor />} />
                        <Route path="/materials/:id" element={<MaterialDetail />} />
                        <Route path="/materials/:id/edit" element={<MaterialEditor />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/library/:id" element={<LibraryDetail />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
        </Routes>
    </Suspense>
);
