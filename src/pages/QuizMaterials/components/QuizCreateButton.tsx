import { Plus } from 'lucide-react';

import { LinkButton } from '@/components/ui/LinkButton';
import { strings } from '@/locales/id';
import { QUIZ_CREATE_PATH } from '@/pages/QuizMaterials/utils/paths';

export const QuizCreateButton = () => (
    <LinkButton to={QUIZ_CREATE_PATH} size="sm" leadingIcon={<Plus aria-hidden="true" className="size-4" />}>
        {strings.quizMaterials.createAction}
    </LinkButton>
);
