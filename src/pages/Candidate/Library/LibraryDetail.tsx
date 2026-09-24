import { useParams } from 'react-router-dom';

import { ModuleDetailView } from '@/components/patterns/ModuleDetailView';
import { useModuleDetail } from '@/hooks/useModuleDetail';
import { strings } from '@/locales/id';

/**
 * Detail materi Perpustakaan. Isinya sama dengan detail Materi milik Instructor, tetapi
 * tanpa header, tombol kembali, maupun aksi Ubah/Hapus — kandidat hanya membaca.
 * Judul materi di atas banner menjadi `h1` halaman ini.
 */
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
            />
        </section>
    );
};

export default LibraryDetail;
