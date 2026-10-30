import { addDays } from 'date-fns';

import { isRecord } from '@/helpers/authParsers';
import { toIsoDate } from '@/utils/dateTime';
import { htmlToPlainText } from '@/utils/htmlText';

type MockQuestionType = 'multiple_choice' | 'multiple_answers' | 'true_false' | 'short_answer';

interface MockOption {
    id: string;
    text: string;
    correct: boolean;
}

export interface MockQuestion {
    id: string;
    type: MockQuestionType;
    question: string;
    estimated_time: number | null;
    estimated_time_unit: 'minutes' | 'seconds';
    points: number;
    options: MockOption[];
    true_false_answer: 'true' | 'false' | null;
    expected_answer: string | null;
}

export interface MockQuiz {
    id: string;
    title: string;
    modules_id: string;
    module_title: string;
    startOffsetDays: number;
    endOffsetDays: number;
    questions: MockQuestion[];
}

const option = (id: string, text: string, correct = false): MockOption => ({ id, text, correct });

const choice = (
    id: string,
    type: 'multiple_choice' | 'multiple_answers',
    question: string,
    options: MockOption[],
    extra: Partial<Pick<MockQuestion, 'estimated_time' | 'estimated_time_unit' | 'points'>> = {},
): MockQuestion => ({
    id,
    type,
    question,
    estimated_time: 1,
    estimated_time_unit: 'minutes',
    points: 1,
    options,
    true_false_answer: null,
    expected_answer: null,
    ...extra,
});

const trueFalse = (id: string, question: string, answer: 'true' | 'false', points = 1): MockQuestion => ({
    id,
    type: 'true_false',
    question,
    estimated_time: 30,
    estimated_time_unit: 'seconds',
    points,
    options: [],
    true_false_answer: answer,
    expected_answer: null,
});

const shortAnswer = (id: string, question: string, expected: string, extra: Partial<Pick<MockQuestion, 'points'>> = {}): MockQuestion => ({
    id,
    type: 'short_answer',
    question,
    estimated_time: 1,
    estimated_time_unit: 'minutes',
    points: 1,
    options: [],
    true_false_answer: null,
    expected_answer: expected,
    ...extra,
});

