export interface FailureMessages {
    unauthorized: string;
    offline: string;
    fallback: string;
}

export const toFailureMessage = (outcome: { code: string; message?: string }, messages: FailureMessages): string => {
    if (outcome.code === 'validation' && outcome.message !== undefined) {
        return outcome.message;
    }

    if (outcome.code === 'unauthorized') {
        return messages.unauthorized;
    }

    return outcome.code === 'offline' ? messages.offline : messages.fallback;
};
