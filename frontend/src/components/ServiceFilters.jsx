import { useState, useEffect } from 'react';
import API_URL from '../config/api';

const ServiceFilters = ({ onFilter, initialFilters = {} }) => {
    const [locations, setLocations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [filters, setFilters] = useState({
        location: initialFilters.location || '',
        company: initialFilters.company || '',
        maxPrice: initialFilters.maxPrice || '',
        minRating: initialFilters.minRating || '',
        sortBy: initialFilters.sortBy || 'newest',
    });

    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                // Fetch locations
                const locRes = await fetch(`${API_URL}/api/services/locations`);
                const locData = await locRes.json();
                setLocations(locData);
            } catch (error) {
                console.error('Failed to fetch locations:', error);
            }

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
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilter(filters);
    };

    const handleReset = () => {
        const reset = {
            location: '', company: '', maxPrice: '',
            minRating: '', sortBy: 'newest'
        };
        setFilters(reset);
        onFilter(reset);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[#15151e]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-800 mb-8 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

            <div className="grid md:grid-cols-3 gap-4 mb-4 relative z-10">
                {/* Location */}
                <select
                    name="location"
                    value={filters.location}
                    onChange={handleChange}
                    className="p-3 bg-[#0a0a0f] rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                >
                    <option value="">All Locations</option>
                    {locations.map((loc, i) => (
                        <option key={i} value={loc}>{loc}</option>
                    ))}
                </select>

                {/* Company Filter */}
                <select
                    name="company"
                    value={filters.company}
                    onChange={handleChange}
                    className="p-3 bg-[#0a0a0f] rounded-xl text-gray-300 capitalize focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                >
                    <option value="">All Covens (Companies)</option>
                    {companies.map(comp => (
                        <option key={comp._id} value={comp._id}>{comp.name}</option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleChange}
                    className="p-3 bg-[#0a0a0f] rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                >
                    <option value="newest">Newest Arrived</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                </select>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4 relative z-10">
                {/* Max Price */}
                <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    placeholder="Max Price (₹)"
                    className="p-3 bg-[#0a0a0f] rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-gray-700 hover:border-gray-600 transition-colors placeholder-gray-600"
                />

                {/* Min Rating */}
                <select
                    name="minRating"
                    value={filters.minRating}
                    onChange={handleChange}
                    className="p-3 bg-[#0a0a0f] rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                >
                    <option value="">Any Rating</option>
                    <option value="4">⭐ 4+ Stars</option>
                    <option value="3">⭐ 3+ Stars</option>
                    <option value="2">⭐ 2+ Stars</option>
                </select>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-500 hover:to-red-500 transition-all font-bold shadow-lg shadow-orange-900/40 transform hover:-translate-y-0.5">
                        Summon
                    </button>
                    <button type="button" onClick={handleReset} className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700 hover:text-white font-medium">
                        Reset
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ServiceFilters;
