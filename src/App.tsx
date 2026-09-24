import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '@/context/AuthProvider';
import { AppRoutes } from '@/Routes';

export const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <AppRoutes />
            <Toaster
                position="top-center"
                toastOptions={{
                    className: 'text-body',
                    style: { borderRadius: '12px', border: '1px solid #E4E7EC', color: '#172033' },
                }}
            />
        </AuthProvider>
    </BrowserRouter>
);
