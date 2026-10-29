import { Info } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { strings } from '@/locales/id';
import type { ResultScreen } from '@/pages/QuizMaterials/types';

interface ResultScreenSettingsProps {
    result: ResultScreen;
    onChange: (patch: Partial<ResultScreen>) => void;
}

export const ResultScreenSettings = ({ result, onChange }: ResultScreenSettingsProps) => (
    <Card className="flex flex-col gap-5 p-4 sm:p-5">
        <div className="flex flex-col gap-0.5">
            <h2 className="text-section">{strings.quizContent.result.title}</h2>
            <p className="text-caption text-muted">{strings.quizContent.result.hint}</p>
        </div>

        <Input
            label={strings.quizContent.result.titleLabel}
            value={result.title}
            placeholder={strings.quizContent.result.titlePlaceholder}
            onChange={(event) => onChange({ title: event.target.value })}
        />

        <Textarea
            label={strings.quizContent.result.messageLabel}
            value={result.message}
            placeholder={strings.quizContent.result.messagePlaceholder}
            onChange={(event) => onChange({ message: event.target.value })}
            textareaClassName="bg-background"
        />

        <div className="flex flex-col gap-3">
            <Switch
                label={strings.quizContent.result.showScore}
                checked={result.showScore}
                onChange={(showScore) => onChange({ showScore })}
            />
            <Switch
                label={strings.quizContent.result.showCorrectAnswers}
                checked={result.showCorrectAnswers}
                onChange={(showCorrectAnswers) => onChange({ showCorrectAnswers })}
            />
        </div>

        <p className="bg-primary-light text-primary-dark text-caption flex items-start gap-2 rounded-lg p-3">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {strings.quizContent.result.passingNote}
        </p>
    </Card>
);
