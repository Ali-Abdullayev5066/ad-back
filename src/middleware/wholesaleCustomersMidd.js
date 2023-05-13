module.exports.create = (req, res, next) => {
	try {
		const { firstName, lastName, companyName, bankCode, invoiceNumber, passportId, contact } = req.body
		if ( !firstName || !lastName || !contact ) {
			return res.status(449).json({
				error: true,
				message: `Qatorlar to'liq kiritilganini tekshiring`
			});
		} else if (bankCode) {
			if (bankCode.length > 6 || bankCode.length < 5) {
				return res.status(449).json({
					error: true,
					message: `Bank raqami uchun noto'g'ri ma'lumotlar kiritildi`
				});
			}  else if (String(Number(+bankCode)) === 'NaN') {
				return res.status(449).json({
					error: true,
					message: `Bank raqami uchun noto'g'ri ma'lumotlar kiritildi`
				});
			} else {
				next()
			}
		} else if (invoiceNumber) {
			if (invoiceNumber.length !== 24) {
				return res.status(449).json({
					error: true,
					message: `Hisob raqami uchun noto'g'ri ma'lumotlar kiritildi`
				});
			}  else if (String(Number(+invoiceNumber)) === 'NaN') {
				return res.status(449).json({
					error: true,
					message: `Hisob raqami uchun noto'g'ri ma'lumotlar kiritildi`
				});
			} else {
				next()
			}
		} else if (passportId) {
			if (passportId.length !== 9) {
				return res.status(449).json({
					error: true,
					message: `Passport uchun noto'g'ri ma'lumotlar kiritildi`
				});
			} else {
				next()
			}
		}  else if (firstName.length > 128) {
			return res.status(449).json({
				error: true,
				message: `Familya 128 belgidan oshmasligi kerak`
			});
		} else if (lastName.length > 128) {
			return res.status(449).json({
				error: true,
				message: `Ism 128 belgidan oshmasligi kerak`
			});
		} else if (String(Number(+contact)) === 'NaN' || contact.length > 15 || contact.length < 11) {
			return res.status(449).json({
				error: true,
				message: `Telefon raqam uchun noto'g'ri ma'lumot kiritildi`
			});
		} else {
			next()
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Validationda xatolik: ${String(e)}`
		});
	}
};