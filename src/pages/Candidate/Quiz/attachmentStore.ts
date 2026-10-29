import { isRecord } from '@/helpers/authParsers';
import type { QuizAttachments } from '@/types/quiz';

const DB_NAME = 'msi-learning-quiz';
const STORE_NAME = 'attachments';

const storeKey = (userId: string, quizId: string) => `${userId}:${quizId}`;

const openDatabase = (): Promise<IDBDatabase | null> =>
    new Promise((resolve) => {
        try {
            const request = indexedDB.open(DB_NAME, 1);

            request.onupgradeneeded = () => {
                request.result.createObjectStore(STORE_NAME);
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        } catch {
            resolve(null);
        }
    });

const toAttachments = (value: unknown): QuizAttachments =>
    isRecord(value)
        ? Object.fromEntries(
              Object.entries(value).map(([questionId, files]) => [
                  questionId,
                  Array.isArray(files) ? (files as unknown[]).filter((file): file is File => file instanceof File) : [],
              ]),
          )
        : {};

const run = async <T>(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest,
    fallback: T,
    read: (result: unknown) => T,
) => {
    const database = await openDatabase();

    if (database === null) {
        return fallback;
    }

    return new Promise<T>((resolve) => {
        try {
            const request = action(database.transaction(STORE_NAME, mode).objectStore(STORE_NAME));

            request.onsuccess = () => resolve(read(request.result));
            request.onerror = () => resolve(fallback);
        } catch {
            resolve(fallback);
        }
    });
};

export const readAttachments = (userId: string, quizId: string): Promise<QuizAttachments> =>
    run('readonly', (store) => store.get(storeKey(userId, quizId)), {}, toAttachments);

export const writeAttachments = (userId: string, quizId: string, attachments: QuizAttachments): Promise<boolean> =>
    run(
        'readwrite',
        (store) => store.put(attachments, storeKey(userId, quizId)),
        false,
        () => true,
    );

export const clearAttachments = (userId: string, quizId: string): Promise<boolean> =>
    run(
        'readwrite',
        (store) => store.delete(storeKey(userId, quizId)),
        false,
        () => true,
    );
