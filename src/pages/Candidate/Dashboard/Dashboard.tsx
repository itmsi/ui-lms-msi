import { PageHeader } from '@/components/patterns/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { strings } from '@/locales/id';
import { TrackSection } from '@/pages/Candidate/Dashboard/components/TrackSection';

export const Dashboard = () => {
    const { user } = useAuth();

    if (user === null) {
        return null;
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title={`${strings.dashboard.greetingPrefix}, ${user.name}`}
                description={strings.dashboard.subtitle}
            />

            <TrackSection title={strings.progress.onboarding} category="onboarding" />

            {user.program === 'mt' ? (
                <TrackSection title={strings.progress.mt} category="mt" />
            ) : (
                <TrackSection title={strings.progress.functional} category="reguler" />
            )}
        </div>
    );
};

export default Dashboard;
