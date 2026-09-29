import { useParams } from 'react-router-dom';

import { ModuleDetailView } from '@/components/patterns/ModuleDetailView';
import { useModuleDetail } from '@/hooks/useModuleDetail';
import { strings } from '@/locales/id';

export const LibraryDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { state, retry } = useModuleDetail(id);

    return (
        <section className="flex flex-col gap-5">
            <ModuleDetailView
                state={state}
                onRetry={retry}
                backTo="/library"
                backLabel={strings.library.backToLibrary}
                titleAs="h1"
                variant="library"
            />
        </section>
    );
};

export default LibraryDetail;
