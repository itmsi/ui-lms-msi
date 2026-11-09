import { useMemo } from 'react';

import { readMenuAccess } from '@/helpers/menuAccess';
import type { MenuAccess, PermissionMenu } from '@/helpers/menuAccess';
import { useAuth } from '@/hooks/useAuth';

export const useMenuAccess = (key: PermissionMenu): MenuAccess => {
    const { user } = useAuth();
    const menu = user?.menu;

    return useMemo(() => readMenuAccess(menu ?? [], key), [menu, key]);
};
