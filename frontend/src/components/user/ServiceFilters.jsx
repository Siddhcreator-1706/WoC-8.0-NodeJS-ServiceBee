import { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import CustomSelect from '../ui/CustomSelect';
import useLocationData from '../../hooks/useLocationData';

const ServiceFilters = ({ onFilter, initialFilters = {} }) => {
    // Location Data Hook
    const { statesList, districtsList, loadingStates, loadingDistricts } = useLocationData(null);
    // We need to pass selected state to hook, but we store it in filters.state
    // So we can't destructure directly like useLocationData(filters.state).
    // Actually we can:
    const [filters, setFilters] = useState({
        state: initialFilters.state || '',
        city: initialFilters.city || '',
        company: initialFilters.company || '',
        maxPrice: initialFilters.maxPrice || '',
        minRating: initialFilters.minRating || '',
        sortBy: initialFilters.sortBy || 'newest',
    });

    const locationData = useLocationData(filters.state);

    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchFiltersData = async () => {
            // Locations fetched via hook

            try {
                // Fetch companies instead of categories
                const compRes = await fetch(`${API_URL}/api/companies`);
                const compData = await compRes.json();
                if (compData.companies) {
                    setCompanies(compData.companies);
                }
            } catch (error) {
                console.error('Failed to fetch companies:', error);
            }
        };
        fetchFiltersData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'state' ? { city: '' } : {})
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilter(filters);
    };

    const handleReset = () => {
        const reset = {
            state: '', city: '', company: '', maxPrice: '',
            minRating: '', sortBy: 'newest'
        };
        setFilters(reset);
        onFilter(reset);
    };

    // Prepare Options
    const stateOptions = [
        { value: '', label: 'All States' },
        ...locationData.statesList
    ];

    const cityOptions = [
        { value: '', label: 'All Cities' },
        ...locationData.districtsList
    ];

    const companyOptions = [
        { value: '', label: 'All Covens (Companies)' },
        ...companies.map(c => ({ value: c._id, label: c.name }))
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest Arrived' },
        { value: 'price-asc', label: 'Price: Low to High' },
        { value: 'price-desc', label: 'Price: High to Low' },
        { value: 'rating', label: 'Top Rated' }
    ];

    const ratingOptions = [
        { value: '', label: 'Any Rating' },
        { value: '4', label: '⭐ 4+ Stars' },
        { value: '3', label: '⭐ 3+ Stars' },
        { value: '2', label: '⭐ 2+ Stars' }
    ];

    return (
        <form onSubmit={handleSubmit} className="bg-[#15151e]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-800 mb-8 shadow-xl relative overflow-visible group">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

            <div className="grid md:grid-cols-3 gap-4 mb-4 relative z-10">
                {/* State */}
                <CustomSelect
                    name="state"
                    value={filters.state}
                    onChange={handleChange}
                    options={stateOptions}
                    placeholder="State"
                    className="w-full"
                    loading={locationData.loadingStates}
                />

                {/* City */}
                <CustomSelect
                    name="city"
                    value={filters.city}
                    onChange={handleChange}
                    options={cityOptions}
                    placeholder="City / District"
                    className="w-full"
                    disabled={!filters.state}
                    loading={locationData.loadingDistricts}
                />

                {/* Company Filter */}
                <CustomSelect
                    name="company"
                    value={filters.company}
                    onChange={handleChange}
                    options={companyOptions}
                    placeholder="Company"
                    className="w-full"
                />

                {/* Sort */}
                <CustomSelect
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleChange}
                    options={sortOptions}
                    placeholder="Sort By"
                    className="w-full"
                />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4 relative z-10">
                {/* Max Price */}
                <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    placeholder="Max Price (₹)"
                    className="p-3 bg-[#0a0a0f]/60 rounded-xl text-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500/50 border border-zinc-800 hover:border-violet-500/50 transition-colors placeholder-zinc-600 w-full text-sm"
                />

                {/* Min Rating */}
                <CustomSelect
                    name="minRating"
                    value={filters.minRating}
                    onChange={handleChange}
                    options={ratingOptions}
                    placeholder="Review Rating"
                    className="w-full"
                />

                {/* Buttons */}
                <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all font-bold shadow-lg shadow-violet-900/20 transform hover:-translate-y-0.5 text-sm">
                        Apply Filters
                    </button>
                    <button type="button" onClick={handleReset} className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700 hover:text-white font-medium text-sm">
                        Reset
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ServiceFilters;
