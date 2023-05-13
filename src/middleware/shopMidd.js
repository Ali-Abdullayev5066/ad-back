module.exports.create = (req, res, next) => {
	try {
		const { name, address } = req.body
		const image = req?.files?.image
		console.log(name, address)
		console.log(req.files)
		if ( !name || !address || !image ) {
			return res.status(449).json({
				error: true,
				message: `Qatorlar to'liq kiritilganini tekshiring`
			});
		} else if (name.length > 128) {
			return res.status(449).json({
				error: true,
				message: `Nomi 128 belgidan oshmasligi kerak`
			});
		} else if (address.length > 256) {
			return res.status(449).json({
				error: true,
				message: `Manzili 256 belgidan oshmasligi kerak`
			});
		} else if (image.size > 4000000) {
			return res.status(449).json({
				error: true,
				message: `File 4MB dan katta bo'lmasligi kerak`
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