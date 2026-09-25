import { FloatingParticles } from '@/components/ui/FloatingParticles';
import '@/components/ui/brand-panel.css';

interface BrandPanelDecorProps {
    particles?: boolean;
}

const RIDGE_BACK = 'M0 420V250L180 175L330 235L520 110L760 245L950 160L1120 230L1290 135L1440 215V420Z';

const RIDGE_MID = 'M0 420V320L150 338L340 285L540 330L700 300L880 278L1060 332L1250 292L1440 322V420Z';

const RIDGE_FRONT = 'M0 420V380L230 355L450 382L720 350L1000 378L1220 358L1440 384V420Z';

export const BrandPanelDecor = ({ particles = true }: BrandPanelDecorProps) => (
    <>
        <svg aria-hidden="true" className="brand-ridges" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice">
            <path d={RIDGE_BACK} fill="var(--color-primary-dark)" opacity="0.5" />
            <path d={RIDGE_MID} fill="var(--bp-900)" opacity="0.85" />
            <path d={RIDGE_FRONT} fill="var(--bp-950)" />
        </svg>
        {particles ? <FloatingParticles /> : null}
    </>
);
