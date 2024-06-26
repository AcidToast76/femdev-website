const router = require('express').Router();

router
	.get('/code-of-conduct', async (req, res) => {
		res.render(
			"oss/codeOfConduct.pug",
			{
				status: (await req.Database.getServerStatus()),
				meta: {
					title: 'Code of Conduct',
					desc: 'FemDevs Website Code of Conduct',
					url: 'https://oss.thefemdevs.com/code-of-conduct',
					canonical: 'https://oss.thefemdevs.com/code-of-conduct',
				},
			},
		);
	})
	.get('/contributing', async (req, res) => {
		res.render(
			"oss/contributing.pug",
			{
				status: (await req.Database.getServerStatus()),
				meta: {
					title: 'Contributing',
					desc: 'How to Contribute to the FemDevs Website',
					url: 'https://oss.thefemdevs.com/contributing',
					canonical: 'https://oss.thefemdevs.com/contributing',
				},
			},
		);
	})
	.get('/license', async (req, res) => {
		res.render(
			"oss/license.pug",
			{
				status: (await req.Database.getServerStatus()),
				meta: {
					title: 'License',
					desc: 'FemDevs Website License',
					url: 'https://oss.thefemdevs.com/license',
					canonical: 'https://oss.thefemdevs.com/license',
				},
			},
		);
	})
	.get('/security', async (req, res) => {
		res.render(
			"oss/security.pug",
			{
				status: (await req.Database.getServerStatus()),
				meta: {
					title: 'Security',
					desc: 'FemDevs Website Security Policy',
					url: 'https://oss.thefemdevs.com/security',
					canonical: 'https://oss.thefemdevs.com/security',
				},
			},
		);
	})
	.get('/contributors', async (req, res) => {
		const connection = await req.Database.pool.connect();
		const { rows } = await connection.query('SELECT * FROM public.contributors');
		connection.release();
		res.render(
			"oss/contributors.pug",
			{
				contributors: rows,
				status: (await req.Database.getServerStatus()),
				meta: {
					title: 'Contributors',
					desc: 'Contributors to the FemDevs Website',
					url: 'https://oss.thefemdevs.com/contributors',
					canonical: 'https://oss.thefemdevs.com/contributors',
				},
			},
		);
	})
	.get('/', async (req, res) => {
		res.render(
			"oss/index.pug",
			{
				status: (await req.Database.getServerStatus()),
				meta: {
					title: 'Open Source Software',
					desc: 'FemDevs Open Source Software Homepage',
					url: 'https://oss.thefemdevs.com/',
					canonical: 'https://oss.thefemdevs.com/',
				},
			},
		);
	})
	.use((req, res, next) => {
		const { path } = req;
		const methodUsed = req.method.toUpperCase();
		let allowedMethods = router.stack.filter(routerObj => routerObj.route && routerObj.route.path === path);
		if (allowedMethods.length === 0) return next();
		allowedMethods.map(routerObj => routerObj.route.stack[0]);
		allowedMethods = { ...allowedMethods[0] };
		allowedMethods = allowedMethods.route.methods;
		if (req.method === 'OPTIONS')
			return res.setHeader('Allow', Object.keys(allowedMethods)
				.map(verb => verb.toUpperCase()).join(', '))
				.setHeader('Access-Control-Allow-Methods', Object.keys(allowedMethods).map(verb => verb.toUpperCase()).join(', '))
				.status(204)
				.send();
		if (allowedMethods[methodUsed]) return next();
		return res.status(405).render(
			"misc/405.pug",
			req.getErrPage(405, { path, allowedMethods, methodUsed }),
		);
	});

module.exports = router;
