import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { strings } from '@/locales/id';
import { TrackDetailContent } from '@/pages/Candidate/TrackDetail/components/TrackDetailContent';
import { resolveTrack } from '@/pages/Candidate/TrackDetail/track';

export const TrackDetail = () => {
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const track = user === null ? null : resolveTrack(category, user.program);

    useEffect(() => {
        if (user !== null && track === null) {
            toast.error(strings.trackDetail.unavailableToast);
            void navigate('/dashboard', { replace: true });
        }
    }, [user, track, navigate]);

    if (track === null) {
        return null;
    }

    return <TrackDetailContent track={track} />;
};

export default TrackDetail;
