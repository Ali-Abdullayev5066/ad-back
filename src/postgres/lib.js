const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool ({
	database: process.env.DB_DATABASE,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	// host: process.env.DB_HOST,
	port: process.env.DB_PORT,

})

module.exports.fetch = async (SQL, ...params) => {
	const client = await pool.connect()
	try {
		let { rows } = await client.query(SQL, params ? params : null)
		return rows
	} catch (e) {
		return e
	} finally {
		client.release()
	}
}

module.exports.fetchOne = async (SQL, ...params) => {
	const client = await pool.connect()
	try {
		let { rows: [row] } = await client.query(SQL, params ? params : null)
		return row
	} catch (e) {
		return e
	} finally {
		client.release()
	}
}

