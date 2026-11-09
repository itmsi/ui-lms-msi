export const MY_QUIZ_LIST_PATH = '/my-quizzes';

export const myQuizPath = (quizId: string) => `${MY_QUIZ_LIST_PATH}/${encodeURIComponent(quizId)}`;

export const myQuizResultPath = (quizId: string) => `${myQuizPath(quizId)}/result`;
