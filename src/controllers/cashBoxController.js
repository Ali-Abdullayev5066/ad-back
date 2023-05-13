const CashBoxModel = require('../models/CashBoxModel');

module.exports.add = async (req, res) => {
	try {
		const { shopId, cashNumber } = req.body;
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await CashBoxModel.add(shopId, cashNumber);

			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data?.constraint === 'cashbox_idx') {
				res.status(449).json({
					error: true,
					message: `Bu sondagi kassa ushbu filialda mavjud.`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik: ${String(data)}`
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

module.exports.get = async (req, res) => {
	try {
		const shopId = req.query.shopId || null;
		const offset = req.query?.page ? ((req.query.page - 1) * 40) : 0
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await CashBoxModel.getShopId(shopId);
		
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik: ${String(data)}`
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
}

module.exports.delete = async (req, res) => {
	try {
		const { cashboxId }  = req.body;
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await CashBoxModel.delete(cashboxId);
		
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik: ${String(data)}`
				});
			} else {
				res.status(202).json({
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