import type { CSSProperties } from 'react';

import { strings } from '@/locales/id';
import { LoginBrandPanel } from '@/pages/Auth/Login/components/LoginBrandPanel';
import { LoginForm } from '@/pages/Auth/Login/components/LoginForm';
import { useLogin } from '@/pages/Auth/Login/hooks/useLogin';
import '@/pages/Auth/Login/login.css';

const enterDelay = (delay: string) => ({ '--enter-delay': delay }) as CSSProperties;

export const Login = () => {
    const {
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
    } = useLogin();

    return (
        <div className="login-page min-h-dvh bg-white lg:grid lg:grid-cols-2">
            <LoginBrandPanel />

            <main className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12 lg:py-14">
                <div className="w-full max-w-[26rem]">
                    <div className="login-enter flex flex-col gap-2" style={enterDelay('40ms')}>
                        <h1 className="login-serif text-ink text-[2rem] leading-10 font-medium">
                            {strings.login.title}
                        </h1>
                        <p className="text-body text-muted">{strings.login.subtitle}</p>
                    </div>

                    <div className="mt-8">
                        <LoginForm
                            email={email}
                            onEmailChange={setEmail}
                            password={password}
                            onPasswordChange={setPassword}
                            passwordVisible={passwordVisible}
                            onTogglePasswordVisibility={togglePasswordVisibility}
                            submitting={submitting}
                            errorMessage={errorMessage}
                            canSubmit={canSubmit}
                            onSubmit={handleSubmit}
                        />
                    </div>

                    <p
                        className="login-enter text-caption text-muted mt-7 text-center"
                        style={enterDelay('360ms')}
                    >
                        {strings.login.forgotHelper}
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Login;
