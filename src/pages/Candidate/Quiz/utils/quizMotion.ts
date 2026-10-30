import type { Transition, Variants } from 'motion/react';

const SLIDE_OFFSET_PX = 32;

export const questionSlideVariants: Variants = {
    enter: (direction: number) => ({ x: direction * SLIDE_OFFSET_PX, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: (direction: number) => ({ x: direction * -SLIDE_OFFSET_PX, opacity: 0, transition: { duration: 0.25, ease: 'easeOut' } }),
};

export const indicatorTransition: Transition = { duration: 0.15, ease: 'easeOut' };

export const popIn = {
    initial: { scale: 0.4, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.4, opacity: 0 },
    transition: indicatorTransition,
};

export const listItemMotion = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.97 },
    transition: { duration: 0.2, ease: 'easeOut' },
} as const;

export const reviewListVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const reviewItemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export const PRESSABLE_CLASS =
    'transition-[color,background-color,border-color,opacity,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none';
