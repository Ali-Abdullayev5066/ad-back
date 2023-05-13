const { fetch, fetchOne } = require('../../postgres/lib');
const { ADD, TYCOMPACTIVIT, GETALL, GET } = require('./CompanyModel');

module.exports.addCompany = async (typeActivityId, companyName, info, bankCode, invoiceNumber) => {
	return await fetchOne(ADD, typeActivityId, companyName, info, bankCode, invoiceNumber)
}

module.exports.getTyCompActiv = async () => {
	return await fetch(TYCOMPACTIVIT)
}

module.exports.getAll = async (tcaId, offset, search, region) => {
	return await fetchOne(GETALL, tcaId, offset, `%${search}%`, region)
}

module.exports.get = async (companyId) => {
	return await fetchOne(GET, companyId)
}

