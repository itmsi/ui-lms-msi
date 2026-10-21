import { ErrorState } from '@/components/ui/ErrorState';
import { strings } from '@/locales/id';
import type { ApiFailureCode } from '@/types/module';

interface ApiErrorStateProps {
    code: ApiFailureCode;
    message?: string;
    unauthorizedTitle: string;
    onRetry: () => void;
}

export const ApiErrorState = ({ code, message, unauthorizedTitle, onRetry }: ApiErrorStateProps) => {
    if (code === 'unauthorized') {
        return (
            <ErrorState
                title={unauthorizedTitle}
                whatHappened={strings.apiErrors.unauthorizedHappened}
                whatYouCanDo={strings.apiErrors.unauthorizedDo}
                whatIsNext={strings.apiErrors.unauthorizedNext}
            />
        );
    }

    if (code === 'offline') {
        return (
            <ErrorState
                whatHappened={strings.apiErrors.offlineHappened}
                whatYouCanDo={strings.apiErrors.offlineDo}
                whatIsNext={strings.apiErrors.offlineNext}
                onRetry={onRetry}
            />
        );
    }

    if (code === 'validation' && message !== undefined) {
        return (
            <ErrorState
                whatHappened={message}
                whatYouCanDo={strings.apiErrors.validationDo}
                whatIsNext={strings.apiErrors.validationNext}
                onRetry={onRetry}
            />
        );
    }

    return <ErrorState onRetry={onRetry} />;
};
