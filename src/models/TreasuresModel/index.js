const { fetch, fetchOne } = require('../../postgres/lib');
const { GETCLOSEDCASHBOXSES, CHANGESTATUS, GETCASHREG, GETCASHBOX } = require('./TreasuresModel');

module.exports.staticOfCashbox = async (shopId, report, getDate) => {
	return await fetchOne(GETCLOSEDCASHBOXSES, shopId, report, getDate)
}

module.exports.changeStatus = async (status, getDate, statusId) => {
	return await fetchOne(CHANGESTATUS, status, getDate, statusId)
}

module.exports.getCashReg = async (shopId, getDate, cashRegisterId, cashierId) => {
	return await fetchOne(GETCASHREG, shopId, getDate, cashRegisterId, cashierId)
}

module.exports.getCashBoxList = async (shopId, report, getDate, cashboxId) => {
    return await fetchOne(GETCASHBOX, shopId, report, getDate, cashboxId)
}
