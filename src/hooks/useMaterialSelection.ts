import { useRememberedSelection } from '@/hooks/useRememberedSelection';
import type { LearningModule } from '@/types/module';

export const useMaterialSelection = (moduleId: string | null, onSelect: (moduleId: string | null) => void) => {
    const { selected, remember, select } = useRememberedSelection<LearningModule>(moduleId, onSelect);

    return { selectedMaterial: selected, rememberMaterials: remember, selectMaterial: select };
};
