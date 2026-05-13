const express = require('express');
const router = express.Router();

const CSC_API_BASE = 'https://api.countrystatecity.in/v1';
const COUNTRY_CODE = 'IN'; // India

const getHeaders = () => ({
    'X-CSCAPI-KEY': process.env.CSC_API_KEY
});

// @desc    Proxy - Get all states of India
// @route   GET /api/locations/states
// @access  Public
router.get('/states', async (req, res) => {
    try {
        const response = await fetch(`${CSC_API_BASE}/countries/${COUNTRY_CODE}/states`, {
            headers: getHeaders(),
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            return res.status(response.status).json({ message: 'Failed to fetch states' });
        }

        const states = await response.json();
        // Transform to match expected format: { success: true, data: { states: [{ name }] } }
        res.json({
            success: true,
            data: {
                states: states.map(s => ({ name: s.name, iso2: s.iso2 }))
            }
        });
    } catch (error) {
        console.error('Location proxy error (states):', error.message);
        res.status(502).json({ message: 'Location service unavailable' });
    }
});

// @desc    Proxy - Get cities for a state
// @route   GET /api/locations/districts?state=STATE_NAME
// @access  Public
router.get('/districts', async (req, res) => {
    try {
        const { state } = req.query;
        if (!state) {
            return res.status(400).json({ message: 'State query parameter is required' });
        }

        // First get the state ISO code from the state name
        const statesRes = await fetch(`${CSC_API_BASE}/countries/${COUNTRY_CODE}/states`, {
            headers: getHeaders(),
            signal: AbortSignal.timeout(5000)
        });

        if (!statesRes.ok) {
            return res.status(statesRes.status).json({ message: 'Failed to fetch states' });
        }

        const states = await statesRes.json();
        const stateObj = states.find(s => s.name.toUpperCase() === state.toUpperCase());

        if (!stateObj) {
            return res.status(404).json({ message: `State '${state}' not found` });
        }

        // Fetch cities for the state using its ISO code
        const citiesRes = await fetch(
            `${CSC_API_BASE}/countries/${COUNTRY_CODE}/states/${stateObj.iso2}/cities`,
            {
                headers: getHeaders(),
                signal: AbortSignal.timeout(5000)
            }
        );

        if (!citiesRes.ok) {
            return res.status(citiesRes.status).json({ message: 'Failed to fetch cities' });
        }

        const cities = await citiesRes.json();
        // Transform to match expected format: { success: true, data: { districts: [{ name }] } }
        res.json({
            success: true,
            data: {
                districts: cities.map(c => ({ name: c.name }))
            }
        });
    } catch (error) {
        console.error('Location proxy error (districts):', error.message);
        res.status(502).json({ message: 'Location service unavailable' });
    }
});

module.exports = router;
