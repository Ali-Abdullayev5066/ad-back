const { fetch, fetchOne } = require('../../postgres/lib');
const { CREATESHOP, ALLSHOP, DELETE, PUT } = require('./ShopModel');

module.exports.createShop = async (name, address, image) => {
	return await fetchOne(CREATESHOP, name, address, image)
}

module.exports.getAll = async (name, page) => {
	return await fetchOne(ALLSHOP, `%${name}%`, page)
}

module.exports.delete = async (shopId) => {
	return await fetchOne(DELETE, shopId)
}

module.exports.update = async (name, address, shopId) => {
	return await fetchOne(PUT, name, address, shopId)
}
