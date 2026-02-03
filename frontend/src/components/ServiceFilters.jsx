import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ServiceFilters = ({ onFilter, initialFilters = {} }) => {
    const [locations, setLocations] = useState([]);
    const [filters, setFilters] = useState({
        location: initialFilters.location || '',
        category: initialFilters.category || '',
        minPrice: initialFilters.minPrice || '',
        maxPrice: initialFilters.maxPrice || '',
        minRating: initialFilters.minRating || '',
        sortBy: initialFilters.sortBy || 'newest',
        search: initialFilters.search || ''
    });

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${API_URL}/api/services/locations`);
                const data = await res.json();
                setLocations(data);
            } catch (error) {
                console.error('Failed to fetch locations:', error);
            }
        };
        fetchLocations();
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
            location: '', category: '', minPrice: '', maxPrice: '',
            minRating: '', sortBy: 'newest', search: ''
        };
        setFilters(reset);
        onFilter(reset);
    };

    const categories = ['cleaning', 'repair', 'beauty', 'tech', 'moving', 'events', 'other'];

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
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                {/* Location */}
                <select
                    name="location"
                    value={filters.location}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none"
                >
                    <option value="">All Locations</option>
                    {locations.map((loc, i) => (
                        <option key={i} value={loc}>{loc}</option>
                    ))}
                </select>

                {/* Category */}
                <select
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 rounded-lg text-white capitalize focus:outline-none"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none"
                >
                    <option value="newest">Newest</option>
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
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none"
                />

                {/* Max Price */}
                <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    placeholder="Max Price"
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none"
                />

                {/* Min Rating */}
                <select
                    name="minRating"
                    value={filters.minRating}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none"
                >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                </select>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                        Apply
                    </button>
                    <button type="button" onClick={handleReset} className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">
                        Reset
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ServiceFilters;
