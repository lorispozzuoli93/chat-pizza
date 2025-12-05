import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store';

export const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const isAuth = useAppSelector(s => s.auth.isAuthenticated);

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
