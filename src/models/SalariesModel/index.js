const { fetch, fetchOne } = require('../../postgres/lib');

const { ADD, PUT, GET, ALL } = require('./SalariesModel');

module.exports.add = async (category, rankId, amount) => {
	return await fetchOne(ADD, category, rankId, amount)
}

module.exports.edit = async (amount, salaryId) => {
	return await fetchOne(PUT, amount, salaryId)
}

module.exports.delete = async (salaryId) => {
	return await fetchOne(DELETE, salaryId)
}

module.exports.getAll = async (rankId, offset) => {
	console.log(rankId, offset)
	return await fetchOne(ALL, rankId, offset)
}