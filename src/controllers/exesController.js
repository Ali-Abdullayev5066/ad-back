const ExesModel = require('../models/ExesModel/');
const { notNullFunc } = require('../myFunc/notNullFunc');

module.exports.addExec = async (req, res) => {
	const result = notNullFunc(req.body)
	try {
		if (req.user.isAdmin && req.user.status === 1) {
			const newExes = await ExesModel.add(result);

			if (!newExes) {
				res.status(500).json({message: `Server xatolik`})
			} else if (newExes.id) {
				res.status(201).json({exes: newExes})
			} else {
				res.status(500).json({message: `Server xatolik`})
			}
		} else {
			res.status(409).json({message: `Sizda imkoniyat yo'q`})
		}
	} catch (e) {
		res.status(500).json({
			error: true,
			message: `Server xatolik: ${String(e)}`
		});
	}	
}

module.exports.putExes = async (req, res) => {
	if (req.user.isAdmin && req.user.status === 1) {
		const { name, comment, cost, exesId } = req.body

		const editExes = await ExesModel.putExes(name, comment, cost, exesId)

		if (!editExes) {
			res.status(500).json({message: `Server xatolik`})
		} else if (editExes.id) {
			res.status(201).json({exes: editExes})
		} else {
			res.status(500).json({message: `Server xatolik`})
		}

	} else {
		res.status(409).json({message: `Sizda imkoniyat yo'q`})
	} 
}

module.exports.deletExes = async (req, res) => {
	if (req.user.isAdmin && req.user.status === 1) {
		const { exesId } = req.body

		const exes = await ExesModel.deletExes(exesId)

		if (!exes) {
			res.status(500).json({message: `Server xatolik`})
		} else if (exes.id) {
			res.status(201).json({exes: exes})
		} else {
			res.status(500).json({message: `Server xatolik`})
		}
	} else {
		res.status(409).json({message: `Sizda imkoniyat yo'q`})
	} 
}

module.exports.getDay = async (req, res) => {
	if (req.user.isAdmin && req.user.status === 1) {
		const day = req.query.day
		const exes = await ExesModel.getDay(day)

		if (!exes.length) {
			res.status(500).json({message: `Xarajatlar ro'yxati shakllantirilmagan`})
		} else if (exes.severity) {
			res.status(500).json({message: `Bazada nosozlik`})
		} else if (exes.length) {
			res.status(201).json({exes: exes})
		} else {
			res.status(500).json({message: `Server xatolik`})
		}

	} else {
		res.status(409).json({message: `Sizda imkoniyat yo'q`})
	}
}