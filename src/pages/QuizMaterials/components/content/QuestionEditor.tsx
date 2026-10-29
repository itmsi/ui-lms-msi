import { AlertCircle } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { strings } from '@/locales/id';
import { AnswerOptionsEditor } from '@/pages/QuizMaterials/components/content/AnswerOptionsEditor';
import { QuestionContentField } from '@/pages/QuizMaterials/components/content/QuestionContentField';
import { QuestionEditorToolbar } from '@/pages/QuizMaterials/components/content/QuestionEditorToolbar';
import { QuestionSettings } from '@/pages/QuizMaterials/components/content/QuestionSettings';
import type { QuizContentController } from '@/pages/QuizMaterials/hooks/useQuizContent';
import { findIssues } from '@/pages/QuizMaterials/questionModel';
import type { QuizQuestion } from '@/pages/QuizMaterials/types';

interface QuestionEditorProps {
    question: QuizQuestion;
    number: number;
    content: QuizContentController;
    onRequestDelete: () => void;
}

export const QuestionEditor = ({ question, number, content, onRequestDelete }: QuestionEditorProps) => {
    const key = question.key;
    const issues = findIssues(question);

    return (
        <Card className="flex flex-col">
            <QuestionEditorToolbar
                type={question.type}
                onChangeType={(type) => content.changeType(key, type)}
                onDuplicate={() => content.duplicateQuestion(key)}
                onDelete={onRequestDelete}
            />

            <div className="flex flex-col gap-5 p-4 sm:p-5">
                <QuestionContentField
                    number={number}
                    text={question.text}
                    image={question.image}
                    onChangeText={(text) => content.updateQuestion(key, { text })}
                    onChangeImage={(image) => content.updateQuestion(key, { image })}
                />

                <AnswerOptionsEditor
                    question={question}
                    onToggleCorrect={(optionKey) => content.toggleCorrect(key, optionKey)}
                    onChangeOptionText={(optionKey, text) => content.updateOptionText(key, optionKey, text)}
                    onRemoveOption={(optionKey) => content.removeOption(key, optionKey)}
                    onMoveOption={(from, to) => content.moveOption(key, from, to)}
                    onAddOption={() => content.addOption(key)}
                    onChangeTrueFalse={(answer) => content.setTrueFalseAnswer(key, answer)}
                    onChangeExpected={(expectedAnswer) => content.updateQuestion(key, { expectedAnswer })}
                />

                {issues.length === 0 ? null : (
                    <div
                        role="status"
                        className="bg-warning-soft text-warning-ink text-caption flex items-start gap-2 rounded-lg px-3 py-2.5"
                    >
                        <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        <div className="flex flex-col gap-0.5">
                            <span className="font-semibold">{strings.quizContent.issuesHeading}</span>
                            <ul className="list-disc pl-4">
                                {issues.map((issue) => (
                                    <li key={issue}>{strings.quizContent.issues[issue]}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <QuestionSettings question={question} onChange={(patch) => content.updateQuestion(key, patch)} />
            </div>
        </Card>
    );
};
