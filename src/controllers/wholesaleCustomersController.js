const WholesaleCustomersModel = require('../models/WholesaleCustomersModel');

module.exports.create = async (req, res) => {
	try {
		if (req.user.status === 1) {
			const { firstName, lastName, companyName, bankCode, invoiceNumber, passportId, contact } = req.body
			const wholesaleCustomer = await WholesaleCustomersModel.create(firstName, lastName, companyName, bankCode, invoiceNumber, passportId, contact);
			if (!wholesaleCustomer) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (wholesaleCustomer.constraint === 'bank_invoice_customer_inx') {
				res.status(449).json({
					error: true,
					message: `Ushbu bank va shaxsiy hisob raqamlari avval kiritilgan`
				});
			} else if (wholesaleCustomer.constraint === 'wholesale_customers_company_name') {
				res.status(449).json({
					error: true,
					message: `Bu nomdagi kompaniya avval kiritilgan`
				});
			} else if (wholesaleCustomer.constraint === 'wholesale_customers_contact') {
				res.status(401).json({
					error: true,
					message: `Bu telefon raqam avval kiritilgan`
				});
			} else if (wholesaleCustomer.constraint === 'wholesale_customers_passport_id') {
				res.status(401).json({
					error: true,
					message: `Bu passport ma'lumotlari avval kiritilgan`
				});
			} else if (wholesaleCustomer?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(wholesaleCustomer)} ${wholesaleCustomer.where ? 'and ' + wholesaleCustomer.where : "" }`
				});
			} else {
				res.status(201).json({
					error: false,
					wholesaleCustomer
				});
			}
		} else {
			res.status(403).json({
				error: true,
				message: `Sizda imkoniyat yo'q`
			});
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Server xatolik: ${String(e)}`
		});
	}
};