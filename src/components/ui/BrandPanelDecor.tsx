import { FloatingParticles } from '@/components/ui/FloatingParticles';
import '@/components/ui/brand-panel.css';

interface BrandPanelDecorProps {
    /**
     * Partikel bergerak terus-menerus. Di halaman Login itu sesaat, tetapi di chrome
     * yang selalu tampil seperti sidebar, matikan bila terasa mengganggu saat membaca.
     */
    particles?: boolean;
}

/**
 * Koordinat ditulis absolut, bukan relatif, supaya tiap titik bisa diperiksa satu per
 * satu dan dasarnya selalu rata di garis bawah viewBox tanpa bergantung penjumlahan.
 *
 * Jarak dan tinggi antar puncak sengaja tidak beraturan, dan tiap lapisan diberi irama
 * berbeda. Versi sebelumnya memakai jarak dan amplitudo yang nyaris seragam di ketiga
 * lapisan, sehingga terbaca sebagai pola chevron, bukan pegunungan.
 */

/**
 * Tiap lapisan dikunci ke pita ketinggiannya sendiri dan pita itu tidak boleh
 * bersinggungan: lembah lapisan belakang tetap lebih tinggi daripada puncak lapisan
 * di depannya. Tanpa aturan ini, lembah yang dalam menembus ke bawah punggungan
 * lapisan berikutnya dan urutan kedalamannya jadi terbaca terbalik.
 */

/** Lapisan terjauh — pita 110–250: puncak tertinggi, lereng paling panjang. */
const RIDGE_BACK = 'M0 420V250L180 175L330 235L520 110L760 245L950 160L1120 230L1290 135L1440 215V420Z';

/** Lapisan tengah — pita 278–338. */
const RIDGE_MID = 'M0 420V320L150 338L340 285L540 330L700 300L880 278L1060 332L1250 292L1440 322V420Z';

/** Lapisan terdepan — pita 350–384: bukit landai, paling rendah dan paling gelap. */
const RIDGE_FRONT = 'M0 420V380L230 355L450 382L720 350L1000 378L1220 358L1440 384V420Z';

/**
 * Hiasan permukaan brand: siluet pegunungan berlapis dan partikel mengambang.
 * Dipasang di dalam elemen yang sudah memakai kelas `brand-panel`; elemen itu yang
 * memegang gradien, `overflow: hidden`, dan konteks posisinya.
 *
 * Isi panel harus diberi `relative z-10` supaya berada di atas hiasan ini.
 */
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
