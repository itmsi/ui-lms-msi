import { usePagedSearch } from '@/hooks/usePagedSearch';
import type { PagedSearchFetcher } from '@/hooks/usePagedSearch';
import { fetchEmployees } from '@/services/employeeService';
import type { Employee } from '@/types/employee';

const searchEmployees: PagedSearchFetcher<Employee> = (params, signal) => fetchEmployees(params, signal);

export const useEmployeeSearch = (term: string, enabled: boolean, onLoaded?: (items: Employee[]) => void) =>
    usePagedSearch(searchEmployees, term, enabled, onLoaded);
