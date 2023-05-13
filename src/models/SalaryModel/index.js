const { fetch, fetchOne } = require('../../postgres/lib');
const { SALARY,
    CREATEGIVENSALARY,
    GETSHOPLIST,
    CREATEAVANS,
    GETGIVENSALARY,
    DELETEGIVENSALARY,
    UPDGIVENSALARY,
    GETAVANS,
    DELETEAVANS,
    UPDAVANS } = require('./SalaryModel');

module.exports.getShopList = async() => {
    return await fetch(GETSHOPLIST)
}

module.exports.getSalary = async (year, month, shopId) => {
	return await fetchOne(SALARY, year, month, shopId)
}

module.exports.createGivenSalary = async (shopId, year, month, statusBool, statusInt, givSalarId, approvedList, approvedSumm) => {
	return await fetchOne(CREATEGIVENSALARY, shopId, year, month, statusBool, statusInt, givSalarId, JSON.stringify(approvedList), approvedSumm)
}

module.exports.deleteGivenSalary = async (id, status) => {
    return await fetchOne(DELETEGIVENSALARY, id, status)
}

module.exports.updGivenSalary = async (status, id) => {
    return await fetchOne(UPDGIVENSALARY, status, id)
}

module.exports.updAvans = async (status, id) => {
    return await fetchOne(UPDAVANS, status, id)
}

module.exports.getGivenSalary = async (year, month, shopId) => {
    return await fetchOne(GETGIVENSALARY, year, month, shopId)
}

module.exports.getAvans = async (year, month, shopId) => {
    return await fetchOne(GETAVANS, year, month, shopId)
}

module.exports.creteAvans = async(shopId, total, getDate, list) => {
    return await fetchOne(CREATEAVANS, shopId, total, getDate, JSON.stringify(list))
}