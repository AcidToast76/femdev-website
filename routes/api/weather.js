const router = require('express').Router();
const { aprilFools } = require('../../functions/utilities');

router
    .get('/current', async (req, res) => {
        let lat, lon;
        if (req.query.city) {
            // use Google Geocoding API to get lat and lon
            const AxiosRes = await req.axiosReq(`/json`, {
                baseURL: 'https://maps.googleapis.com/maps/api/geocode',
                params: {
                    address: req.query.city,
                    key: process.env.GMAPS_API_KEY,
                }
            })
            const data = JSON.parse(AxiosRes.data)
            if (data.status == 'ZERO_RESULTS') return res.sendError(13)
            lat = data.results[0].geometry.location.lat
            lon = data.results[0].geometry.location.lng
        } else if (req.query.lat && req.query.lon) {
            lat = req.query.lat
            lon = req.query.lon
        } else return res.sendError(4)
        const AxiosRes = await req.axiosReq(`/weather`, {
            baseURL: 'https://api.openweathermap.org/data/2.5',
            params: {
                appid: process.env.OPEN_WEATHER_API_KEY,
                mode: 'json',
                units: 'imperial',
                lat,
                lon
            }
        })
        if (AxiosRes.status == 400) return res.sendError(13)
        res.json(JSON.parse(AxiosRes.data))
    })
    .get('/forecast', async (req, res) => {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Missing lat or lon query' })
        const AxiosRes = await req.axiosReq(`/forecast`, {
            baseURL: 'https://api.openweathermap.org/data/2.5',
            params: {
                appid: process.env.OPEN_WEATHER_API_KEY,
                mode: 'json',
                units: 'imperial',
                lat,
                lon
            }
        })
        if (AxiosRes.status == 400) return res.sendError(13)
        res.json(JSON.parse(AxiosRes.data))
    })
    .use((req, res, next) => {
        const { path } = req;
        const methodUsed = req.method.toUpperCase();
        let allowedMethods = router.stack.filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();
        allowedMethods.map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;
        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `${aprilFools() ? 'aprilfools/' : ''}misc/405.pug`,
            {
                errData: {
                    path,
                    allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                    methodUsed: methodUsed,
                },
                meta: {
                    title: '405 - Method Not Allowed',
                    desc: '405 - Method Not Allowed',
                    url: 'https://thefemdevs.com/errors/405',
                }
            }
        );
    })

module.exports = router;