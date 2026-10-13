import { Search, X } from 'lucide-react';
import type { SubmitEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SearchBarProps {
    label: string;
    placeholder: string;
    value: string;
    onSubmit: (value: string) => void;
    hasFilters: boolean;
    onClear: () => void;
    disabled: boolean;
}

export const SearchBar = ({
    label,
    placeholder,
    value,
    onSubmit,
    hasFilters,
    onClear,
    disabled,
}: SearchBarProps) => {
    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        const submitted = new FormData(event.currentTarget).get('q');

        onSubmit(typeof submitted === 'string' ? submitted : '');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-surface border-line rounded-card flex flex-wrap items-center gap-2 border relative"
        >
            <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={disabled}
                className="border-0 absolute left-1 top-1/2 z-1 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-transparent disabled:cursor-not-allowed"
            >
                <Search aria-hidden="true" className="text-muted size-4.5" />
            </Button>
            <Input
                key={value}
                label={label}
                hideLabel
                name="q"
                defaultValue={value}
                placeholder={placeholder}
                disabled={disabled}
                className="min-w-0 flex-1 basis-64"
                inputClassName="h-11 pl-11 border-transparent bg-transparent"
            />

            {hasFilters === false ? null : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    disabled={disabled}
                    className="absolute top-1/2 z-1 transform -translate-y-1/2 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 hover:bg-transparent"
                    leadingIcon={<X aria-hidden="true" className="size-4" />}
                />
            )}

        </form>
    );
};
