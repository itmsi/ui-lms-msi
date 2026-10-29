import { ClipboardList, Plus } from 'lucide-react';

import { PageHeader } from '@/components/patterns/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/LinkButton';
import { strings } from '@/locales/id';

export const QuizMaterials = () => (
    <section className="flex flex-col gap-5">
        <PageHeader
            title={strings.nav.quizMaterials}
            description={strings.quizMaterials.subtitle}
            actions={
                <LinkButton to="/quizzes/new" size="sm" leadingIcon={<Plus aria-hidden="true" className="size-4" />}>
                    {strings.quizMaterials.createAction}
                </LinkButton>
            }
        />

        <Card>
            <EmptyState
                icon={ClipboardList}
                title={strings.quizMaterials.emptyTitle}
                description={strings.quizMaterials.emptyBody}
                action={
                    <LinkButton to="/quizzes/new" size="sm" leadingIcon={<Plus aria-hidden="true" className="size-4" />}>
                        {strings.quizMaterials.createAction}
                    </LinkButton>
                }
            />
        </Card>
    </section>
);

export default QuizMaterials;
