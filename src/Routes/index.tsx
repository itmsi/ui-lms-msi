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
const TrackDetail = lazy(() => import('@/pages/Candidate/TrackDetail/TrackDetail'));
const Materials = lazy(() => import('@/pages/Instructor/Materials/Materials'));
const MaterialEditor = lazy(() => import('@/pages/Instructor/Materials/MaterialEditor'));
const MaterialDetail = lazy(() => import('@/pages/Instructor/Materials/MaterialDetail'));
const QuizMaterials = lazy(() => import('@/pages/QuizMaterials/QuizMaterials'));
const QuizCreate = lazy(() => import('@/pages/QuizMaterials/QuizCreate'));
const MyQuizzes = lazy(() => import('@/pages/Candidate/Quiz/MyQuizzes'));
const QuizAttempt = lazy(() => import('@/pages/Candidate/Quiz/QuizAttempt'));
const QuizResult = lazy(() => import('@/pages/Candidate/Quiz/QuizResult'));
const Library = lazy(() => import('@/pages/Candidate/Library/Library'));
const LibraryDetail = lazy(() => import('@/pages/Candidate/Library/LibraryDetail'));
const History = lazy(() => import('@/pages/Candidate/History/History'));
const MyActivity = lazy(() => import('@/pages/Activity/MyActivity/MyActivity'));
const UserActivity = lazy(() => import('@/pages/Activity/UserActivity/UserActivity'));
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
                        <Route path="/tracks/:category" element={<TrackDetail />} />
                        <Route path="/materials" element={<Materials />} />
                        <Route path="/materials/new" element={<MaterialEditor />} />
                        <Route path="/materials/:id" element={<MaterialDetail />} />
                        <Route path="/materials/:id/edit" element={<MaterialEditor />} />
                        <Route path="/quizzes" element={<QuizMaterials />} />
                        <Route path="/quizzes/new" element={<QuizCreate />} />
                        <Route path="/my-quizzes" element={<MyQuizzes />} />
                        <Route path="/my-quizzes/:quizId" element={<QuizAttempt />} />
                        <Route path="/my-quizzes/:quizId/result/:attemptId" element={<QuizResult />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/library/:id" element={<LibraryDetail />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/my-activity" element={<MyActivity />} />
                        <Route path="/user-activity" element={<UserActivity />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
        </Routes>
    </Suspense>
);
