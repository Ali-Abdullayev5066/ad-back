const compressImages = require("compress-images");
const fs = require("fs");

module.exports.makeid = (length) => {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

module.exports.fileCompressHelper = (uploadPath, pathFile) => {
	const compressedFilePath = `views/${pathFile}/n-`
	const compression = 50
	compressImages(uploadPath, compressedFilePath,
		{compress_force: true, statistic: false, autoupdate: true}, false,
		{ jpg: { engine: "mozjpeg", command: ["-quality", compression] } },
		{ png: { engine: "pngquant", command: ["--quality=" + compression + "-" + compression, "-o"] } },
		{ svg: { engine: "svgo", command: "--multipass" } },
		{ gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
		function(err, completed, statistic){
			if(err) throw err
				fs.unlink(statistic.input, (err2) => {
					if (err2) throw err2;
				});	
		});
}