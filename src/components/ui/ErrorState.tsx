import { CircleAlert, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';

interface ErrorStateProps {
    title?: string;
    /** Apa yang terjadi. */
    whatHappened?: string;
    /** Apa yang bisa dilakukan pengguna sekarang. */
    whatYouCanDo?: string;
    /** Apa yang terjadi selanjutnya kalau tetap gagal. */
    whatIsNext?: string;
    onRetry?: () => void;
    retrying?: boolean;
    className?: string;
}

/** Error selalu menjawab tiga hal: apa yang terjadi, bisa apa, lalu apa. */
export const ErrorState = ({
    title = strings.states.errorTitle,
    whatHappened = strings.states.errorWhatHappened,
    whatYouCanDo = strings.states.errorWhatYouCanDo,
    whatIsNext = strings.states.errorWhatIsNext,
    onRetry,
    retrying = false,
    className,
}: ErrorStateProps) => (
    <div role="alert" className={cn('flex flex-col items-start gap-3 px-6 py-10', className)}>
        <span className="bg-danger-soft text-danger-ink flex size-10 items-center justify-center rounded-full">
            <CircleAlert aria-hidden="true" className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
            <p className="text-card text-ink">{title}</p>
            <p className="text-body text-muted max-w-md">
                {whatHappened} {whatYouCanDo} {whatIsNext}
            </p>
        </div>
        {onRetry === undefined ? null : (
            <Button
                variant="secondary"
                size="sm"
                loading={retrying}
                onClick={onRetry}
                leadingIcon={<RefreshCw aria-hidden="true" className="size-4" />}
            >
                {strings.common.retry}
            </Button>
        )}
    </div>
);
