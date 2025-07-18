const express = require('express');
const axios = require('axios');
const { saveUrl, getUrl, Clicks } = require('./urlModel');
const { logEvent } = require('./logger');

const app = express();
app.use(express.json());

app.post('/shorturls', (req, res) => {
    const { url, validity = 30, shortcode } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'The original URL is required to shorten.' });
    }

    const generatedCode = shortcode || Math.random().toString(36).substring(2, 8);

    if (getUrl(generatedCode)) {
        return res.status(400).json({ error: 'This shortcode is already taken. Choose another one.' });
    }

    const expiryTime = new Date(Date.now() + validity * 60 * 1000);
    saveUrl(generatedCode, {
        url,
        createdAt: new Date(),
        expiresAt: expiryTime,
        clicks: 0,
        clickData: []
    });

    logEvent('backend', 'info', 'service', `Short URL created for ${url} with code ${generatedCode}`);

    return res.status(201).json({
        shortLink: `http://localhost:3000/${generatedCode}`,
        expiry: expiryTime.toISOString()
    });
});

app.get('/shorturls/:code', (req, res) => {
    const record = getUrl(req.params.code);
    if (!record) {
        return res.status(404).json({ error: 'Shortcode not found' });
    }

    return res.json({
        totalClicks: record.clicks,
        originalUrl: record.url,
        createdAt: record.createdAt,
        expiry: record.expiresAt,
        clickData: record.clickData
    });
});

app.get('/:code', (req, res) => {
    const record = getUrl(req.params.code);
    if (!record) {
        return res.status(404).send('Shortcode does not exist.');
    }

    const clickInfo = {
        timestamp: new Date(),
        referrer: req.get('Referrer') || 'Direct Access',
        location: req.ip
    };
    Clicks(req.params.code, clickInfo);

    logEvent('backend', 'info', 'service', `Redirecting shortcode ${req.params.code} to ${record.url}`);

    res.redirect(record.url);
});
app.use((req, res, next) => {
    logEvent('backend', 'info', 'route', `Incoming ${req.method} request to ${req.url}`);
    next();
});
app.listen(3000, () => {
    console.log('Shortener service is up at http://localhost:3000');
});
