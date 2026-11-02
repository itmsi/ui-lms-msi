import { useCallback, useState } from 'react';

import { useEmployeeById } from '@/hooks/useEmployeeById';
import type { Employee } from '@/types/employee';

export const useEmployeeDirectory = (employeeId: string | null) => {
    const [employees, setEmployees] = useState<Record<string, Employee>>({});

    const rememberEmployees = useCallback((items: Employee[]) => {
        setEmployees((previous) => {
            const next = { ...previous };

            for (const item of items) {
                next[item.id] = item;
            }

            return next;
        });
    }, []);

    const selected = useEmployeeById(employeeId, employeeId === null ? null : (employees[employeeId] ?? null));

    return { employees, selected, rememberEmployees };
};
