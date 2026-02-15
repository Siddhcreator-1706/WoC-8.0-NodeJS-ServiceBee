import { useState, useEffect } from 'react';
import { fallbackLocationData } from '../data/locationData';

const useLocationData = (selectedState = '') => {
    const [statesList, setStatesList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    // Fetch states on mount
    useEffect(() => {
        setLoadingStates(true);
        const fetchStates = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                const response = await fetch('https://www.india-location-hub.in/api/locations/states', {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
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

    // Fetch districts when state changes
    useEffect(() => {
        if (!selectedState) {
            setDistrictsList([]);
            return;
        }
        setLoadingDistricts(true);
        const fetchDistricts = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                const stateId = selectedState.toUpperCase();
                const response = await fetch(`https://www.india-location-hub.in/api/locations/districts?state=${encodeURIComponent(stateId)}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
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
