const tickLog = require('tick-log');
const { Pool } = require("pg");

const pools = {};

const connect = (p_credentials) => new Promise(async (resolve, reject) => {
	let poolName = `${p_credentials.user}@${p_credentials.host}:${p_credentials.port}/${p_credentials.database}`;
	try {
		pools[poolName] = new Pool(p_credentials);
		return resolve(poolName);
	} catch (error) /* istanbul ignore next */ {
		tickLog.error(`An unexpected error (${JSON.stringify(error)}) occured during connect. p_credentials: ${JSON.stringify(p_credentials)}`);
		return reject(error);
	}
});

const end = (poolName) => new Promise(async (resolve, reject) => {
	try {
		if (pools[poolName]) {
			await pools[poolName].end();
			delete pools[poolName];
		};
		return resolve(true);
	} catch (error) /* istanbul ignore next */ {
		tickLog.error(`An unexpected error (${JSON.stringify(error)}) occured during release.`);
		return reject(error);
	}
});

const runSQL = (poolName, p_SQLTemplate, p_params, logFlag) => new Promise(async (resolve, reject) => {
	let l_retval;
	try {
		if (logFlag) tickLog.start(`Executing DB query. p_SQLTemplate: ${p_SQLTemplate}, p_params:${JSON.stringify(p_params)} in pool ${poolName}`);
		l_retval = await pools[poolName].query(p_SQLTemplate, p_params);
		if (logFlag) tickLog.success(`Executed DB query. p_SQLTemplate: ${p_SQLTemplate}, p_params:${JSON.stringify(p_params)} Result: ${JSON.stringify(l_retval.rows)}`);
	} catch (error) /* istanbul ignore next */ {
		tickLog.error(`An unexpected error (${JSON.stringify(error)}) occured during following SQL. p_SQLTemplate: ${p_SQLTemplate}, p_params:${JSON.stringify(p_params)}`);
		return reject(error);
	}
	return resolve(l_retval);
});

module.exports = {
	connect,
	end,
	runSQL,
	exportedForTesting: {
	}
};
