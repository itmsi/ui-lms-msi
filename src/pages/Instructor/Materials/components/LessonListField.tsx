import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { strings } from '@/locales/id';
import { LinkListField } from '@/pages/Instructor/Materials/components/LinkListField';
import { createLessonDraft } from '@/pages/Instructor/Materials/types';
import type { DraftErrors, LessonDraft } from '@/pages/Instructor/Materials/types';
import { moveItem, removeAt, replaceAt } from '@/utils/array';

interface LessonListFieldProps {
    lessons: LessonDraft[];
    errors: DraftErrors;
    onChange: (lessons: LessonDraft[]) => void;
}

export const LessonListField = ({ lessons, errors, onChange }: LessonListFieldProps) => {
    const addLesson = () => {
        onChange([...lessons, createLessonDraft()]);
    };

    return (
        <div className="flex flex-col gap-3">
            {lessons.length === 0 ? (
                <Card className="flex flex-col gap-3 p-5 text-center px-4 py-6">
                    <p className="text-card text-ink">{strings.materialEditor.lessonsEmptyTitle}</p>
                    <p className="text-body text-muted mx-auto mt-1 max-w-md">
                        {strings.materialEditor.lessonsEmptyBody}
                    </p>
                    <div className="mt-4">
                        <Button
                            variant="secondary"
                            onClick={addLesson}
                            leadingIcon={<Plus aria-hidden="true" className="size-4" />}
                        >
                            {strings.materialEditor.lessonAdd}
                        </Button>
                    </div>
                </Card>
            ) : null}

            {lessons.map((lesson, index) => {
                const updateLesson = (patch: Partial<LessonDraft>) =>
                    onChange(replaceAt(lessons, index, { ...lesson, ...patch }));

                return (
                    <Card key={lesson.key} className="flex flex-col gap-4 p-4">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-card text-ink">
                                {strings.materialEditor.lessonPrefix} {index + 1}
                            </h3>

                            <div className="flex items-center">
                                <IconButton
                                    label={strings.materialEditor.moveUp}
                                    icon={<ArrowUp aria-hidden="true" className="size-4" />}
                                    disabled={index === 0}
                                    onClick={() => onChange(moveItem(lessons, index, index - 1))}
                                />
                                <IconButton
                                    label={strings.materialEditor.moveDown}
                                    icon={<ArrowDown aria-hidden="true" className="size-4" />}
                                    disabled={index === lessons.length - 1}
                                    onClick={() => onChange(moveItem(lessons, index, index + 1))}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onChange(removeAt(lessons, index))}
                                    className="text-body text-danger-ink hover:bg-danger-soft ml-1"
                                    leadingIcon={<Trash2 aria-hidden="true" className="size-4" />}
                                >
                                    {strings.materialEditor.lessonRemove}
                                </Button>
                            </div>
                        </div>

                        <Input
                            label={strings.materialEditor.lessonTitleLabel}
                            value={lesson.title}
                            placeholder={strings.materialEditor.lessonTitlePlaceholder}
                            error={errors[lesson.key]}
                            onChange={(event) => updateLesson({ title: event.target.value })}
                        />

                        <RichTextEditor
                            label={strings.materialEditor.lessonDescriptionLabel}
                            value={lesson.description}
                            onChange={(description) => updateLesson({ description })}
                        />

                        <div className="flex flex-col gap-2">
                            <span className="text-body text-ink font-medium">{strings.materialEditor.linkLabel}</span>
                            <LinkListField
                                links={lesson.links}
                                errors={errors}
                                onChange={(links) => updateLesson({ links })}
                                emptyText={strings.materialEditor.linksEmpty}
                            />
                        </div>
                    </Card>
                );
            })}

            {lessons.length === 0 ? null : (
                <button
                    type="button"
                    onClick={addLesson}
                    className="border-line text-muted border-primary hover:text-primary cursor-pointer bg-primary-light text-body rounded-card mt-1 flex w-full items-center justify-center gap-2 border border-dashed px-4 py-3 font-medium transition-colors"
                >
                    <Plus aria-hidden="true" className="size-4" />
                    {strings.materialEditor.lessonAdd}
                </button>
            )}
        </div>
    );
};
