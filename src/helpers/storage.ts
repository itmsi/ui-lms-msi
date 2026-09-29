export const tryStorage = (action: (storage: Storage) => void): boolean => {
    try {
        action(window.localStorage);
        return true;
    } catch {
        return false;
    }
};
