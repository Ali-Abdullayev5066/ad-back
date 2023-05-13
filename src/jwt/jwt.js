const jwt = require('jsonwebtoken');
require('dotenv').config();


module.exports.sign = ({id, shopId, isAdmin, status, username}) => {
	return jwt.sign({id, shopId, isAdmin, status}, process.env.JWT_SECRET_KEY, {expiresIn: "4d"})
}

module.exports.verify = (req, res, next) => {
	const authHeader = req.headers.token
	try {
		if(authHeader) {
			jwt.verify(authHeader, process.env.JWT_SECRET_KEY, (err, admin) => {
				if (err) {
					return res.status(403).json({
						error: true,
						message: `Token noto'g'ri`,
						tokenError: true
					})
				} else {
					req.user = admin
					next()
				}
			})
		} else {
			return res.status(401).json({
				error: true,
				message: `Siz ro'yxatdan o'tmagansiz`,
				tokenError: true
			})
		}
	} catch (e) {
		res.status(500).json({error: true, message: `Server xatolik: ${String(e)}`})
	}
}