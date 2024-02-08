/** @type {import('express').RequestHandler} */ module.exports = (req, res, _) => () => res.status(404).render(`misc/404.pug`, req.getErrPage(404, { path: req.path }));