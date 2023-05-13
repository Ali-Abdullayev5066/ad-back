const { fetch, fetchOne } = require('../../postgres/lib');

const { ADD, PUT, DELETE, ALL } = require('./TypeModel');

module.exports.addType = async ( name) => {
	return await fetchOne(ADD, name)
}

module.exports.editType = async ( name, typeId) => {
	return await fetchOne(PUT, name, typeId)
}

module.exports.deleteType = async (typeId) => {
	return await fetchOne(DELETE, typeId)
}

module.exports.getAll = async (search, offset) => {
	return await fetchOne(ALL, `%${search}%`, offset)
}