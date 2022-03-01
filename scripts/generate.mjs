import Url from "url";
import Path from "path";
import Filesystem from "fs-extra";

import svgr from "@svgr/core";
import camelcase from "camelcase";

const scriptsDir = Path.dirname(Url.fileURLToPath(import.meta.url));
const currentDir = Path.resolve(scriptsDir, "..");

const iconsDir = Path.resolve(currentDir, "icons");
const sourceDir = Path.resolve(currentDir, "source");
const sourceIconsDir = Path.resolve(sourceDir, "icons");

const options = {
	icon: 24,
	plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
	svgoConfig: {
		sortAttrs: true,
		removeViewBox: false,
	},
	svgProps: {
		viewBox: "0 0 24 24",
		fill: "currentColor",
	},
};

const types = {
	"": "default",
	"outlined": "outlined",
	"round": "round",
	"sharp": "sharp",
	"twotone": "twotone",
};

const filenames = {
	"123": "one_two_three",
	"3d_rotation": "rotation_3d",
	"1k": "one_k",
	"2k": "two_k",
	"3k": "three_k",
	"4k": "four_k",
	"5k": "five_k",
	"6k": "six_k",
	"7k": "seven_k",
	"8k": "eight_k",
	"9k": "nine_k",
	"10k": "ten_k",
	"1k_plus": "one_k_plus",
	"2k_plus": "two_k_plus",
	"3k_plus": "three_k_plus",
	"4k_plus": "four_k_plus",
	"5k_plus": "five_k_plus",
	"6k_plus": "six_k_plus",
	"7k_plus": "seven_k_plus",
	"8k_plus": "eight_k_plus",
	"9k_plus": "nine_k_plus",
	"10k_plus": "ten_k_plus",
	"1x_mobiledata": "mobiledata_1x",
	"3g_mobiledata": "mobiledata_3g",
	"4g_mobiledata": "mobiledata_4g",
	"4g_plus_mobiledata": "plus_mobiledata_4g",
	"2mp": "two_mp",
	"3mp": "three_mp",
	"4mp": "four_mp",
	"5mp": "five_mp",
	"6mp": "six_mp",
	"7mp": "seven_mp",
	"8mp": "eight_mp",
	"9mp": "nine_mp",
	"10mp": "ten_mp",
	"11mp": "eleven_mp",
	"12mp": "twelve_mp",
	"13mp": "thirteen_mp",
	"14mp": "fourteen_mp",
	"15mp": "fifteen_mp",
	"16mp": "sixteen_mp",
	"17mp": "seventeen_mp",
	"18mp": "eighteen_mp",
	"19mp": "nineteen_mp",
	"20mp": "twenty_mp",
	"21mp": "twenty_one_mp",
	"22mp": "twenty_two_mp",
	"23mp": "twenty_three_mp",
	"24mp": "twenty_four_mp",
	"3p": "three_p",
	"5g": "five_g",
	"6_ft_apart": "six_ft_apart",
	"30fps": "thirty_fps",
	"30fps_select": "thirty_fps_select",
	"60fps": "sixty_fps",
	"60fps_select": "sixty_fps_select",
	"360": "three_sixty",
};

await Filesystem.remove(sourceDir);
await Filesystem.ensureDir(sourceDir);
await Filesystem.ensureDir(sourceIconsDir);

for (let type in types) {
	await Filesystem.ensureDir(Path.resolve(sourceIconsDir, types[type]));
}

// Transform all free icons to react components
let categories = await Filesystem.readdir(iconsDir);
for (let category of categories) {
	let categoryPath = Path.resolve(iconsDir, category);

	let icons = await Filesystem.readdir(categoryPath);
	for (let icon of icons) {
		let iconPath = Path.resolve(categoryPath, icon);

		icon = filenames[icon] ?? icon;

		let versions = await Filesystem.readdir(iconPath);
		for (let version of versions) {
			let versionPath = Path.resolve(iconPath, version, "24px.svg");

			let iconType = types[version.match(/^materialicons(.*)$/)[1]];
			let iconContent = await Filesystem.readFile(versionPath, "utf-8");
			let iconComponentName = camelcase(icon + "-icon", { pascalCase: true });
			if (iconComponentName.match(/^\d/)) {
				throw new Error(`Could not convert icon "${icon}" to a valid component name`);
			}

			let iconComponentFilename = icon.replaceAll("_", "-") + ".jsx";
			let iconComponentFilePath = Path.resolve(sourceIconsDir, iconType, iconComponentFilename);

			// Remove all elements with fill="none"
			iconContent = iconContent.replaceAll(/<\w+[^\/><]* fill="none"[^\/><]*\/>/g, "");
			// Remove xmlns definition which is optional in html+svg
			iconContent = iconContent.replaceAll('xmlns="http://www.w3.org/2000/svg"', "");

			let component = await svgr.transform(iconContent, options, { componentName: iconComponentName });
			let componentType = `export function ${iconComponentName}(props: any): any;\n`;
			let componentExport = `export { default as ${iconComponentName} } from './icons/${iconType}/${iconComponentFilename}';\n`;

			const sourceIndexFilePath = Path.resolve(sourceDir, `${iconType}.js`);
			const sourceTypesFilePath = Path.resolve(sourceDir, `${iconType}.d.ts`);

			await Filesystem.writeFile(iconComponentFilePath, component);
			await Filesystem.writeFile(sourceIndexFilePath, componentExport, { flag: "a" });
			await Filesystem.writeFile(sourceTypesFilePath, componentType, { flag: "a" });
		}
	}
}
