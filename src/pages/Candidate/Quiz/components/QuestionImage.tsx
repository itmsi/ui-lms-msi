import { strings } from '@/locales/id';

export const QuestionImage = ({ url }: { url: string }) => (
    <img
        src={url}
        alt={strings.myQuiz.questionImageAlt}
        loading="lazy"
        className="border-line max-h-80 w-full rounded-lg border object-contain"
    />
);