export const MOCK_QUIZZES: readonly MockQuiz[] = [
    {
        id: 'contoh-quiz-keamanan-informasi',
        title: 'Contoh: Keamanan Informasi di Tempat Kerja',
        modules_id: 'contoh-materi-keamanan-informasi',
        module_title: 'Keamanan Informasi Dasar',
        startOffsetDays: -3,
        endOffsetDays: 14,
        questions: [
            choice(
                'ki-1',
                'multiple_choice',
                'Anda menerima email yang meminta Anda segera mengklik tautan untuk memverifikasi kata sandi. Apa langkah yang paling tepat?',
                [
                    option('ki-1-a', 'Klik tautannya agar akun tidak diblokir'),
                    option('ki-1-b', 'Laporkan email tersebut ke tim IT tanpa mengklik tautan', true),
                    option('ki-1-c', 'Balas email dan minta penjelasan'),
                    option('ki-1-d', 'Teruskan ke rekan kerja untuk dicek'),
                ],
                { points: 2 },
            ),
            choice(
                'ki-2',
                'multiple_answers',
                'Mana saja yang termasuk ciri kata sandi yang kuat?',
                [
                    option('ki-2-a', 'Minimal 12 karakter', true),
                    option('ki-2-b', 'Gabungan huruf, angka, dan simbol', true),
                    option('ki-2-c', 'Memakai tanggal lahir agar mudah diingat'),
                    option('ki-2-d', 'Berbeda untuk setiap akun', true),
                ],
                { points: 3, estimated_time: 2 },
            ),
            trueFalse('ki-3', 'Meminjamkan akun kerja kepada rekan yang lupa kata sandinya diperbolehkan selama hanya sebentar.', 'false'),
            shortAnswer(
                'ki-4',
                'Apa nama serangan penipuan yang menyamar sebagai pihak tepercaya, biasanya lewat email atau pesan?',
                '<p>phishing</p>',
                {
                    points: 2,
                },
            ),
            choice(
                'ki-5',
                'multiple_choice',
                'Anda akan meninggalkan meja untuk rapat selama 30 menit. Apa yang sebaiknya dilakukan dengan komputer Anda?',
                [
                    option('ki-5-a', 'Biarkan menyala agar pekerjaan tidak hilang'),
                    option('ki-5-b', 'Kunci layar komputer', true),
                    option('ki-5-c', 'Matikan monitornya saja'),
                ],
                { points: 2 },
            ),
        ],
    },
    {
        id: 'contoh-quiz-k3',
        title: 'Contoh: Dasar Keselamatan dan Kesehatan Kerja (K3)',
        modules_id: 'contoh-materi-k3',
        module_title: 'Pengenalan K3',
        startOffsetDays: -7,
        endOffsetDays: 2,
        questions: [
            choice('k3-1', 'multiple_choice', 'Apa kepanjangan dari K3?', [
                option('k3-1-a', 'Keselamatan dan Kesehatan Kerja', true),
                option('k3-1-b', 'Kebersihan, Kerapian, dan Kedisiplinan'),
                option('k3-1-c', 'Kualitas, Kuantitas, dan Kecepatan'),
            ]),
            trueFalse('k3-2', 'Alat Pelindung Diri (APD) cukup dipakai ketika ada pengawas di area kerja.', 'false'),
            choice(
                'k3-3',
                'multiple_answers',
                'Saat alarm kebakaran berbunyi, mana saja tindakan yang benar?',
                [
                    option('k3-3-a', 'Tetap tenang dan ikuti jalur evakuasi', true),
                    option('k3-3-b', 'Memakai lift agar cepat keluar gedung'),
                    option('k3-3-c', 'Berkumpul di titik kumpul yang ditentukan', true),
                    option('k3-3-d', 'Kembali ke meja untuk mengambil barang pribadi'),
                ],
                { points: 2 },
            ),
            choice(
                'k3-4',
                'multiple_choice',
                'Anda melihat tumpahan oli di lantai area kerja. Apa yang sebaiknya dilakukan pertama kali?',
                [
                    option('k3-4-a', 'Melewatinya dengan hati-hati'),
                    option('k3-4-b', 'Memberi tanda peringatan dan melaporkannya', true),
                    option('k3-4-c', 'Menunggu petugas kebersihan lewat'),
                ],
                { points: 2 },
            ),
        ],
    },
    {
        id: 'contoh-quiz-komunikasi',
        title: 'Contoh: Komunikasi Profesional',
        modules_id: 'contoh-materi-komunikasi',
        module_title: 'Etika Komunikasi Kerja',
        startOffsetDays: 0,
        endOffsetDays: 30,
        questions: [
            choice(
                'kom-1',
                'multiple_choice',
                'Bagian mana dari email kerja yang membantu penerima memahami isinya sebelum membuka email?',
                [
                    option('kom-1-a', 'Subjek email yang jelas', true),
                    option('kom-1-b', 'Tanda tangan email'),
                    option('kom-1-c', 'Ukuran lampiran'),
                ],
            ),
            trueFalse('kom-2', 'Dalam rapat daring, mematikan mikrofon saat tidak berbicara membantu mengurangi gangguan suara.', 'true'),
            choice(
                'kom-3',
                'multiple_answers',
                'Mana saja yang termasuk kebiasaan baik sebelum mengirim email kerja?',
                [
                    option('kom-3-a', 'Memeriksa ejaan dan penerima', true),
                    option('kom-3-b', 'Menulis seluruhnya dengan huruf kapital agar tegas'),
                    option('kom-3-c', 'Memastikan lampiran yang disebut benar-benar terlampir', true),
                ],
                { points: 2 },
            ),
        ],
    },
];

const ATTEMPTS_KEY = 'msi-learning:quiz-mock-attempts';
const ALREADY_COMPLETED_MESSAGE = 'Quiz ini sudah Anda kerjakan. Jawaban hanya bisa dikirim satu kali.';
const MAX_STORED_ATTEMPTS = 30;
const LATENCY_MS = 450;

const LIST_PATH = 'quizzes/participant/get';
const DETAIL_PREFIX = 'quizzes/participant/get/';
const SUBMIT_PATH = 'quiz-attempts/submit';
const ATTEMPT_PREFIX = 'quiz-attempts/get/';

