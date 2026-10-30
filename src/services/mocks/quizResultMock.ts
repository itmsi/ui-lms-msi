import { subMinutes } from 'date-fns';

import { isRecord } from '@/helpers/authParsers';
import { MOCK_QUIZZES, buildAttempt, mockLatency, mockNotFound, readAttempts, writeAttempts } from '@/services/mocks/quizMock';
import type { MockAttachmentMeta, MockQuestion } from '@/services/mocks/quizMock';

const RESULTS_KEY = 'msi-learning:quiz-mock-results:v1';
const ADJUSTED_BY_NAME = 'Contoh: Admin HR';
const DEFAULT_LIMIT = 20;

const QUIZ_LIST_PATH = 'quizzes/get';
const LIST_PATH = 'quiz-results/get';
const DETAIL_PREFIX = 'quiz-results/get/';
const UPDATE_PREFIX = 'quiz-results/update/';

const DEVICE_EMPLOYEE = { id: 'contoh-perangkat-ini', name: 'Contoh: Akun di perangkat ini' };

const MOCK_EMPLOYEES = [
    { id: 'contoh-k01', name: 'Contoh: Andi Pratama' },
    { id: 'contoh-k02', name: 'Contoh: Bunga Lestari' },
    { id: 'contoh-k03', name: 'Contoh: Citra Ayu' },
    { id: 'contoh-k04', name: 'Contoh: Dimas Saputra' },
    { id: 'contoh-k05', name: 'Contoh: Eka Wulandari' },
    { id: 'contoh-k06', name: 'Contoh: Fajar Nugroho' },
    { id: 'contoh-k07', name: 'Contoh: Gita Permata' },
    { id: 'contoh-k08', name: 'Contoh: Hendra Wijaya' },
];

const SHORT_ANSWER_VARIANTS: { text: string; files: MockAttachmentMeta[] }[] = [
    { text: '<p>Phishing</p>', files: [] },
    {
        text: '<p>Penipuan yang menyamar sebagai bank atau tim IT untuk mencuri data login, biasanya disebut <strong>phishing</strong>.</p>',
        files: [],
    },
    {
        text: '<p>Ciri-cirinya:</p><table><tbody><tr><th>Ciri</th><th>Contoh</th></tr><tr><td>Pengirim mirip resmi</td><td>it-support@contoh-palsu.test</td></tr><tr><td>Mendesak</td><td>Akun diblokir dalam 1 jam</td></tr></tbody></table>',
        files: [],
    },
    { text: '', files: [{ name: 'Contoh-analisis-email-phishing.pdf', size: 482113, url: null }] },
    { text: '<p>Spam</p>', files: [{ name: 'Contoh-tangkapan-layar-email.png', size: 231488, url: null }] },
];

type Attempt = Record<string, unknown>;

interface StoredEntry {
    employee_id: string;
    employee_name: string;
    quizzes_id: string;
    attempt: Attempt | null;
}

interface ResultEntry extends StoredEntry {
    source: 'seed' | 'device';
}

const answerFor = (question: MockQuestion, correct: boolean, shortAnswer: string) => {
    const correctIds = question.options.filter((item) => item.correct).map((item) => item.id);
    const wrongIds = question.options.filter((item) => item.correct === false).map((item) => item.id);
    const base = { quiz_questions_id: question.id, option_ids: [] as string[], answer_text: null as string | null };

    if (question.type === 'true_false') {
        const answer = question.true_false_answer ?? 'true';

        return { ...base, answer_text: correct ? answer : answer === 'true' ? 'false' : 'true' };
    }

    if (question.type === 'short_answer') {
        return { ...base, answer_text: shortAnswer };
    }

    if (question.type === 'multiple_answers') {
        return { ...base, option_ids: correct ? correctIds : correctIds.slice(1) };
    }

    const wrong = wrongIds[question.id.length % Math.max(wrongIds.length, 1)];

    return { ...base, option_ids: correct || wrong === undefined ? correctIds : [wrong] };
};

const seedEntries = (): StoredEntry[] => {
    const now = new Date();

    return MOCK_EMPLOYEES.flatMap((employee, employeeIndex) =>
        MOCK_QUIZZES.map((quiz, quizIndex) => {
            const entry = { employee_id: employee.id, employee_name: employee.name, quizzes_id: quiz.id };

            if ((employeeIndex + quizIndex) % 3 === 2) {
                return { ...entry, attempt: null };
            }

            const variant = SHORT_ANSWER_VARIANTS[employeeIndex % SHORT_ANSWER_VARIANTS.length];
            const answers = quiz.questions.map((question, questionIndex) =>
                answerFor(question, (employeeIndex * 7 + questionIndex * 3 + quizIndex) % 5 !== 0, variant.text),
            );
            const maxMinutes = Math.max(-quiz.startOffsetDays * 24 * 60, 60);
            const minutesAgo = ((employeeIndex * 97 + quizIndex * 41) % maxMinutes) + 5;

            return {
                ...entry,
                attempt: buildAttempt(quiz, answers, () => variant.files, subMinutes(now, minutesAgo).toISOString()),
            };
        }),
    );
};

