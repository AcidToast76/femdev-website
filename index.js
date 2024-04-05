const app = require('express')();
const http = require('http');
const { createHash: ch, getHashes: gh } = require('crypto');
const Admin = require('firebase-admin');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();
//- Middleware
const IPM = require('./middleware/IP'); //? IP Middleware
const SM = require('./middleware/session'); //? Session Manager
const TRACE = require('./middleware/traceHandler'); //? Tracing Middleware
const RL = require('./middleware/routeLogger'); //? Route Logger
const Headers = require('./middleware/headers'); //? Header Setter
const errPages = require('./middleware/errpages'); //? Error Pages
const reqLogs = [];
/** @type {Map<String, Map<String, any>|String>} @desciption Used to store data throughout requests */
const Persistance = new Map();
const RateLimiter = new RateLimiterMemory({ points: 2400, duration: 60 })
class Formatter {
    static formatDateTime = (v) => new Intl.DateTimeFormat('en-US', { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "long", timeZone: "America/Detroit", timeZoneName: "longGeneric" }).format(v)
    static formatDate = (v) => new Intl.DateTimeFormat('en-US', { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(v)
    static formatTime = (v) => new Intl.DateTimeFormat('en-US', { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Detroit", timeZoneName: "shortOffset" }).format(v)
    static dobToAge = (dob) => Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
}
const FirebaseServiceAccount = JSON.parse(process.env.FIREBASE_SA);
const AdminApp = Admin.initializeApp({
    credential: Admin.credential.cert(FirebaseServiceAccount),
    databaseURL: `https://${FirebaseServiceAccount.projectId}-default-rtdb.firebaseio.com`
})
const db = new (require('./functions/database'))();
setInterval(_ => (!reqLogs[0]) ? null : db.emit('access', reqLogs.shift()), 500)
const nf = (req, res, _) => res.status(404).render(`misc/404.pug`, req.getErrPage(404, { path: req.path }))
app
    .set('view engine', 'pug')
    .set('case sensitive routing', false)
    .set('trust proxy', true)
    .set('x-powered-by', false)
    .use((req, _, next) => {
        Object.assign(req, {
            reqLogs, Persistance, AdminApp, auth: AdminApp.auth(), Database: db, Formatter, RateLimitMem: RateLimiter,
            getErrPage: (c, d) => errPages.get(c)(d)
        })
        next();
    })
    .use(RL)
    .use(IPM.infoMiddleware)
    .use(SM)
    .use(IPM.checkLocation)
    .use((req, res, next) => {
        const
            sf = 'base64url',
            lh = 'localhost',
            sip = req.ip || 'unknown',
            lif = x => x.replace('::ffff:', ''),
            ht = 'id-rsassa-pkcs1-v1_5-with-sha3-512',
            li = x => ['::1', '127.0.0.1'].includes(x);
        return (
            db.ipb.some(
                ipData =>
                    ipData.hash === ch(ht)
                        .update(gh().reduce(
                            (x, y) => ch(y).update(x).digest(sf),
                            li(lif(req.ip)) ? lh : lif(sip)
                        )).digest(sf)
            ))
            ? res.status(403).render(`misc/403.pug`, errPages.get(403)({ path: req.path }))
            : next();
    })
    .use(TRACE)
    .use(Headers)
    .use(require('./web/router'))
    .use((req, res, next) => {
        const
            { path } = req,
            mu = req.method.toUpperCase();
        let am = app._router.stack.filter(r => r.route && r.route.path === path)
        if (am.length == 0) return next();
        am = ({ ...(am.map(r => r.route.stack[0]))[0] }).route.methods;
        if (req.method === 'OPTIONS') return res
            .setHeader('Allow', Object.keys(am).map(m => m.toUpperCase()).join(', '))
            .setHeader('Access-Control-Allow-Methods', Object.keys(am).map(m => m.toUpperCase()).join(', '))
            .status(204).send();
        if (am[mu]) return next();
        res.status(405).render(`misc/405.pug`, errPages.get(405)({ path, allowedMethod: am, methodUsed: mu }))
    })
    .use((err, _, res, __) => {
        console.log(err)
        res
            .status(501)
            .setHeader('X-Error-ID', '')
            .render(`misc/501.pug`, errPages.get(501)({ errorId: '' }))
    })
    .use(nf)
http
    .createServer(app)
    .listen(process.env.PORT || 3000, _ => console.log("HTTP Server is UP"))