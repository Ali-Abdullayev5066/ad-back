const { fetch, fetchOne } = require('../../postgres/lib');

const { ADD, PUTAMOUNT, DELETE, ALL } = require('./DiscountModel');

module.exports.addDiscount = async (name, discountAmount) => {
	return await fetchOne(ADD, name, discountAmount)
}

module.exports.edit = async (name, discountAmount, discountId) => {
	return await fetchOne(PUTAMOUNT, name, discountAmount, discountId)
}

module.exports.deleteDiscount = async (discountId) => {
	return await fetchOne(DELETE, discountId)
}

module.exports.getAll = async (name, offset) => {
	return await fetchOne(ALL,`%${name}%`, offset)
}