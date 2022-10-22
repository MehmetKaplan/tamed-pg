const tickLog = require('tick-log');
const { Pool } = require("pg");

const pools = {};

const connect = (p_credentials) => new Promise(async (resolve, reject) => {
	try {
		pools.pool = new Pool(p_credentials);
		return resolve(true);			
	} catch (error) {
		tickLog.error(`An unexpected error (${JSON.stringify(error)}) occured during connect. p_credentials: ${JSON.stringify(p_credentials)}`);
		return reject(error);
	}
});

const runSQL = (p_SQLTemplate, p_params) => new Promise(async (resolve, reject) => {
	let l_retval;
	try {
		tickLog.start(`Executing DB query. p_SQLTemplate: ${p_SQLTemplate}, p_params:${JSON.stringify(p_params)}`);
		l_retval = await pools.pool.query(p_SQLTemplate, p_params);
		tickLog.success(`Executed DB query. p_SQLTemplate: ${p_SQLTemplate}, p_params:${JSON.stringify(p_params)} Result: ${JSON.stringify(l_retval.rows)}`);
		return resolve(l_retval);
	} catch (error) /* istanbul ignore next */ {
		tickLog.error(`An unexpected error (${JSON.stringify(error)}) occured during following SQL. p_SQLTemplate: ${p_SQLTemplate}, p_params:${JSON.stringify(p_params)}`);
		return reject(error);
	}
});

module.exports = {
	connect,
	runSQL,
	exportedForTesting: {
		pool: pools.default_pool,
	}
};
