import type { MenuAccess } from '@/helpers/menuAccess';
import { useMenuAccess } from '@/hooks/useMenuAccess';

export const useMaterialsAccess = (): MenuAccess => useMenuAccess('materials');
