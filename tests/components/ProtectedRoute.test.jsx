import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import { useAuth } from '../../src/context/AuthContext';

jest.mock('../../src/context/AuthContext');

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;
const DashboardComponent = () => <div>Dashboard Page</div>;

const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ui} />
                <Route path="/login" element={<LoginComponent />} />
                <Route path="/dashboard" element={<DashboardComponent />} />
            </Routes>
        </BrowserRouter>
    );
};

describe('ProtectedRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        test('displays loading indicator when auth is loading', () => {
            useAuth.mockReturnValue({
                user: null,
                loading: true,
            });

            renderWithRouter(
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Loading...')).toBeInTheDocument();
            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });
    });

    describe('Unauthenticated Access', () => {
        test('redirects to login when user is not authenticated', () => {
            useAuth.mockReturnValue({
                user: null,
                loading: false,
            });

            renderWithRouter(
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Login Page')).toBeInTheDocument();
            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });
    });

    describe('Authenticated Access', () => {
        test('renders children when user is authenticated', () => {
            useAuth.mockReturnValue({
                user: { id: 1, name: 'John Doe', role: 'User' },
                loading: false,
            });

            renderWithRouter(
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
            expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
        });

        test('allows authenticated user to access non-admin routes', () => {
            useAuth.mockReturnValue({
                user: { id: 1, name: 'John Doe', role: 'User' },
                loading: false,
            });

            renderWithRouter(
                <ProtectedRoute requireAdmin={false}>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });
    });

    describe('Admin Access', () => {
        test('allows admin user to access admin routes', () => {
            useAuth.mockReturnValue({
                user: { id: 1, name: 'Admin User', role: 'Admin' },
                loading: false,
            });

            renderWithRouter(
                <ProtectedRoute requireAdmin={true}>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });

        test('redirects non-admin user to dashboard when accessing admin routes', () => {
            useAuth.mockReturnValue({
                user: { id: 2, name: 'Regular User', role: 'User' },
                loading: false,
            });

            renderWithRouter(
                <ProtectedRoute requireAdmin={true}>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });

        test('does not require admin when requireAdmin is false', () => {
            useAuth.mockReturnValue({
                user: { id: 2, name: 'Regular User', role: 'User' },
                loading: false,
            });

            renderWithRouter(
                <ProtectedRoute requireAdmin={false}>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        test('handles missing role in user object', () => {
            useAuth.mockReturnValue({
                user: { id: 1, name: 'User Without Role' },
                loading: false,
            });

            renderWithRouter(
                <ProtectedRoute requireAdmin={true}>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });

        test('treats requireAdmin as false by default', () => {
            useAuth.mockReturnValue({
                user: { id: 1, name: 'John Doe', role: 'User' },
                loading: false,
            });

            renderWithRouter(
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });
    });
});
