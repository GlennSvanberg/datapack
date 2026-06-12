import { g as require_jsx_runtime, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as useQuery } from "../_libs/convex.mjs";
import { t as api } from "./api-DSJLF2wo.mjs";
import { n as ExportInsights, r as StatCard, t as EventTable } from "./StatCard-BNdqGRqh.mjs";
import { i as Download, n as RefreshCw, o as Activity, r as Package } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D41PlRI_.js
var import_jsx_runtime = require_jsx_runtime();
function PackTable({ packs }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-[var(--border)] text-left text-[var(--text-secondary)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 pr-4 font-medium",
						children: "Assortment"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 pr-4 font-medium",
						children: "Pack ID"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 pr-4 font-medium",
						children: "Products"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 pr-4 font-medium",
						children: "Version"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "pb-3 font-medium" })
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: packs.map((pack) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-[var(--border)]/50 hover:bg-[var(--bg-hover)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-3 pr-4 font-medium text-[var(--text-primary)]",
						children: pack.assortment
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-3 pr-4 font-mono text-xs text-[var(--text-secondary)]",
						children: pack.packId
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-3 pr-4 text-[var(--text-secondary)]",
						children: pack.productCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "py-3 pr-4 text-[var(--text-secondary)]",
						children: ["v", pack.version]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/packs/$packId",
							params: { packId: pack.packId },
							className: "text-[var(--accent)] hover:text-[var(--accent-hover)]",
							children: "View →"
						})
					})
				]
			}, pack.packId)) })]
		})
	});
}
function DashboardHome() {
	const stats = useQuery(api.telemetry.dashboardStats);
	const packs = useQuery(api.packs.list);
	const events = useQuery(api.telemetry.recent, { limit: 20 });
	if (stats === void 0 || packs === void 0 || events === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-16 text-center text-[var(--text-secondary)]",
		children: "Loading dashboard…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold text-[var(--text-primary)]",
				children: "Overview"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-[var(--text-secondary)]",
				children: "Monitor DataPack usage across assortments — updates live"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total opens",
						value: stats.totalOpens,
						icon: Activity,
						accent: "blue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Exports",
						value: stats.totalExports,
						icon: Download,
						accent: "green"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Updates",
						value: stats.totalUpdates,
						icon: RefreshCw,
						accent: "orange"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active packs",
						value: stats.activePacks,
						icon: Package
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-lg font-medium",
					children: "Export insights"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportInsights, {
					exportsByFormat: stats.exportsByFormat,
					exportsByScope: stats.exportsByScope,
					topExportFields: stats.topExportFields
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-lg font-medium",
					children: "Assortments"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackTable, { packs })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-lg font-medium",
					children: "Recent activity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventTable, { events })]
			})
		]
	});
}
//#endregion
export { DashboardHome as component };
