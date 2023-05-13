const TreasuresModel = require('../models/TreasuresModel');

module.exports.getStatic = async (req, res) => {
	try {
		const { shopId, getDate, report } = req.query
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await TreasuresModel.staticOfCashbox(shopId || null, report, getDate || null)

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

module.exports.changeStatus = async (req, res) => {
	try {
		const { id, getDate, status } = req.body
		
		if (req.user.status === 1) {
			const data = await TreasuresModel.changeStatus(status, getDate, id)
		
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
				res.status(202).json({
					error: false,
					message: "Muvaffaqiyatli bajarildi"
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


module.exports.getCashReg = async (req, res) => {
	try {
		const { shopId, getDate, cashRegisterId, cashierId } = req.query
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await TreasuresModel.getCashReg(shopId, getDate, cashRegisterId, cashierId)
			
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

module.exports.getCashBoxList = async (req, res) => {
	try {
		const { shopId, report, getDate, cashboxId } = req.query
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await TreasuresModel.getCashBoxList(shopId, report, getDate || null, cashboxId)
		
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