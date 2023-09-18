const router = require('express').Router();
const pg = require('pg')
const { aprilFools } = require('../functions/utilities');

const pool = new pg.Pool({
    max: 10,
    host: 'db.xbrshjvntcletdswsxtq.supabase.co',
    port: 6543,
    database: 'postgres',
    user: 'postgres',
    password: 'sparty182020RootAccess',
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    query_timeout: 2000,
    allowExitOnIdle: true,
})

const newClient = (async () => pool.connect())
const closeClient = (async (client) => client.release(true))

router
    .get('/team', async (req, res) => {
        const client = await newClient();
        let staffRoles = {};
        const { rows: data } = await client.query('SELECT * FROM public.staff ORDER BY id ASC')
        data
            .filter(staff => staff.isStaff)
            .forEach((staff, i) => {
                if (staffRoles[staff.role] == undefined) { staffRoles[staff.role] = {} }
                staffRoles[staff.role][i] = staff
            })
        Object.keys(staffRoles).forEach(role => staffRoles[role].title = role)
        res.render(
            `${aprilFools() ? 'april-fools/': ''}mainmain/team`,
            {
                title: 'Team',
                staff: staffRoles,
                meta: {
                    title: 'FemDev Staff Team',
                    desc: 'Meet the FemDev Staff Team!',
                    url: 'https://thefemdevs.com/team',
                }
            }
        );
        closeClient(client)
    })
    .get('/carrers', (req, res) => {
        res.render(
            `${aprilFools() ? 'april-fools/': ''}main/carrers.pug`,
            {
                title: 'Carrers',
                meta: {
                    title: 'FemDev Carrers',
                    desc: 'Join the FemDev Team!',
                    url: 'https://thefemdevs.com/carrers',
                }
            }
        );
    })
    .get('/branding', (req, res) => {
        res.render(
            `${aprilFools() ? 'april-fools/': ''}main/branding.pug`,
            {
                title: 'Branding',
                meta: {
                    title: 'FemDev Branding',
                    desc: 'FemDev Branding',
                    url: 'https://thefemdevs.com/branding',
                }
            }
        );
    })
    .get('/products', (req, res) => {
        res.render(
            `${aprilFools() ? 'april-fools/': ''}main/products.pug`,
            {
                title: 'Products',
                meta: {
                    title: 'FemDev Products',
                    desc: 'FemDev Products',
                    url: 'https://thefemdevs.com/products',
                }
            }
        );
    })
    .get('/about', (req, res) => {
        res.render(
            `${aprilFools() ? 'april-fools/': ''}main/about.pug`,
            {
                title: 'About',
                meta: {
                    title: 'About FemDev',
                    desc: 'About us, the FemDevs!',
                    url: 'https://thefemdevs.com/about',
                }
            }
        );
    })
    .get('/pds', (req, res) => {
        res.render(
            `${aprilFools() ? 'april-fools/': ''}main/poland.pug`,
            {
                title: "Poland Destruction Simulator",
                file: 'pds',
                meta: {
                    title: 'Poland Destruction Simulator',
                    desc: 'Poland Destruction Simulator Game',
                    url: 'https://thefemdevs.com/pds',
                }
            }
        )
    })
    .get('/socials', (req, res) => {
        res.render(
            `${aprilFools() ? 'april-fools/': ''}main/socials.pug`,
            {
                title: 'Socials',
                file: 'socials',
                meta: {
                    title: 'FemDev Socials',
                    desc: 'FemDev Socials',
                    url: 'https://thefemdevs.com/socials',
                }
            }
        );
    })
    .get('/index', (req, res) => {
        res.render(
            `${aprilFools() ? 'april-fools/': ''}main/index.pug`,
            {
                title: 'Homepage',
                file: 'index',
                meta: {
                    title: 'FemDevs',
                    desc: 'The home of the FemDevs!',
                    url: 'https://thefemdevs.com',
                }
            }
        );
    })
    .get(`/`, (req, res) => {
        res.render(
            `${aprilFools() ? 'april-fools/': ''}main/index.pug`,
            {
                title: 'Homepage',
                file: 'index',
                meta: {
                    title: 'FemDevs',
                    desc: 'The home of the FemDevs!',
                    url: 'https://thefemdevs.com',
                }
            }
        );
    })
    .use((req, res, next) => {
        const { path, method } = req;
        const methodUsed = method.toUpperCase();
        let allowedMethods = router.stack
            .filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();

        // find the allowed methods for the path
        allowedMethods
            .map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;

        if (allowedMethods[methodUsed]) return next();
        res.status(405).render(
            `misc/405.pug`,
            {
                title: '405 - Method Not Allowed',
                path,
                allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                methodUsed: methodUsed
            }
        );
    })

module.exports = router;