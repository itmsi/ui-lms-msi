import { strings } from '@/locales/id';
import type { CandidateProgram } from '@/types/user';

export type TrackCategory = 'onboarding' | 'mt' | 'reguler';

export interface TrackInfo {
    category: TrackCategory;
    label: string;
    description: string;
}

const TRACK_INFO: Record<TrackCategory, { label: string; description: string }> = {
    onboarding: { label: strings.progress.onboarding, description: strings.trackDetail.descriptionOnboarding },
    mt: { label: strings.progress.mt, description: strings.trackDetail.descriptionMt },
    reguler: { label: strings.progress.functional, description: strings.trackDetail.descriptionFunctional },
};

const isTrackCategory = (value: string | undefined): value is TrackCategory =>
    value === 'onboarding' || value === 'mt' || value === 'reguler';

const isAllowed = (category: TrackCategory, program: CandidateProgram | null): boolean => {
    if (category === 'onboarding') {
        return true;
    }

    if (category === 'mt') {
        return program === 'mt';
    }

    return program !== 'mt';
};

export const resolveTrack = (category: string | undefined, program: CandidateProgram | null): TrackInfo | null => {
    if (isTrackCategory(category) === false || isAllowed(category, program) === false) {
        return null;
    }

    return { category, ...TRACK_INFO[category] };
};