const isStoredEntry = (value: unknown): value is StoredEntry =>
    isRecord(value) &&
    typeof value.employee_id === 'string' &&
    typeof value.employee_name === 'string' &&
    typeof value.quizzes_id === 'string' &&
    (value.attempt === null || isRecord(value.attempt));

const parseEntries = (raw: string | null): StoredEntry[] | null => {
    if (raw === null) {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(raw);

        return Array.isArray(parsed) ? (parsed as unknown[]).filter(isStoredEntry) : null;
    } catch {
        return null;
    }
};

const readStored = (): string | null => {
    try {
        return localStorage.getItem(RESULTS_KEY);
    } catch {
        return null;
    }
};

const writeEntries = (entries: StoredEntry[]) => {
    try {
        localStorage.setItem(RESULTS_KEY, JSON.stringify(entries));
    } catch {
        return;
    }
};

const readEntries = (): StoredEntry[] => {
    const stored = parseEntries(readStored());

    if (stored !== null) {
        return stored;
    }

    const seeded = seedEntries();

    writeEntries(seeded);

    return seeded;
};

const allEntries = (): ResultEntry[] => [
    ...readAttempts().flatMap((attempt): ResultEntry[] =>
        typeof attempt.id === 'string' && typeof attempt.quizzes_id === 'string'
            ? [
                  {
                      employee_id: DEVICE_EMPLOYEE.id,
                      employee_name: DEVICE_EMPLOYEE.name,
                      quizzes_id: attempt.quizzes_id,
                      attempt,
                      source: 'device',
                  },
              ]
            : [],
    ),
    ...readEntries().map((entry): ResultEntry => ({ ...entry, source: 'seed' })),
];

const toRow = (entry: ResultEntry) => {
    const quiz = MOCK_QUIZZES.find((item) => item.id === entry.quizzes_id);
    const { attempt } = entry;

    return {
        id: attempt === null ? `${entry.quizzes_id}:${entry.employee_id}` : attempt.id,
        employee_id: entry.employee_id,
        employee_name: entry.employee_name,
        quizzes_id: entry.quizzes_id,
        quiz_title: quiz?.title ?? '',
        module_title: quiz?.module_title ?? '',
        status: attempt === null ? 'not_completed' : 'completed',
        attempt_id: attempt === null ? null : attempt.id,
        score: attempt === null ? null : attempt.score,
        max_score: attempt === null ? (quiz?.questions.reduce((total, question) => total + question.points, 0) ?? 0) : attempt.max_score,
        submitted_at: attempt === null ? null : attempt.submitted_at,
        is_adjusted: typeof attempt?.adjusted_at === 'string',
        adjusted_at: typeof attempt?.adjusted_at === 'string' ? attempt.adjusted_at : null,
        adjusted_by_name: typeof attempt?.adjusted_by_name === 'string' ? attempt.adjusted_by_name : null,
    };
};

type ResultRow = ReturnType<typeof toRow>;

const readText = (value: unknown): string => (typeof value === 'string' ? value : '');

const compareRows = (left: ResultRow, right: ResultRow): number => {
    if (left.status !== right.status) {
        return left.status === 'completed' ? -1 : 1;
    }

    return left.status === 'completed'
        ? readText(right.submitted_at).localeCompare(readText(left.submitted_at))
        : left.employee_name.localeCompare(right.employee_name, 'id');
};

const listResults = (payload: unknown) => {
    const body = isRecord(payload) ? payload : {};
    const page = typeof body.page === 'number' && body.page > 0 ? body.page : 1;
    const limit = typeof body.limit === 'number' && body.limit > 0 ? body.limit : DEFAULT_LIMIT;
    const search = readText(body.search).trim().toLowerCase();
    const quizId = readText(body.quizzes_id);
    const status = body.status === 'completed' || body.status === 'not_completed' ? body.status : null;

    const rows = allEntries()
        .map(toRow)
        .filter(
            (row) =>
                (search === '' || row.employee_name.toLowerCase().includes(search)) &&
                (quizId === '' || row.quizzes_id === quizId) &&
                (status === null || row.status === status),
        )
        .sort(compareRows);

    return {
        items: rows.slice((page - 1) * limit, page * limit),
        pagination: { page, limit, total: rows.length, totalPages: Math.max(1, Math.ceil(rows.length / limit)) },
    };
};

