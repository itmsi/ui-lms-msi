import { Search, X } from 'lucide-react';
import type { SubmitEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { strings } from '@/locales/id';

interface SearchBarProps {
    label: string;
    placeholder: string;
    /** Nilai yang sedang berlaku, biasanya dari URL. */
    value: string;
    onSubmit: (value: string) => void;
    hasFilters: boolean;
    onClear: () => void;
    disabled: boolean;
}

/**
 * Baris pencarian dibungkus panel bergaris supaya terbaca sebagai alat penjelajahan,
 * bukan formulir. Labelnya disembunyikan secara visual — placeholder sudah menjelaskan
 * isinya — tetapi tetap ada di DOM untuk screen reader.
 *
 * Field dibiarkan uncontrolled dan di-remount lewat `key` saat nilai berubah dari luar.
 * Itu membuat tombol Back dan "bersihkan" ikut mengatur isinya tanpa state bayangan
 * yang harus disinkronkan terus-menerus.
 */
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
            className="bg-surface border-line rounded-card flex flex-wrap items-center gap-2 border p-2"
        >
            <Input
                key={value}
                label={label}
                hideLabel
                type="search"
                name="q"
                defaultValue={value}
                placeholder={placeholder}
                disabled={disabled}
                className="min-w-0 flex-1 basis-64"
                inputClassName="h-11 border-transparent bg-transparent"
                leading={<Search aria-hidden="true" className="text-muted size-4.5" />}
            />

            {hasFilters === false ? null : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    disabled={disabled}
                    leadingIcon={<X aria-hidden="true" className="size-4" />}
                >
                    {strings.library.clearFilters}
                </Button>
            )}

            <Button type="submit" variant="secondary" size="sm" disabled={disabled}>
                {strings.library.searchAction}
            </Button>
        </form>
    );
};
