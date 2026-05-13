import { useState, useEffect } from 'react';
import axios from 'axios';
import { fallbackLocationData } from '../data/locationData';

const useLocationData = (selectedState = '') => {
    const [statesList, setStatesList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    // Fetch states on mount (via backend proxy)
    useEffect(() => {
        setLoadingStates(true);
        const fetchStates = async () => {
            try {
                const { data } = await axios.get('/api/locations/states');
                if (data.success && data.data && Array.isArray(data.data.states)) {
                    setStatesList(data.data.states);
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (err) {
                console.warn("Failed to fetch states from API, using fallback data:", err);
                setStatesList(fallbackLocationData.states);
            } finally {
                setLoadingStates(false);
            }
        };

        fetchStates();
    }, []);

    // Fetch districts when state changes (via backend proxy)
    useEffect(() => {
        if (!selectedState) {
            setDistrictsList([]);
            return;
        }
        setLoadingDistricts(true);
        const fetchDistricts = async () => {
            try {
                const stateId = selectedState.toUpperCase();
                const { data } = await axios.get(`/api/locations/districts?state=${encodeURIComponent(stateId)}`);
                if (data.success && data.data && Array.isArray(data.data.districts)) {
                    setDistrictsList(data.data.districts);
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (err) {
                console.warn("Failed to fetch districts from API, using fallback data:", err);
                const fallbackDistricts = fallbackLocationData.districts[selectedState] || [];
                setDistrictsList(fallbackDistricts.map(name => ({ name })));
            } finally {
                setLoadingDistricts(false);
            }
        };

        fetchDistricts();
    }, [selectedState]);

    return {
        statesList: statesList.map(s => ({ value: s.name, label: s.name })),
        districtsList: districtsList.map(d => ({ value: d.name, label: d.name })),
        loadingStates,
        loadingDistricts
    };
};

export default useLocationData;
