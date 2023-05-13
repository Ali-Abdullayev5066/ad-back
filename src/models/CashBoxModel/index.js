const { fetch, fetchOne } = require('../../postgres/lib');
const { ADD, GETONSHOPS, DELETE} = require('./CashBoxModel');

module.exports.add = async (shopId, cashNumber) => {
	return await fetchOne(ADD, shopId, cashNumber)
}

module.exports.getShopId = async (shopId, page) => {
	return await fetchOne(GETONSHOPS, shopId, page)
}

module.exports.delete = async (cashboxId) => {
	return await fetchOne(DELETE, cashboxId)
}