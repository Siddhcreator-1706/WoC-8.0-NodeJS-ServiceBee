const express = require('express');
const router = express.Router();

const LOCATION_API_BASE = 'https://www.india-location-hub.in/api/locations';

// @desc    Proxy - Get all states
// @route   GET /api/locations/states
// @access  Public
router.get('/states', async (req, res) => {
    try {
        const response = await fetch(`${LOCATION_API_BASE}/states`, {
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            return res.status(response.status).json({ message: 'Failed to fetch states' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Location proxy error (states):', error.message);
        res.status(502).json({ message: 'Location service unavailable' });
    }
});

// @desc    Proxy - Get districts for a state
// @route   GET /api/locations/districts?state=STATE_NAME
// @access  Public
router.get('/districts', async (req, res) => {
    try {
        const { state } = req.query;
        if (!state) {
            return res.status(400).json({ message: 'State query parameter is required' });
        }

        const response = await fetch(
            `${LOCATION_API_BASE}/districts?state=${encodeURIComponent(state)}`,
            { signal: AbortSignal.timeout(5000) }
        );

        if (!response.ok) {
            return res.status(response.status).json({ message: 'Failed to fetch districts' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Location proxy error (districts):', error.message);
        res.status(502).json({ message: 'Location service unavailable' });
    }
});

module.exports = router;
