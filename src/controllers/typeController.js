const TypeModel = require('../models/TypeModel');

module.exports.add = async (req, res) => {
	try {
		const { name } = req.body
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await TypeModel.addType(name)

			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data.constraint === 'type_name_idx') {
				res.status(449).json({
					error: true,
					message: `Ushbu mahsulot turi avval ro'yxatdan o'tgan`
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
};


module.exports.put = async (req, res) => {
	try {
		const {name, typeId} = req.body;
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await TypeModel.editType(name, typeId);
		
			if (!data) {
				res.status(401).json({
					error: true,
					message: `Ma'lumotlar topilmadi`
				});
			} else if (data.constraint === 'type_name_idx') {
				res.status(449).json({
					error: true,
					message: `Ushbu mahsulot turi avval ro'yxatdan o'tgan`
				});
			} else if (data?.severity) {
				res.status(409).json({
					error: true,
					message: `Bazaviy xatolik ${String(data)}`
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
};


module.exports.delete = async (req, res) => {
	try {
		const {typeId} = req.body
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await TypeModel.deleteType(typeId)
			
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
					data
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

module.exports.getAll = async (req, res) => {
	try {
		const offset = req?.query?.page ? ((req?.query?.page - 1) * 40) : 0
		const search = req?.query?.search || ""
		
		if (req.user.isAdmin && req.user.status === 1) {
			const data = await TypeModel.getAll(search, offset);
		
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