import { BrandPanelDecor } from '@/components/ui/BrandPanelDecor';
import { strings } from '@/locales/id';

/**
 * Kolom visual kiri. Di mobile menyusut jadi pita pengenal di atas form,
 * sehingga form tetap mendapat ruang terbesar.
 */
export const LoginBrandPanel = () => (
    <aside className="brand-panel flex flex-col justify-between px-6 py-8 lg:min-h-dvh lg:px-12 lg:py-14 xl:px-16">
        <BrandPanelDecor />

        <div className="relative z-10 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center">
                <img src="/msi_logo_white.svg" alt="Motorsights" />
            </span>
            <span className="login-serif text-[1.25rem] leading-7 font-medium tracking-tight">{strings.app.name}</span>
        </div>

        <div className="relative z-10 hidden max-w-[30rem] flex-col gap-5 py-16 lg:flex">
            <p className="text-caption text-(--lg-brand-300) tracking-[0.16em] uppercase">
                {strings.loginBrand.eyebrow}
            </p>
            <p className="login-serif text-[2.75rem] leading-[1.15] font-medium tracking-[-0.01em] text-white">
                {strings.loginBrand.headline}
            </p>
            <p className="text-primary-light text-[0.9375rem] leading-7">{strings.loginBrand.body}</p>
        </div>

        <p className="text-caption relative z-10 hidden text-(--lg-brand-300) lg:block">&nbsp;</p>
    </aside>
);
