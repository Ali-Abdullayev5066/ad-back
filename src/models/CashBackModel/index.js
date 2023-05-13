const { fetch, fetchOne } = require('../../postgres/lib');

const { UPCASHBALANCE, MINUSCASHBALANCE, GETCASHBACK } = require('./CashBackModel');

module.exports.upBalance = async (summa, cashBackId) => {
	return await fetchOne(UPCASHBALANCE, summa, cashBackId)
}

module.exports.minBalance = async (summa, cashBackId) => {
	return await fetchOne(MINUSCASHBALANCE, summa, cashBackId)
}

module.exports.getCashBack = async (cashBackId) => {
	return await fetchOne(GETCASHBACK, cashBackId)
}