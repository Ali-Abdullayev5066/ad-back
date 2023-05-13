const { fetch, fetchOne } = require('../../postgres/lib');

const { ADD, PUTINFO, PUTONE, DELETE, GETALL, GETONE, CREATEINFO} = require('./ProductModel');

module.exports.addProduct = async ({
		typeId,
		companyId,
		unitId,
		name,
		barcode,
		onSale,
		isVat,
		toCashBack,
		image,
		moreInfo,
		discountId,
		price}) => {
	return await fetchOne(ADD,
		typeId,
		companyId,
		unitId,
		name,
		barcode,
		onSale,
		isVat,
		toCashBack,
		image,
		moreInfo,
		discountId,
		price)
}

module.exports.putProductMoreInfo = async (moreInfo, productId) => {
	return await fetchOne(PUTINFO, moreInfo, productId)
}

module.exports.putProductOne = async ({column, value, productId}) =>{
	return await fetchOne(PUTONE, column, value, productId)
}

module.exports.deleteProduct = async (productId) => {
	return await fetchOne(DELETE, productId)
}

module.exports.getAll = async({companyId, typeId, onSale, offset, search, discountId}) => {
	return await fetchOne(GETALL, companyId, typeId,  `%${search}%`, offset, discountId)
}

module.exports.getOne = async (productId) => {
	return await fetchOne(GETONE, productId)
}

module.exports.infoForProduct = async () => {
	return await fetchOne(CREATEINFO)
}