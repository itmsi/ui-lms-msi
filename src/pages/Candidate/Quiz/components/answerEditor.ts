import { lazy } from 'react';

const loadEditor = () => import('@/components/ui/RichTextEditor');

export const AnswerEditor = lazy(() => loadEditor().then((module) => ({ default: module.RichTextEditor })));

export const preloadAnswerEditor = () => {
    void loadEditor();
};
