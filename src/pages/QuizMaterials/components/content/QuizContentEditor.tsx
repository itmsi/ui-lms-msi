import { ChevronDown, ListOrdered, Plus } from 'lucide-react';
import { useId, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { strings } from '@/locales/id';
import { QuestionEditor } from '@/pages/QuizMaterials/components/content/QuestionEditor';
import { QuestionNavigation } from '@/pages/QuizMaterials/components/content/QuestionNavigation';
import type { QuizContentController } from '@/pages/QuizMaterials/hooks/useQuizContent';
import { cn } from '@/utils/cn';

interface QuizContentEditorProps {
    content: QuizContentController;
    readOnly: boolean;
}

export const QuizContentEditor = ({ content, readOnly }: QuizContentEditorProps) => {
    const navId = useId();
    const [navOpen, setNavOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<string | null>(null);

    const { questions, selectedKey } = content;
    const activeIndex = questions.findIndex((question) => question.key === selectedKey);
    const activeQuestion = activeIndex === -1 ? undefined : questions[activeIndex];

    const currentLabel =
        activeQuestion === undefined
            ? strings.quizContent.emptyTitle
            : `${strings.quizContent.questionPrefix} ${String(activeIndex + 1)} · ${strings.quizContent.type[activeQuestion.type]}`;

    const selectQuestion = (key: string) => {
        content.select(key);
        setNavOpen(false);
    };

    const addQuestion = () => {
        content.addQuestion();
        setNavOpen(false);
    };

    const busyKeys = new Set([...content.savingKeys, ...content.deletingKeys]);
    const isDeleting = pendingDelete !== null && content.deletingKeys.has(pendingDelete);

    const confirmDelete = async () => {
        if (pendingDelete === null) {
            return;
        }

        if (await content.deleteQuestion(pendingDelete)) {
            setPendingDelete(null);
        }
    };

    return (
        <div className="grid items-start gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)]">
            <Card className="p-3">
                <button
                    type="button"
                    onClick={() => setNavOpen((open) => open === false)}
                    aria-expanded={navOpen}
                    aria-controls={navId}
                    className="text-body text-ink focus-visible:outline-primary flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left focus-visible:outline-2 lg:hidden"
                >
                    <ListOrdered aria-hidden="true" className="text-primary size-4.5 shrink-0" />
                    <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-caption text-muted">{strings.quizContent.mobileToggle}</span>
                        <span className="truncate font-medium">{currentLabel}</span>
                    </span>
                    <ChevronDown
                        aria-hidden="true"
                        className={cn('text-muted size-4 shrink-0 transition-transform', navOpen && 'rotate-180')}
                    />
                </button>

                <div id={navId} className={cn(navOpen ? 'mt-3 block' : 'hidden', 'lg:mt-0 lg:block')}>
                    <QuestionNavigation
                        questions={questions}
                        selectedKey={selectedKey}
                        statuses={content.statuses}
                        busyKeys={busyKeys}
                        readOnly={readOnly}
                        onSelect={selectQuestion}
                        onAdd={addQuestion}
                        onDuplicate={content.duplicateQuestion}
                        onMove={content.moveQuestion}
                        onDelete={setPendingDelete}
                    />
                </div>
            </Card>

            <div className="min-w-0">
                {activeQuestion === undefined ? (
                    <Card>
                        <EmptyState
                            icon={ListOrdered}
                            title={strings.quizContent.emptyTitle}
                            description={readOnly ? strings.quizContent.emptyReadOnlyBody : strings.quizContent.emptyBody}
                            action={
                                readOnly ? undefined : (
                                    <Button
                                        size="sm"
                                        onClick={content.addQuestion}
                                        leadingIcon={<Plus aria-hidden="true" className="size-4" />}
                                    >
                                        {strings.quizContent.addQuestion}
                                    </Button>
                                )
                            }
                        />
                    </Card>
                ) : (
                    <QuestionEditor
                        key={activeQuestion.key}
                        question={activeQuestion}
                        number={activeIndex + 1}
                        content={content}
                        readOnly={readOnly}
                        onRequestDelete={() => setPendingDelete(activeQuestion.key)}
                    />
                )}
            </div>

            <ConfirmDialog
                open={pendingDelete !== null}
                title={strings.quizContent.deleteTitle}
                description={strings.quizContent.deleteBody}
                confirmLabel={strings.quizContent.deleteConfirm}
                cancelLabel={strings.quizContent.deleteCancel}
                isConfirming={isDeleting}
                confirmingLabel={strings.quizContent.deleting}
                onConfirm={() => void confirmDelete()}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    );
};