export const mockLatency = (signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, LATENCY_MS);

        signal?.addEventListener(
            'abort',
            () => {
                clearTimeout(timer);
                reject(new DOMException('Aborted', 'AbortError'));
            },
            { once: true },
        );
    });

const toSeconds = (question: MockQuestion): number =>
    question.estimated_time === null ? 0 : question.estimated_time * (question.estimated_time_unit === 'minutes' ? 60 : 1);

const periodOf = (quiz: MockQuiz) => {
    const today = new Date();

    return { start_date: toIsoDate(addDays(today, quiz.startOffsetDays)), end_date: toIsoDate(addDays(today, quiz.endOffsetDays)) };
};

const summaryOf = (quiz: MockQuiz) => {
    const lastAttempt = lastAttemptOf(quiz);

    return {
        id: quiz.id,
        title: quiz.title,
        modules_id: quiz.modules_id,
        module_title: quiz.module_title,
        module_banner: null,
        ...periodOf(quiz),
        question_count: quiz.questions.length,
        estimated_seconds: quiz.questions.reduce((total, question) => total + toSeconds(question), 0),
        is_completed: lastAttempt !== null,
        last_attempt: lastAttempt,
    };
};

export const readAttempts = (): Record<string, unknown>[] => {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) ?? '[]');

        return Array.isArray(parsed) ? (parsed as unknown[]).filter(isRecord) : [];
    } catch {
        return [];
    }
};

export const writeAttempts = (attempts: Record<string, unknown>[]) => {
    try {
        localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts.slice(0, MAX_STORED_ATTEMPTS)));
    } catch {
        return;
    }
};

const lastAttemptOf = (quiz: MockQuiz) => {
    const attempt = readAttempts().find((item) => item.quizzes_id === quiz.id);

    return attempt === undefined
        ? null
        : { id: attempt.id, score: attempt.score, max_score: attempt.max_score, submitted_at: attempt.submitted_at };
};

const toQuestionPayload = (question: MockQuestion, line: number) => ({
    id: question.id,
    line,
    type: question.type,
    question: question.question,
    image: null,
    estimated_time: question.estimated_time,
    estimated_time_unit: question.estimated_time_unit,
    points: question.points,
    options: question.options.map((item, index) => ({ id: item.id, line: index + 1, text: item.text })),
});

const TRUE_FALSE_LABEL: Record<'true' | 'false', string> = { true: 'Benar', false: 'Salah' };

const normalizeText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

interface MockSubmission {
    quizId: string | null;
    answers: unknown[];
    filesOf: (questionId: string) => File[];
}

const parseAnswers = (value: FormDataEntryValue | null): unknown[] => {
    try {
        const parsed: unknown = typeof value === 'string' ? JSON.parse(value) : [];

        return Array.isArray(parsed) ? (parsed as unknown[]) : [];
    } catch {
        return [];
    }
};

const readSubmission = (payload: unknown): MockSubmission => {
    if (payload instanceof FormData) {
        const quizId = payload.get('quizzes_id');

        return {
            quizId: typeof quizId === 'string' ? quizId : null,
            answers: parseAnswers(payload.get('answers')),
            filesOf: (questionId) => payload.getAll(`attachments[${questionId}]`).filter((entry): entry is File => entry instanceof File),
        };
    }

    return { quizId: null, answers: [], filesOf: () => [] };
};

const readSubmittedAnswer = (answers: unknown[], questionId: string) => {
    const answer = answers.filter(isRecord).find((item) => item.quiz_questions_id === questionId);
    const optionIds = Array.isArray(answer?.option_ids)
        ? (answer.option_ids as unknown[]).filter((id): id is string => typeof id === 'string')
        : [];
    const text = typeof answer?.answer_text === 'string' ? answer.answer_text : '';

    return { optionIds, text };
};

