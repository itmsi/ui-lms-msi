import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

export const QuizMotionProvider = ({ children }: { children: ReactNode }) => (
    <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
);
