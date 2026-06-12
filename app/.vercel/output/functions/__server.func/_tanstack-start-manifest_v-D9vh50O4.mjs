//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-D9vh50O4.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "C:/git/datapack/app/src/routes/__root.tsx",
		children: [
			"/",
			"/api/telemetry",
			"/packs/$packId",
			"/api/packs/$packId"
		],
		preloads: ["/assets/index-yCiPhe5H.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-yCiPhe5H.js"
		} }]
	},
	"/": {
		filePath: "C:/git/datapack/app/src/routes/index.tsx",
		children: void 0,
		preloads: ["/assets/routes-BstF3Btf.js", "/assets/StatCard-B_rEwv8t.js"]
	},
	"/packs/$packId": {
		filePath: "C:/git/datapack/app/src/routes/packs.$packId.tsx",
		children: void 0,
		preloads: ["/assets/packs._packId-CphNGSsy.js", "/assets/StatCard-B_rEwv8t.js"]
	}
} });
//#endregion
export { tsrStartManifest };
