import type { MenuPermission } from './common';

export type CandidateProgram = 'mt' | 'regular';

export interface UserMenuItem {
    name: string;
    permissions: MenuPermission[];
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    photoUrl: string | null;
    title: string | null;
    department: string | null;
    company: string | null;
    program: CandidateProgram | null;
    menu: UserMenuItem[];
    systems: string[];
}
