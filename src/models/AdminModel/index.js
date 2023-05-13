const { fetch, fetchOne } = require('../../postgres/lib');
const { SELECTADMIN, INSERTADMIN, GETALL, DELETE} = require('./AdminModel');

module.exports.login = async (username, password) => {
	return await fetchOne(SELECTADMIN, username, password)
}

module.exports.create = async ({shopId, username, password, status}) => {
	return await fetchOne(INSERTADMIN, shopId, username, password, status)
}

module.exports.getAll = async (shopId, offset) => {
	return await fetchOne(GETALL, shopId, offset)
}

module.exports.delete = async (adminId) => {
	return await fetchOne(DELETE, adminId)
}