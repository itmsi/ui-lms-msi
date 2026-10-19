import { UserRound } from 'lucide-react';
import { useState } from 'react';

import { AsyncCombobox, HighlightMatch } from '@/components/ui/AsyncCombobox';
import type { AsyncComboboxTexts } from '@/components/ui/AsyncCombobox';
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch';
import { strings } from '@/locales/id';
import type { Employee } from '@/types/employee';
import { shortId } from '@/utils/shortId';

const BASE_TEXTS: AsyncComboboxTexts = {
    label: strings.employeeSelect.label,
    placeholder: strings.employeeSelect.placeholder,
    clear: strings.employeeSelect.clear,
    empty: strings.employeeSelect.empty,
    failed: strings.employeeSelect.failed,
    count: (shown, total) =>
        `${strings.employeeSelect.showing} ${String(shown)} ${strings.employeeSelect.showingOf} ${String(total)} ${strings.employeeSelect.showingSuffix}`,
};

const describe = (employee: Employee): string =>
    [employee.title, employee.department, employee.company].filter((part) => part !== null).join(' · ');

const EmployeeOption = ({ employee, query }: { employee: Employee; query: string }) => (
    <>
        <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-body text-ink truncate font-medium">
                <HighlightMatch text={employee.name} query={query} />
            </span>
            <span className="text-caption text-muted truncate">{describe(employee)}</span>
        </span>
    </>
);

interface EmployeeSelectProps {
    value: string | null;
    selected: Employee | null;
    onChange: (employee: Employee | null) => void;
    onEmployeesLoaded?: (items: Employee[]) => void;
    fallbackLabel?: string | null;
    label?: string;
    placeholder?: string;
    className?: string;
}

export const EmployeeSelect = ({
    value,
    selected,
    onChange,
    onEmployeesLoaded,
    fallbackLabel,
    label,
    placeholder,
    className,
}: EmployeeSelectProps) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const source = useEmployeeSearch(query, open, onEmployeesLoaded);

    return (
        <AsyncCombobox<Employee>
            source={source}
            query={query}
            onQueryChange={setQuery}
            open={open}
            onOpenChange={setOpen}
            selectedKey={value}
            selectedLabel={selected?.name ?? fallbackLabel ?? (value === null ? '' : shortId(value))}
            getKey={(employee) => employee.id}
            renderOption={(employee, currentQuery) => <EmployeeOption employee={employee} query={currentQuery} />}
            onSelect={onChange}
            texts={{
                ...BASE_TEXTS,
                label: label ?? BASE_TEXTS.label,
                placeholder: placeholder ?? BASE_TEXTS.placeholder,
            }}
            leadingIcon={<UserRound aria-hidden="true" className="text-muted size-4.5 shrink-0" />}
            className={className}
        />
    );
};
