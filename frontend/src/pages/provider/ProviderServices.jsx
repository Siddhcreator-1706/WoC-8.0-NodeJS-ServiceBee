import { useOutletContext } from 'react-router-dom';
import ServiceList from '../../components/provider/ServiceList';

const ProviderServices = () => {
    const { company, refreshCompany } = useOutletContext();

    if (!company) return <div>Please register your company first.</div>;

    return <ServiceList services={company.services || []} onUpdate={refreshCompany} />;
};

export default ProviderServices;
