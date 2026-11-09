export const QUIZ_RESULTS_PATH = '/quiz-results';

export const quizResultDetailPath = (quizId: string) => `${QUIZ_RESULTS_PATH}/${encodeURIComponent(quizId)}`;
