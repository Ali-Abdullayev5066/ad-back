const { fetch, fetchOne } = require('../../postgres/lib');
const { ADD, PUT, DELETE, GETDAY } = require('./ExesModel');

module.exports.add = async ({shopId, name, comment, cost}) => {
	return await fetchOne(ADD, shopId, name, comment, cost)
}

module.exports.putExes = async (name, comment, cost, exesId) => {
	return await fetchOne(PUT, name, comment, cost, exesId)
}

module.exports.deletExes = async (exesId) => {
	return await fetchOne(DELETE, exesId)
}

module.exports.getDay = async (day) => {
	if (day) {
		return await fetch(GETDAY, +day)
	} else {
		return await fetch(GETDAY, +0)
	}
}