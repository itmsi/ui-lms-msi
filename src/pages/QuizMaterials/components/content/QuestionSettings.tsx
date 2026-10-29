import { InlineSelect } from '@/components/ui/InlineSelect';
import { Input } from '@/components/ui/Input';
import { strings } from '@/locales/id';
import type { QuizQuestion, TimeUnit } from '@/pages/QuizMaterials/types';

const UNIT_OPTIONS: { value: TimeUnit; label: string }[] = [
    { value: 'minutes', label: strings.quizContent.timeUnit.minutes },
    { value: 'seconds', label: strings.quizContent.timeUnit.seconds },
];

const toNumberText = (value: string): string => value.replace(/[^\d]/g, '');

interface QuestionSettingsProps {
    question: QuizQuestion;
    onChange: (patch: Partial<Pick<QuizQuestion, 'estimatedTime' | 'timeUnit' | 'points'>>) => void;
}

export const QuestionSettings = ({ question, onChange }: QuestionSettingsProps) => (
    <section aria-label={strings.quizContent.settingsLabel} className="border-line flex flex-wrap items-end gap-4 border-t pt-4">
        <div className="flex items-end gap-2">
            <Input
                label={strings.quizContent.timeLabel}
                inputMode="numeric"
                value={question.estimatedTime}
                placeholder="0"
                onChange={(event) => onChange({ estimatedTime: toNumberText(event.target.value) })}
                className="w-24"
                inputClassName="h-9 tabular-nums"
            />
            <InlineSelect
                label={strings.quizContent.timeUnitLabel}
                hideLabel
                options={UNIT_OPTIONS}
                value={question.timeUnit}
                onChange={(timeUnit) => onChange({ timeUnit })}
            />
        </div>

        <Input
            label={strings.quizContent.pointsLabel}
            inputMode="numeric"
            value={question.points}
            placeholder="0"
            onChange={(event) => onChange({ points: toNumberText(event.target.value) })}
            className="w-24"
            inputClassName="h-9 tabular-nums"
        />
    </section>
);
