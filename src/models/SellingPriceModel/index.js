const { fetch, fetchOne } = require('../../postgres/lib');

const { PUTORINERTPRICE } = require('./SellingPriceModel');

module.exports.addPrice = async ({column, value}, productId) => {
	return await fetchOne(PUTORINERTPRICE, column, value, productId)
}