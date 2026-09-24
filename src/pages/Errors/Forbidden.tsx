import { PermissionDenied } from '@/components/patterns/PermissionDenied';
import { LinkButton } from '@/components/ui/LinkButton';
import { strings } from '@/locales/id';

/** Ditampilkan saat pengguna membuka rute yang tidak ada di menu SSO-nya. */
export const Forbidden = () => (
    <section className="flex flex-col gap-6">
        <h1 className="sr-only">{strings.errorPages.forbiddenTitle}</h1>
        <PermissionDenied
            title={strings.errorPages.forbiddenTitle}
            description={strings.errorPages.forbiddenBody}
            action={
                /*
                 * Mengarah ke '/' supaya HomeLanding yang menentukan tujuannya. Menunjuk
                 * '/dashboard' langsung bisa memantul balik ke sini untuk akun yang menu
                 * SSO-nya tidak memuat Dashboard.
                 */
                <LinkButton to="/" variant="secondary" size="sm">
                    {strings.common.backToDashboard}
                </LinkButton>
            }
        />
    </section>
);

export default Forbidden;
