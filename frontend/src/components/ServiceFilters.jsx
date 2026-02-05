import { useState, useEffect } from 'react';
import API_URL from '../config/api';

const ServiceFilters = ({ onFilter, initialFilters = {} }) => {
    const [locations, setLocations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [filters, setFilters] = useState({
        location: initialFilters.location || '',
        company: initialFilters.company || '',
        minPrice: initialFilters.minPrice || '',
        maxPrice: initialFilters.maxPrice || '',
        minRating: initialFilters.minRating || '',
        sortBy: initialFilters.sortBy || 'newest',
        search: initialFilters.search || ''
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
            location: '', company: '', minPrice: '', maxPrice: '',
            minRating: '', sortBy: 'newest', search: ''
        };
        setFilters(reset);
        onFilter(reset);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800/50 p-6 rounded-xl border border-purple-500/20 mb-8">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
                {/* Search */}
                <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleChange}
                    placeholder="Search services..."
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-600"
                />

                {/* Location */}
                <select
                    name="location"
                    value={filters.location}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-600 cursor-pointer"
                >
                    <option value="">All Locations</option>
                    {locations.map((loc, i) => (
                        <option key={i} value={loc}>{loc}</option>
                    ))}
                </select>

                {/* Company Filter (replaced Category) */}
                <select
                    name="company"
                    value={filters.company}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 rounded-lg text-white capitalize focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-600 cursor-pointer"
                >
                    <option value="">All Companies</option>
                    {companies.map(comp => (
                        <option key={comp._id} value={comp._id}>{comp.name}</option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-600 cursor-pointer"
                >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                </select>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
                {/* Min Price */}
                <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleChange}
                    placeholder="Min Price"
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-600"
                />

                {/* Max Price */}
                <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    placeholder="Max Price"
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-600"
                />

                {/* Min Rating */}
                <select
                    name="minRating"
                    value={filters.minRating}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-600 cursor-pointer"
                >
                    <option value="">Any Rating</option>
                    <option value="4">⭐ 4+ Stars</option>
                    <option value="3">⭐ 3+ Stars</option>
                    <option value="2">⭐ 2+ Stars</option>
                </select>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/20">
                        Apply Filters
                    </button>
                    <button type="button" onClick={handleReset} className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors border border-gray-500">
                        Reset
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ServiceFilters;
