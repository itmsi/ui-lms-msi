import { EmployeeSelect } from '@/components/patterns/EmployeeSelect';
import { QuizSelect } from '@/components/patterns/QuizSelect';
import { SearchBar } from '@/components/patterns/SearchBar';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { useEmployeeSelection } from '@/hooks/useEmployeeSelection';
import { useRememberedSelection } from '@/hooks/useRememberedSelection';
import { strings } from '@/locales/id';
import type { QuizResultStatusFilter } from '@/pages/QuizResults/types';
import type { QuizOption } from '@/types/quiz';

const STATUS_OPTIONS: SegmentedOption<QuizResultStatusFilter>[] = [
    { value: 'all', label: strings.quizResults.statusAll },
    { value: 'completed', label: strings.quizResults.status.completed },
    { value: 'not_completed', label: strings.quizResults.status.not_completed },
];

interface FilterSectionProps {
    searchValue: string;
    quizId: string | null;
    quizTitle: string | null;
    employeeId: string | null;
    employeeName: string | null;
    status: QuizResultStatusFilter;
    hasFilters: boolean;
    disabled: boolean;
    onSearchSubmit: (value: string) => void;
    onSelectQuiz: (quizId: string | null) => void;
    onSelectEmployee: (employeeId: string | null) => void;
    onSelectStatus: (status: QuizResultStatusFilter) => void;
    onClearFilters: () => void;
}

export const FilterSection = ({
    searchValue,
    quizId,
    quizTitle,
    employeeId,
    employeeName,
    status,
    hasFilters,
    disabled,
    onSearchSubmit,
    onSelectQuiz,
    onSelectEmployee,
    onSelectStatus,
    onClearFilters,
}: FilterSectionProps) => {
    const quiz = useRememberedSelection<QuizOption>(quizId, onSelectQuiz);
    const employee = useEmployeeSelection(employeeId, onSelectEmployee);

    return (
        <div className="flex flex-col gap-3">
            <SearchBar
                label={strings.quizResults.searchLabel}
                placeholder={strings.quizResults.searchPlaceholder}
                value={searchValue}
                onSubmit={onSearchSubmit}
                hasFilters={hasFilters}
                onClear={onClearFilters}
                disabled={disabled}
            />
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-3xl">
                    <div className="flex flex-col gap-1.5">
                        <QuizSelect
                            value={quizId}
                            selected={quiz.selected}
                            onChange={quiz.select}
                            onQuizzesLoaded={quiz.remember}
                            fallbackLabel={quizTitle}
                            label={strings.quizResults.quizFilterLabel}
                            placeholder={strings.quizResults.quizFilterPlaceholder}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <EmployeeSelect
                            value={employeeId}
                            selected={employee.selectedEmployee}
                            onChange={employee.selectEmployee}
                            onEmployeesLoaded={employee.rememberEmployees}
                            fallbackLabel={employeeName}
                            label={strings.quizResults.employeeFilterLabel}
                            placeholder={strings.quizResults.employeeFilterPlaceholder}
                        />
                    </div>
                </div>
                <SegmentedControl
                    label={strings.quizResults.statusFilterLabel}
                    showlabel
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={onSelectStatus}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};
