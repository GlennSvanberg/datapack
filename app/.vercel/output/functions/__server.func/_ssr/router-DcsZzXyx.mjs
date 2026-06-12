import { c as HeadContent, d as Outlet, f as lazyRouteComponent, g as require_jsx_runtime, h as Link, m as createRootRoute, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as json } from "../_libs/@tanstack/router-core+[...].mjs";
import { t as Route$4 } from "./packs._packId-2Excy5F7.mjs";
import { n as ConvexReactClient, o as ConvexHttpClient, r as useConvex, t as ConvexProvider } from "../_libs/convex.mjs";
import { t as api } from "./api-DSJLF2wo.mjs";
import "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DcsZzXyx.js
var import_jsx_runtime = require_jsx_runtime();
function LiveBadge() {
	const state = useConvex().connectionState();
	if (state.kind === "closed") return null;
	const connected = state.kind === "connected";
	const label = state.kind === "connecting" ? "Connecting" : state.kind === "connected" ? "Live" : "Reconnecting";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-2.5 py-0.5 text-xs text-[var(--text-secondary)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1.5 w-1.5 rounded-full ${connected ? "bg-[var(--accent-green)]" : "bg-[var(--accent-orange)] animate-pulse"}` }), label]
	});
}
var convex = new ConvexReactClient("https://fortunate-beagle-220.convex.cloud");
var styles_default = "/assets/styles-CmlSdG18.css";
var Route$3 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Friluftsportalen — DataPack Dashboard" }
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootDocument,
	component: RootLayout
});
function RootLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvexProvider, {
		client: convex,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-screen bg-[var(--bg-primary)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-[var(--border)] bg-[var(--bg-secondary)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/logo.svg",
							alt: "Friluftsportalen",
							className: "h-8"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-[var(--text-secondary)]",
							children: "DataPack Dashboard"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveBadge, {})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-6xl px-6 py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			})]
		})
	});
}
function RootDocument({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
var $$splitComponentImporter = () => import("./routes-D41PlRI_.mjs");
var Route$2 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type"
};
function withCors(headers = {}) {
	return {
		...CORS_HEADERS,
		...headers
	};
}
function corsPreflightResponse() {
	return new Response(null, {
		status: 204,
		headers: withCors()
	});
}
var client = null;
function getConvexClient() {
	const url = process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL;
	if (!url) throw new Error("CONVEX_URL is not configured");
	if (!client) client = new ConvexHttpClient(url);
	return client;
}
var VALID_EVENTS = [
	"open",
	"search",
	"export",
	"update"
];
function isValidEvent(body) {
	if (!body || typeof body !== "object") return false;
	const b = body;
	return typeof b.packId === "string" && typeof b.event === "string" && VALID_EVENTS.includes(b.event) && typeof b.timestamp === "string";
}
var Route$1 = createFileRoute("/api/telemetry")({ server: { handlers: {
	OPTIONS: () => corsPreflightResponse(),
	POST: async ({ request }) => {
		let body;
		try {
			body = await request.json();
		} catch {
			return new Response(JSON.stringify({ error: "Invalid JSON" }), {
				status: 400,
				headers: withCors({ "Content-Type": "application/json" })
			});
		}
		if (!isValidEvent(body)) return new Response(JSON.stringify({ error: "Missing packId, event, or timestamp" }), {
			status: 400,
			headers: withCors({ "Content-Type": "application/json" })
		});
		await getConvexClient().mutation(api.telemetry.append, {
			packId: body.packId,
			event: body.event,
			timestamp: body.timestamp,
			payload: body.payload
		});
		return json({ ok: true }, {
			status: 201,
			headers: withCors()
		});
	}
} } });
var Route = createFileRoute("/api/packs/$packId")({ server: { handlers: {
	OPTIONS: () => corsPreflightResponse(),
	GET: async ({ params }) => {
		const pack = await getConvexClient().query(api.packs.getByPackId, { packId: params.packId });
		if (!pack) return new Response(JSON.stringify({ error: "Pack not found" }), {
			status: 404,
			headers: withCors({ "Content-Type": "application/json" })
		});
		return json(pack, { headers: withCors() });
	}
} } });
var IndexRoute = Route$2.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$3
});
var PacksPackIdRoute = Route$4.update({
	id: "/packs/$packId",
	path: "/packs/$packId",
	getParentRoute: () => Route$3
});
var rootRouteChildren = {
	IndexRoute,
	ApiTelemetryRoute: Route$1.update({
		id: "/api/telemetry",
		path: "/api/telemetry",
		getParentRoute: () => Route$3
	}),
	PacksPackIdRoute,
	ApiPacksPackIdRoute: Route.update({
		id: "/api/packs/$packId",
		path: "/api/packs/$packId",
		getParentRoute: () => Route$3
	})
};
var routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0
	});
}
//#endregion
export { getRouter };
