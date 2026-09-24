import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { strings } from '@/locales/id';
import type { AuthErrorCode } from '@/types/auth';

const ERROR_MESSAGE: Record<AuthErrorCode, string> = {
    invalid_credentials: strings.login.invalidCredentials,
    validation: strings.login.validationFallback,
    offline: strings.login.offline,
    unknown: strings.login.unexpectedError,
};

interface LocationState {
    from?: string;
}

export const useLogin = () => {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const canSubmit = email.trim() !== '' && password !== '';

    const togglePasswordVisibility = () => {
        setPasswordVisible((previous) => previous === false);
    };

    const submit = async () => {
        setSubmitting(true);
        setErrorMessage(null);

        const result = await signIn({ email, password });

        if (result.ok) {
            const state = location.state as LocationState | null;
            // Tujuan default dibiarkan ke '/' supaya HomeLanding yang menentukan
            // halaman pertama dari item menu pertama yang dikirim backend.
            void navigate(state?.from ?? '/', { replace: true });
            return;
        }

        // Nilai form sengaja dipertahankan supaya pengguna tidak mengetik ulang.
        setSubmitting(false);
        // Pesan validasi datang dari server dan sudah berbahasa Indonesia.
        setErrorMessage(result.message ?? ERROR_MESSAGE[result.code]);
    };

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Penjaga kirim ganda: tombol juga sudah dinonaktifkan saat submitting.
        if (canSubmit === false || submitting) {
            return;
        }

        void submit();
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        passwordVisible,
        togglePasswordVisibility,
        submitting,
        errorMessage,
        canSubmit,
        handleSubmit,
    };
};
