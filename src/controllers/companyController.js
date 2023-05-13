const CompanyModel = require('../models/CompanyModel/');

module.exports.add = async (req, res) => {
	try {
		const { typeActivityId, companyName, info, bankCode, invoiceNumber } = req.body;
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await CompanyModel.addCompany(typeActivityId, companyName, info, bankCode, invoiceNumber);

			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data.constraint === 'company_name_inx') {
				res.status(449).json({
					error: true,
					message: `Bu nomdagi kompaniya avval ro'yxatdan o'tgan`
				});
			} else if (data.constraint === 'bank_invoice_inx') {
                res.status(449).json({
                    error: true,
                    message: `Bu hisob raqam va bank kodi avval kiritilgan`
                });
            } else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} else {
				res.status(201).json({
					error: false,
					data
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
}

module.exports.getTyCompActiv = async (req, res) => {
	try {
		const { typeActivityId, companyName, info, } = req.body;
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await CompanyModel.getTyCompActiv();

			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} else if (data.length > 0) {
				res.status(201).json({
					error: false,
					data
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
}

module.exports.all = async (req, res) => {
	try {
		const tcaId = req.query.tcaId || null;
		const offset = req?.query?.page ? ((req?.query?.page - 1) * 40) : 0
		const search = req?.query?.search || ""
		const region = req?.query?.region || ""
	
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await CompanyModel.getAll(tcaId, offset, search, region);
			
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			}else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} else {
				res.status(200).json({
					error: false,
					data
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

module.exports.get = async (req, res) => {
	try {
		const companyId = req.params.id
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await CompanyModel.get(companyId);
			
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
				});
			} else {
				res.status(200).json({
					error: false,
					data
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