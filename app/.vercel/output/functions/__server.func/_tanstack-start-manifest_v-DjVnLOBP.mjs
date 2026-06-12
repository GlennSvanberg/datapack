//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-DjVnLOBP.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "C:/git/datapack/app/src/routes/__root.tsx",
		children: [
			"/",
			"/api/telemetry",
			"/packs/$packId",
			"/api/packs/$packId"
		],
		preloads: ["/assets/index-BuE1oUbK.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-BuE1oUbK.js"
		} }]
	},
	"/": {
		filePath: "C:/git/datapack/app/src/routes/index.tsx",
		children: void 0,
		preloads: ["/assets/routes-B2SucK-Z.js", "/assets/StatCard--Wv2yjU3.js"]
	},
	"/packs/$packId": {
		filePath: "C:/git/datapack/app/src/routes/packs.$packId.tsx",
		children: void 0,
		preloads: ["/assets/packs._packId-BJXuPSAA.js", "/assets/StatCard--Wv2yjU3.js"]
	}
} });
//#endregion
export { tsrStartManifest };
