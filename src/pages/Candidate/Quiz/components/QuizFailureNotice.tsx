import { CircleAlert } from 'lucide-react';
import { m } from 'motion/react';
import type { ReactNode } from 'react';

interface QuizFailureNoticeProps {
    title: string;
    body: string;
    action?: ReactNode;
}

export const QuizFailureNotice = ({ title, body, action }: QuizFailureNoticeProps) => (
    <m.div
        role="alert"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-danger-soft text-danger-ink flex items-start gap-2 rounded-lg p-3.5"
    >
        <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <div className="text-body flex flex-col items-start gap-0.5">
            <p className="font-semibold">{title}</p>
            <p>{body}</p>
            {action === undefined ? null : <div className="mt-2">{action}</div>}
        </div>
    </m.div>
);
