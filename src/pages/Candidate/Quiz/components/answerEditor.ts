import { lazy } from 'react';

export const AnswerEditor = lazy(() => import('@/components/ui/RichTextEditor').then((module) => ({ default: module.RichTextEditor })));
