export const QUIZ_RESULTS_PATH = '/quiz-results';

export const quizResultDetailPath = (attemptId: string) => `${QUIZ_RESULTS_PATH}/${encodeURIComponent(attemptId)}`;
