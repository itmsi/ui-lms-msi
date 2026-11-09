export const QUIZ_LIST_PATH = '/quizzes';

export const QUIZ_CREATE_PATH = `${QUIZ_LIST_PATH}/new`;

export const quizDetailPath = (quizId: string) => `${QUIZ_LIST_PATH}/${encodeURIComponent(quizId)}`;
