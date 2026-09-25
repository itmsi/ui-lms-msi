import { ArrowRight, CircleAlert, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import type { CSSProperties, SubmitEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { strings } from '@/locales/id';

interface LoginFormProps {
    email: string;
    onEmailChange: (value: string) => void;
    password: string;
    onPasswordChange: (value: string) => void;
    passwordVisible: boolean;
    onTogglePasswordVisibility: () => void;
    submitting: boolean;
    errorMessage: string | null;
    canSubmit: boolean;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
}

const FIELD_CLASS =
    '[&>label]:text-caption [&>label]:font-semibold [&>label]:uppercase [&>label]:tracking-[0.1em] [&>label]:text-primary-dark';

const enterDelay = (delay: string) => ({ '--enter-delay': delay }) as CSSProperties;

export const LoginForm = ({
    email,
    onEmailChange,
    password,
    onPasswordChange,
    passwordVisible,
    onTogglePasswordVisibility,
    submitting,
    errorMessage,
    canSubmit,
    onSubmit,
}: LoginFormProps) => (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="login-enter" style={enterDelay('120ms')}>
            <Input
                label={strings.login.emailLabel}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                placeholder={strings.login.emailPlaceholder}
                value={email}
                disabled={submitting}
                onChange={(event) => onEmailChange(event.target.value)}
                className={FIELD_CLASS}
                inputClassName="login-field h-auto rounded-xl"
                leading={<Mail aria-hidden="true" className="login-field-icon size-5" />}
            />
        </div>

        <div className="login-enter" style={enterDelay('200ms')}>
            <Input
                label={strings.login.passwordLabel}
                type={passwordVisible ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder={strings.login.passwordPlaceholder}
                value={password}
                disabled={submitting}
                onChange={(event) => onPasswordChange(event.target.value)}
                className={FIELD_CLASS}
                inputClassName="login-field login-field--trailing h-auto rounded-xl"
                leading={<Lock aria-hidden="true" className="login-field-icon size-5" />}
                trailing={
                    <button
                        type="button"
                        onClick={onTogglePasswordVisibility}
                        disabled={submitting}
                        aria-label={passwordVisible ? strings.login.hidePassword : strings.login.showPassword}
                        className="text-muted hover:bg-primary-light hover:text-primary-dark flex size-9 items-center justify-center rounded-lg transition-colors"
                    >
                        {passwordVisible ? (
                            <EyeOff aria-hidden="true" className="size-4.5" />
                        ) : (
                            <Eye aria-hidden="true" className="size-4.5" />
                        )}
                    </button>
                }
            />
        </div>

        {errorMessage === null ? null : (
            <p
                role="alert"
                className="bg-danger-soft text-danger-ink text-body login-enter flex items-start gap-2 rounded-xl px-3.5 py-3"
            >
                <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {errorMessage}
            </p>
        )}

        <div className="login-enter" style={enterDelay('280ms')}>
            <Button
                type="submit"
                size="lg"
                fullWidth
                loading={submitting}
                loadingLabel={strings.login.submitting}
                disabled={canSubmit === false}
                trailingIcon={<ArrowRight aria-hidden="true" className="login-submit-arrow size-4.5" />}
                className="login-submit cursor-pointer rounded-xl tracking-[0.02em] text-white"
            >
                {strings.login.submit}
            </Button>
        </div>
    </form>
);
