import { Save } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { strings } from '@/locales/id';

interface GradingSaveBarProps {
    changedCount: number;
    draftScore: number;
    savedScore: number;
    maxScore: number;
    isSaving: boolean;
    onDiscard: () => void;
    onSave: () => void;
}

export const GradingSaveBar = ({ changedCount, draftScore, savedScore, maxScore, isSaving, onDiscard, onSave }: GradingSaveBarProps) => (
    <div className="motion-rise sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 lg:bottom-4">
        <div className="border-line bg-surface shadow-raised flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body text-ink tabular-nums" aria-live="polite">
                <span className="font-semibold">{`${String(changedCount)} ${strings.quizResults.changedSuffix}`}</span>
                <span className="text-muted">{` · ${strings.quizResults.newScore} `}</span>
                <span className="font-semibold">{`${String(draftScore)}/${String(maxScore)}`}</span>
                <span className="text-muted">{` (${strings.quizResults.previousScore} ${String(savedScore)})`}</span>
            </p>
            <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={onDiscard} disabled={isSaving}>
                    {strings.quizResults.discard}
                </Button>
                <Button
                    size="sm"
                    onClick={onSave}
                    loading={isSaving}
                    loadingLabel={strings.quizResults.saving}
                    leadingIcon={<Save aria-hidden="true" className="size-4" />}
                >
                    {strings.quizResults.save}
                </Button>
            </div>
        </div>
    </div>
);
