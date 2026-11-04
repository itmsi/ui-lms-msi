import { ClipboardCheck } from 'lucide-react';
import { useState } from 'react';

import { AsyncCombobox, HighlightMatch } from '@/components/ui/AsyncCombobox';
import type { AsyncComboboxTexts } from '@/components/ui/AsyncCombobox';
import { useQuizSearch } from '@/hooks/useQuizSearch';
import { strings } from '@/locales/id';
import type { QuizOption } from '@/types/quiz';
import { shortId } from '@/utils/shortId';

const BASE_TEXTS: AsyncComboboxTexts = {
    label: strings.quizSelect.label,
    placeholder: strings.quizSelect.placeholder,
    clear: strings.quizSelect.clear,
    empty: strings.quizSelect.empty,
    failed: strings.quizSelect.failed,
    count: (shown, total) =>
        `${strings.quizSelect.showing} ${String(shown)} ${strings.quizSelect.showingOf} ${String(total)} ${strings.quizSelect.showingSuffix}`,
};

const QuizOptionRow = ({ quiz, query }: { quiz: QuizOption; query: string }) => (
    <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-body text-ink truncate font-medium">
            <HighlightMatch text={quiz.title} query={query} />
        </span>
        {quiz.moduleTitle === null ? null : <span className="text-caption text-muted truncate">{quiz.moduleTitle}</span>}
    </span>
);

interface QuizSelectProps {
    value: string | null;
    selected: QuizOption | null;
    onChange: (quiz: QuizOption | null) => void;
    onQuizzesLoaded?: (items: QuizOption[]) => void;
    fallbackLabel?: string | null;
    label?: string;
    placeholder?: string;
    className?: string;
}

export const QuizSelect = ({ value, selected, onChange, onQuizzesLoaded, fallbackLabel, label, placeholder, className }: QuizSelectProps) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const source = useQuizSearch(query, open, onQuizzesLoaded);

    return (
        <AsyncCombobox<QuizOption>
            source={source}
            query={query}
            onQueryChange={setQuery}
            open={open}
            onOpenChange={setOpen}
            selectedKey={value}
            selectedLabel={selected?.title ?? fallbackLabel ?? (value === null ? '' : shortId(value))}
            getKey={(quiz) => quiz.id}
            renderOption={(quiz, currentQuery) => <QuizOptionRow quiz={quiz} query={currentQuery} />}
            onSelect={onChange}
            texts={{
                ...BASE_TEXTS,
                label: label ?? BASE_TEXTS.label,
                placeholder: placeholder ?? BASE_TEXTS.placeholder,
            }}
            leadingIcon={<ClipboardCheck aria-hidden="true" className="text-muted size-4.5 shrink-0" />}
            className={className}
        />
    );
};
