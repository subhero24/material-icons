import Url from "url";
import Path from "path";
import Zipper from "zip-unzip-promise";
import Filesystem from "fs-extra";

import fetch from "node-fetch";

const scriptsDir = Path.dirname(Url.fileURLToPath(import.meta.url));
const currentDir = Path.resolve(scriptsDir, "..");

const iconsDir = Path.resolve(currentDir, "icons");
const downloadDir = Path.resolve(currentDir, "download");
const downloadFilename = "material.zip";
const downloadFilePath = Path.resolve(downloadDir, downloadFilename);
const downloadIconsDir = Path.resolve(downloadDir, "material-design-icons-master", "src");
const downloadUrl = "https://github.com/google/material-design-icons/archive/refs/heads/master.zip";

await Filesystem.ensureDir(downloadDir);

console.log("Downloading icons");
await download(downloadUrl, downloadFilePath);
console.log("Unzipping icons");
await Zipper.unzip(downloadFilePath, downloadDir);
console.log("Copying icons");
await Filesystem.move(downloadIconsDir, iconsDir);
console.log("Cleanup");
await Filesystem.remove(downloadDir);

function download(url, path) {
	return new Promise((resolve, reject) => {
		fetch(url).then((response) => {
			let stream = Filesystem.createWriteStream(path);
			stream.on("finish", resolve);
			stream.on("error", reject);
			response.body.pipe(stream);
		});
	});
}
