import { ChevronDown, ListOrdered, Plus } from 'lucide-react';
import { useId, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { strings } from '@/locales/id';
import { QuestionEditor } from '@/pages/QuizMaterials/components/content/QuestionEditor';
import { QuestionNavigation } from '@/pages/QuizMaterials/components/content/QuestionNavigation';
import { ResultScreenSettings } from '@/pages/QuizMaterials/components/content/ResultScreenSettings';
import type { QuizContentController } from '@/pages/QuizMaterials/hooks/useQuizContent';
import { cn } from '@/utils/cn';

interface QuizContentEditorProps {
    content: QuizContentController;
}

export const QuizContentEditor = ({ content }: QuizContentEditorProps) => {
    const navId = useId();
    const [navOpen, setNavOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<string | null>(null);

    const { questions, selection } = content;
    const activeIndex = selection.kind === 'question' ? questions.findIndex((question) => question.key === selection.key) : -1;
    const activeQuestion = questions[activeIndex];

    const currentLabel =
        selection.kind === 'result'
            ? strings.quizContent.result.title
            : activeQuestion === undefined
              ? strings.quizContent.emptyTitle
              : `${strings.quizContent.questionPrefix} ${String(activeIndex + 1)} · ${strings.quizContent.type[activeQuestion.type]}`;

    const selectQuestion = (key: string) => {
        content.select(key);
        setNavOpen(false);
    };

    const selectResult = () => {
        content.selectResult();
        setNavOpen(false);
    };

    const addQuestion = () => {
        content.addQuestion();
        setNavOpen(false);
    };

    const confirmDelete = () => {
        if (pendingDelete !== null) {
            content.deleteQuestion(pendingDelete);
        }

        setPendingDelete(null);
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
                        selection={selection}
                        onSelect={selectQuestion}
                        onSelectResult={selectResult}
                        onAdd={addQuestion}
                        onDuplicate={content.duplicateQuestion}
                        onMove={content.moveQuestion}
                        onDelete={setPendingDelete}
                    />
                </div>
            </Card>

            <div className="min-w-0">
                {selection.kind === 'result' ? (
                    <ResultScreenSettings result={content.result} onChange={content.updateResult} />
                ) : activeQuestion === undefined ? (
                    <Card>
                        <EmptyState
                            icon={ListOrdered}
                            title={strings.quizContent.emptyTitle}
                            description={strings.quizContent.emptyBody}
                            action={
                                <Button
                                    size="sm"
                                    onClick={content.addQuestion}
                                    leadingIcon={<Plus aria-hidden="true" className="size-4" />}
                                >
                                    {strings.quizContent.addQuestion}
                                </Button>
                            }
                        />
                    </Card>
                ) : (
                    <QuestionEditor
                        key={activeQuestion.key}
                        question={activeQuestion}
                        number={activeIndex + 1}
                        content={content}
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
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    );
};
