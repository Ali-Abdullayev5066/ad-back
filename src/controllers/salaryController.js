const SalaryModel = require('../models/SalaryModel');

module.exports.getList = async (req, res) => {
	const { year, month, shopId } = req.query
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			let list = {};
			if (year && month && shopId) {
				list = await SalaryModel.getSalary(year, month, shopId);
			} else {
				list.shop_list = await SalaryModel.getShopList();
			}
			if (!list) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar mavjud emas`
				})
			} else if (list?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(list)}`
				});
			} else {
				res.status(200).json({
					error: false,
					list
				})
			}
		} else {
			res.status(403).json({
				error: true,
				message: `Sizda imkoniyat mavjud emas`
			});
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Server xatolik: ${String(e)}`
		});
	}
};

module.exports.createGivenSalary = async (req, res) => {
	const { shopId,
			year,
			month,
			statusBool,
			statusInt,
			givSalarId,
			approvedList,
			approvedSumm } = req.body;

	try {
		if (req.user.isAdmin && req.user.status === 1) {
			const givenSalary = await SalaryModel.createGivenSalary(
				shopId,
				year,
				month,
				statusBool,
				statusInt,
				givSalarId,
				approvedList,
				approvedSumm);

			if (!givenSalary) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (givenSalary.constraint === 'given_salary_idx') {
				res.status(449).json({
					error: true,
					message: `Bu filialda ushbu muddat uchun oylik ro'yxatdan o'tgan.`
				});
			} else if (givenSalary?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(givenSalary)}`
				});
			} else if (givenSalary?.create_given_salary?.error) {
				res.status(401)
				.json(givenSalary.create_given_salary);
			} else {
				if (statusBool) {
					res.status(202)
					.json(givenSalary?.create_given_salary);
				} else {
					res.status(201)
					.json( givenSalary?.create_given_salary);
				}
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


module.exports.creteAvans = async (req, res) => {
	const { shopId, total, getDate, list } = req.body;
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			const avans = await SalaryModel.creteAvans(shopId, total, getDate, list);
			if (!avans) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (avans.constraint === 'avans_idx') {
				res.status(449).json({
					error: true,
					message: `Kiritilgan hodim(lar)da ushbu muddat uchun avans ro'yxatdan o'tgan.`
				});
			} else if (avans?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(avans)}`
				});
			} else {
				res.status(200).json({
					error: false,
					message: "Muvaffaqiyatli kiritildi"
				})
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


module.exports.getGivenSalary = async (req, res) => {
	const { year, month, shopId, status } = req.query
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			let list = {};
			if (year && month && shopId) {
				if (status == 1) {
					list = await SalaryModel.getAvans(year, month, shopId);
				} else {
					list = await SalaryModel.getGivenSalary(year, month, shopId);
				}	
			} else {
				list.shop_list = await SalaryModel.getShopList();
			}
			
			if (!list) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar mavjud emas`
				})
			} else if (list?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(list)}`
				});
			} else {
				res.status(200).json({
					error: false,
					list: list?.get_given_salary_list ? list?.get_given_salary_list : list
				})
			}
		} else {
			res.status(403).json({
				error: true,
				message: `Sizda imkoniyat mavjud emas`
			});
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Server xatolik: ${String(e)}`
		});
	}
};

module.exports.deleteGivenSalary = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.query;
		if (req.user.isAdmin && req.user.status === 1) {
			const list = await SalaryModel.deleteGivenSalary(id, status);

			if (!list) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (list?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(list)}`
				});
			} else if (list?.delete_avans?.error) {
				res.status(401).json(list.delete_avans);
			} else {
				res.status(202).json(list.delete_avans)
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

module.exports.updGivenSalary = async (req, res) => {
	const { id, status, salaryType } = req.query;
	console.log(req.query)
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			let list;

			if (salaryType == 1) {
				list = await SalaryModel.updAvans(status, id);
			} else {
				list = await SalaryModel.updGivenSalary(status, id);
			}

			if (!list) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (list?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(list)}`
				});
			} else {
				res.status(202).json({
					error: false,
					list
				})
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