const gradeQuestion = (question: MockQuestion, answers: unknown[]) => {
    const { optionIds, text } = readSubmittedAnswer(answers, question.id);
    const correctOptions = question.options.filter((item) => item.correct);

    if (question.type === 'true_false') {
        return {
            isCorrect: text === question.true_false_answer,
            yourAnswer: text === 'true' || text === 'false' ? [TRUE_FALSE_LABEL[text]] : [],
            correctAnswer: question.true_false_answer === null ? [] : [TRUE_FALSE_LABEL[question.true_false_answer]],
        };
    }

    if (question.type === 'short_answer') {
        const plain = htmlToPlainText(text);

        return {
            isCorrect: plain !== '' && normalizeText(plain) === normalizeText(htmlToPlainText(question.expected_answer ?? '')),
            yourAnswer: plain === '' ? [] : [text.trim()],
            correctAnswer: question.expected_answer === null ? [] : [question.expected_answer],
        };
    }

    const chosen = question.options.filter((item) => optionIds.includes(item.id));

    return {
        isCorrect: chosen.length === correctOptions.length && chosen.every((item) => item.correct),
        yourAnswer: chosen.map((item) => item.text),
        correctAnswer: correctOptions.map((item) => item.text),
    };
};

const createAttemptId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `contoh-${String(Date.now())}`;

export interface MockAttachmentMeta {
    name: string;
    size: number | null;
    url: string | null;
}

export const buildAttempt = (
    quiz: MockQuiz,
    answers: unknown[],
    attachmentsOf: (questionId: string) => MockAttachmentMeta[],
    submittedAt: string,
) => {
    const review = quiz.questions.map((question, index) => {
        const graded = gradeQuestion(question, answers);
        const pointsEarned = graded.isCorrect ? question.points : 0;

        return {
            quiz_questions_id: question.id,
            line: index + 1,
            type: question.type,
            question: question.question,
            your_answer: graded.yourAnswer,
            your_attachments: question.type === 'short_answer' ? attachmentsOf(question.id) : [],
            correct_answer: graded.correctAnswer,
            is_correct: graded.isCorrect,
            points_earned: pointsEarned,
            auto_points_earned: pointsEarned,
            points: question.points,
        };
    });

    return {
        id: createAttemptId(),
        quizzes_id: quiz.id,
        quiz_title: quiz.title,
        module_title: quiz.module_title,
        submitted_at: submittedAt,
        score: review.reduce((total, item) => total + item.points_earned, 0),
        max_score: review.reduce((total, item) => total + item.points, 0),
        correct_count: review.filter((item) => item.is_correct).length,
        question_count: review.length,
        review,
    };
};

const submitAttempt = (submission: MockSubmission) => {
    const quiz = MOCK_QUIZZES.find((item) => item.id === submission.quizId);

    if (quiz === undefined) {
        return null;
    }

    const attempt = buildAttempt(
        quiz,
        submission.answers,
        (questionId) => submission.filesOf(questionId).map((file) => ({ name: file.name, size: file.size, url: null })),
        new Date().toISOString(),
    );

    writeAttempts([attempt, ...readAttempts()]);

    return attempt;
};

export const mockNotFound = () => Object.assign(new Error('Not found'), { status: 404 });

export const mockQuizRequest = async (path: string, payload?: unknown, signal?: AbortSignal): Promise<{ data: unknown }> => {
    await mockLatency(signal);

    if (path === LIST_PATH) {
        return { data: { success: true, data: MOCK_QUIZZES.map(summaryOf) } };
    }

    if (path.startsWith(DETAIL_PREFIX)) {
        const quiz = MOCK_QUIZZES.find((item) => item.id === path.slice(DETAIL_PREFIX.length));

        if (quiz === undefined) {
            throw mockNotFound();
        }

        const summary = summaryOf(quiz);

        return {
            data: {
                success: true,
                data: {
                    ...summary,
                    questions: summary.is_completed ? [] : quiz.questions.map((question, index) => toQuestionPayload(question, index + 1)),
                },
            },
        };
    }

    if (path === SUBMIT_PATH) {
        const submission = readSubmission(payload);

        if (readAttempts().some((item) => item.quizzes_id === submission.quizId)) {
            return { data: { success: false, message: ALREADY_COMPLETED_MESSAGE } };
        }

        const attempt = submitAttempt(submission);

        if (attempt === null) {
            throw mockNotFound();
        }

        return { data: { success: true, data: attempt } };
    }

    if (path.startsWith(ATTEMPT_PREFIX)) {
        const attempt = readAttempts().find((item) => item.id === path.slice(ATTEMPT_PREFIX.length));

        if (attempt === undefined) {
            throw mockNotFound();
        }

        return { data: { success: true, data: attempt } };
    }

    throw mockNotFound();
};
