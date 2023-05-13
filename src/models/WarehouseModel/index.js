const { fetch, fetchOne } = require('../../postgres/lib');
const { GETADDWAREHOUSE,
ADDPAYMENT,
DELETEPAYMENT,
GETONEPDF,
GETPURCHASERETURN,
GETPURCHASEPDF,
BALANCE } = require('./WarehouseModel');

module.exports.getAddWarehouse = async (shopId, companyId, search, offset) => {
	return await fetchOne(GETADDWAREHOUSE, shopId, companyId, `%${search}%`, offset)
}

module.exports.getOnePdf = async (toWarehouseId) => {
	return await fetchOne(GETONEPDF, toWarehouseId)
}

module.exports.addPayment = async (addWarId, column, numeric) => {
	return await fetchOne(ADDPAYMENT, addWarId, column, numeric)
}

module.exports.deletePayment = async (id) => {
	return await fetchOne(DELETEPAYMENT, id)
}

module.exports.getPurchaseReturn = async (shopId, companyId, search, offset) => {
	return await fetchOne(GETPURCHASERETURN, shopId, companyId, `%${search}%`, offset)
}

module.exports.getPurchasePdf = async (purchaseReturnId) => {
	return await fetchOne(GETPURCHASEPDF, purchaseReturnId)
}

module.exports.balance = async (list, fromD, toD, shopId, companyId) => {
	return await fetchOne(BALANCE, list, fromD, toD, shopId, companyId)
}
