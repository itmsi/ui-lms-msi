import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { getButtonClassName } from '@/components/ui/buttonStyles';
import type { ButtonSize, ButtonVariant } from '@/components/ui/buttonStyles';

interface LinkButtonProps {
    to: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    className?: string;
    children: ReactNode;
}

export const LinkButton = ({
    to,
    variant,
    size,
    fullWidth,
    leadingIcon,
    trailingIcon,
    className,
    children,
}: LinkButtonProps) => (
    <Link to={to} className={getButtonClassName({ variant, size, fullWidth, className })}>
        {leadingIcon}
        <span>{children}</span>
        {trailingIcon}
    </Link>
);
