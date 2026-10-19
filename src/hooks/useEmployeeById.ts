import { useEffect, useState } from 'react';

import { fetchEmployeeById } from '@/services/employeeService';
import type { Employee } from '@/types/employee';

export const useEmployeeById = (id: string | null, known: Employee | null): Employee | null => {
    const [resolved, setResolved] = useState<{ id: string; employee: Employee | null } | null>(null);

    const needsLookup = id !== null && known === null;

    useEffect(() => {
        if (needsLookup === false || id === null) {
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            const outcome = await fetchEmployeeById(id, controller.signal);

            if (controller.signal.aborted) {
                return;
            }

            setResolved({ id, employee: outcome.ok ? outcome.data : null });
        };

        void run();

        return () => {
            controller.abort();
        };
    }, [id, needsLookup]);

    if (known !== null) {
        return known;
    }

    return resolved !== null && resolved.id === id ? resolved.employee : null;
};
