import { useEmployeeById } from '@/hooks/useEmployeeById';
import { useRememberedSelection } from '@/hooks/useRememberedSelection';
import type { Employee } from '@/types/employee';

export const useEmployeeSelection = (employeeId: string | null, onSelect: (employeeId: string | null) => void) => {
    const { known, selected, remember, select } = useRememberedSelection<Employee>(employeeId, onSelect);
    const selectedEmployee = useEmployeeById(employeeId, selected);

    return { employees: known, selectedEmployee, rememberEmployees: remember, selectEmployee: select };
};
