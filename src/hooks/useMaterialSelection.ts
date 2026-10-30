import { useCallback, useState } from 'react';

import type { LearningModule } from '@/types/module';

export const useMaterialSelection = (moduleId: string | null, onSelect: (moduleId: string | null) => void) => {
    const [materials, setMaterials] = useState<Record<string, LearningModule>>({});

    const rememberMaterials = useCallback((items: LearningModule[]) => {
        setMaterials((previous) => {
            const next = { ...previous };

            for (const item of items) {
                next[item.id] = item;
            }

            return next;
        });
    }, []);

    const selectMaterial = useCallback(
        (material: LearningModule | null) => {
            if (material !== null) {
                rememberMaterials([material]);
            }

            onSelect(material?.id ?? null);
        },
        [onSelect, rememberMaterials],
    );

    return {
        selectedMaterial: moduleId === null ? null : (materials[moduleId] ?? null),
        rememberMaterials,
        selectMaterial,
    };
};
