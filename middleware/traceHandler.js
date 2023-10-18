const { RequestHandler } = require('express');

/**
 * @type {RequestHandler}
 */
module.exports = (req, res, next) => (req.method !== 'TRACE') ? next() : res.set('Content-Type', 'message/http').set('X-Content-Type-Options', 'nosniff').send([`HTTP/${req.httpVersion} 200 OK`, ...req.rawHeaders.map((header, i) => (i % 2 === 0) ? `${header}: ${req.rawHeaders[i + 1]}` : '').filter(header => header !== ''), '', req.body].join('\r\n'));