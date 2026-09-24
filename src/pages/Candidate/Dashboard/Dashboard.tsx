import { ComingSoon } from '@/components/patterns/ComingSoon';
import { strings } from '@/locales/id';

export const Dashboard = () => {
    return (<>
        <iframe
            src="https://cloud.inlinegroupdc.com/s/4Dm4qCY64mpZYnx/embed"
            title="motorsight"
            width="100%"
            height="600"
        />
        <ComingSoon title={strings.nav.dashboard} />
    </>)
};

export default Dashboard;