const findEntry = (attemptId: string) => allEntries().find((entry) => entry.attempt !== null && entry.attempt.id === attemptId);

const toDetail = (entry: ResultEntry, attempt: Attempt) => ({
    ...attempt,
    employee_id: entry.employee_id,
    employee_name: entry.employee_name,
    adjusted_at: typeof attempt.adjusted_at === 'string' ? attempt.adjusted_at : null,
    adjusted_by_name: typeof attempt.adjusted_by_name === 'string' ? attempt.adjusted_by_name : null,
});

const readPoints = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

type PointsUpdate = { ok: true; attempt: Attempt } | { ok: false; message: string };

const applyPoints = (attempt: Attempt, payload: unknown): PointsUpdate => {
    const changes = isRecord(payload) && Array.isArray(payload.points) ? (payload.points as unknown[]).filter(isRecord) : [];
    const review = Array.isArray(attempt.review) ? (attempt.review as unknown[]).filter(isRecord) : [];
    const nextPoints = new Map<string, number>();

    for (const change of changes) {
        const item = review.find((candidate) => candidate.quiz_questions_id === change.quiz_questions_id);
        const value = change.points_earned;

        if (item === undefined || typeof change.quiz_questions_id !== 'string') {
            return { ok: false, message: 'Ada soal yang tidak ditemukan di percobaan ini.' };
        }

        const max = readPoints(item.points);

        if (typeof value !== 'number' || Number.isInteger(value) === false || value < 0 || value > max) {
            return { ok: false, message: `Poin soal ${String(readPoints(item.line))} harus bilangan bulat 0–${String(max)}.` };
        }

        nextPoints.set(change.quiz_questions_id, value);
    }

    if (nextPoints.size === 0) {
        return { ok: false, message: 'Tidak ada poin yang diubah.' };
    }

    const nextReview = review.map((item) => {
        const value = typeof item.quiz_questions_id === 'string' ? nextPoints.get(item.quiz_questions_id) : undefined;

        if (value === undefined) {
            return item;
        }

        const max = readPoints(item.points);

        return {
            ...item,
            auto_points_earned: typeof item.auto_points_earned === 'number' ? item.auto_points_earned : readPoints(item.points_earned),
            points_earned: value,
            is_correct: max > 0 && value === max,
        };
    });

    return {
        ok: true,
        attempt: {
            ...attempt,
            review: nextReview,
            score: nextReview.reduce((total, item) => total + readPoints(item.points_earned), 0),
            correct_count: nextReview.filter((item) => item.is_correct === true).length,
            adjusted_at: new Date().toISOString(),
            adjusted_by_name: ADJUSTED_BY_NAME,
        },
    };
};

const saveAttempt = (entry: ResultEntry, attempt: Attempt) => {
    if (entry.source === 'device') {
        writeAttempts(readAttempts().map((item) => (item.id === attempt.id ? attempt : item)));
        return;
    }

    writeEntries(readEntries().map((item) => (item.attempt !== null && item.attempt.id === attempt.id ? { ...item, attempt } : item)));
};

const listQuizzes = () => ({
    items: MOCK_QUIZZES.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        module_title: quiz.module_title,
        question_count: quiz.questions.length,
    })),
    pagination: { page: 1, limit: MOCK_QUIZZES.length, total: MOCK_QUIZZES.length, totalPages: 1 },
});

export const mockQuizResultRequest = async (path: string, payload?: unknown, signal?: AbortSignal): Promise<{ data: unknown }> => {
    await mockLatency(signal);

    if (path === QUIZ_LIST_PATH) {
        return { data: { success: true, data: listQuizzes() } };
    }

    if (path === LIST_PATH) {
        return { data: { success: true, data: listResults(payload) } };
    }

    const isUpdate = path.startsWith(UPDATE_PREFIX);
    const attemptId = isUpdate
        ? path.slice(UPDATE_PREFIX.length)
        : path.startsWith(DETAIL_PREFIX)
          ? path.slice(DETAIL_PREFIX.length)
          : null;
    const entry = attemptId === null ? undefined : findEntry(attemptId);

    if (entry === undefined || entry.attempt === null) {
        throw mockNotFound();
    }

    if (isUpdate === false) {
        return { data: { success: true, data: toDetail(entry, entry.attempt) } };
    }

    const update = applyPoints(entry.attempt, payload);

    if (update.ok === false) {
        return { data: { success: false, message: update.message } };
    }

    saveAttempt(entry, update.attempt);

    return { data: { success: true, data: toDetail(entry, update.attempt) } };
};
