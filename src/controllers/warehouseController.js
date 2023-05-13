const WarehouseModel = require('../models/WarehouseModel');

module.exports.getAll = async (req, res) => {
	const offset = req?.query?.page ? ((req?.query?.page - 1) * 40) : 0
	const search = req?.query?.search || ""
	const shopId = req?.query?.shopId || null
	const companyId = req?.query?.companyId || null
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			let list = await WarehouseModel.getAddWarehouse(shopId, companyId, search, offset);
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
				res.status(200).json({
					error: false,
					list
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

module.exports.addPayment = async (req, res) => {
	const { addWarId, column, numeric } = req.body
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			let list = await WarehouseModel.addPayment(addWarId, column, numeric);
			if (!list) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (list.constraint === 'given_salary_idx') {
				res.status(449).json({
					error: true,
					message: `Bu filialda ushbu muddat uchun oylik ro'yxatdan o'tgan.`
				});
			} else if (list?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(list)}`
				});
			} else if (list?.add_payment_warehouse?.error) {
				res.status(401)
				.json(list.add_payment_warehouse);
			} else {
				res.status(201).json({
					error: false,
					list: list?.add_payment_warehouse
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

module.exports.deletePayment = async (req, res) => {
	const { id } = req.params
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			let list = await WarehouseModel.deletePayment(id);
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
			} else if (list?.delete_payment_warehouse?.error) {
				res.status(401)
				.json(list.delete_payment_warehouse);
			} else {
				res.status(202).json({
					error: false,
					list: list?.delete_payment_warehouse
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

module.exports.getOnePdf = async (req, res) => {
	const { toWarehouseId } = req.query
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			let list = await WarehouseModel.getOnePdf(toWarehouseId);
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
				res.status(200).json({
					error: false,
					list
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

module.exports.getAllPurchase = async (req, res) => {
	const offset = req?.query?.page ? ((req?.query?.page - 1) * 40) : 0
	const search = req?.query?.search || ""
	const shopId = req?.query?.shopId || null
	const companyId = req?.query?.companyId || null
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			let list = await WarehouseModel.getPurchaseReturn(shopId, companyId, search, offset);
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
				res.status(200).json({
					error: false,
					list
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

module.exports.getPurchasePdf = async (req, res) => {
	const { purchase_return_id } = req.query
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			let list = await WarehouseModel.getPurchasePdf(purchase_return_id);
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
				res.status(200).json({
					error: false,
					list
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

module.exports.balance = async (req, res) => {
	const { barcodes, fromD, toD, shopId, companyId } = req.query
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			let list = await WarehouseModel.balance(barcodes, fromD || null, toD || null, shopId || null, companyId || null);
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
				res.status(200).json({
					error: false,
					list
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