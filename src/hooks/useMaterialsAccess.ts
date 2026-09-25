import { useMemo } from 'react';

import { readMaterialsAccess } from '@/helpers/menuAccess';
import type { MaterialsAccess } from '@/helpers/menuAccess';
import { useAuth } from '@/hooks/useAuth';

export const useMaterialsAccess = (): MaterialsAccess => {
    const { user } = useAuth();
    const menu = user?.menu;

    return useMemo(() => readMaterialsAccess(menu ?? []), [menu]);
};
