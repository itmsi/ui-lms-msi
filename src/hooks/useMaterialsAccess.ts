import { useMemo } from 'react';

import { readMaterialsAccess } from '@/helpers/menuAccess';
import type { MaterialsAccess } from '@/helpers/menuAccess';
import { useAuth } from '@/hooks/useAuth';

export const useMaterialsAccess = (): MaterialsAccess => {
    const { user } = useAuth();
    const menu = user?.menu;

    // Objeknya di-memo supaya aman dipakai sebagai dependency effect.
    return useMemo(() => readMaterialsAccess(menu ?? []), [menu]);
};
