const { fetch, fetchOne } = require('../../postgres/lib');
const { CREATE } = require('./WholesaleCustomersModel');

module.exports.create = async (firstName, lastName, companyName, bankCode, invoiceNumber, passportId, contact) => {
	return await fetchOne(CREATE, firstName, lastName, companyName, bankCode, invoiceNumber, passportId, contact)
}