import { g as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatCard-BNdqGRqh.js
var import_jsx_runtime = require_jsx_runtime();
/** Deterministic date format for SSR/client hydration */
function formatTimestamp(iso) {
	return iso.replace("T", " ").replace(/\.\d{3}Z$/, " UTC").replace(/Z$/, " UTC");
}
var scopeLabels$1 = {
	all: "all products",
	filtered: "filtered",
	one: "single product"
};
function formatExportPayload(event) {
	const p = event.payload;
	if (!p) return "—";
	const parts = [];
	if (p.format) parts.push(p.format.toUpperCase());
	if (p.scope) parts.push(scopeLabels$1[p.scope] ?? p.scope);
	if (p.productCount != null) parts.push(p.catalogTotal != null && p.scope === "all" ? `${p.productCount}/${p.catalogTotal} products` : `${p.productCount} product${p.productCount === 1 ? "" : "s"}`);
	if (p.fields?.length) {
		const fieldSummary = p.allFieldsSelected && p.totalFields ? `all ${p.totalFields} fields` : `${p.fieldCount ?? p.fields.length} fields (${p.fields.join(", ")})`;
		parts.push(fieldSummary);
	}
	if (p.searchQuery) parts.push(`search: "${p.searchQuery}"`);
	if (p.productSku) parts.push(p.productSku);
	if (p.source) parts.push(`from ${p.source}`);
	if (p.language) parts.push(p.language);
	if (p.filename) parts.push(p.filename);
	return parts.join(" · ") || "—";
}
function formatPayload(event) {
	const p = event.payload;
	if (!p) return "—";
	if (event.event === "export") return formatExportPayload(event);
	const parts = [];
	if (p.query) parts.push(`"${p.query}"`);
	if (p.format) parts.push(p.format.toUpperCase());
	if (p.productSku) parts.push(p.productSku);
	if (p.language) parts.push(p.language);
	return parts.join(" · ") || "—";
}
function EventTable({ events }) {
	if (events.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-8 text-center text-sm text-[var(--text-muted)]",
		children: "No events recorded yet. Open a DataPack file to generate telemetry."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-[var(--border)] text-left text-[var(--text-secondary)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 pr-4 font-medium",
						children: "Time"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 pr-4 font-medium",
						children: "Pack"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 pr-4 font-medium",
						children: "Event"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-3 font-medium",
						children: "Details"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: events.map((event, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-[var(--border)]/50 text-[var(--text-primary)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-3 pr-4 whitespace-nowrap text-[var(--text-secondary)]",
						children: formatTimestamp(event.timestamp)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-3 pr-4 font-mono text-xs",
						children: event.packId
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-3 pr-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs uppercase",
							children: event.event
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-3 text-[var(--text-secondary)]",
						children: formatPayload(event)
					})
				]
			}, `${event.timestamp}-${i}`)) })]
		})
	});
}
var formatColors = {
	csv: "bg-[var(--accent-green)]/20 text-[var(--accent-green)]",
	xlsx: "bg-[var(--accent)]/20 text-[var(--accent)]",
	json: "bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]",
	xml: "bg-purple-500/20 text-purple-400"
};
function FormatBadges({ exportsByFormat }) {
	const entries = Object.entries(exportsByFormat ?? {});
	if (entries.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-sm text-[var(--text-muted)]",
		children: "No exports yet"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: entries.map(([format, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: `rounded px-2 py-1 text-xs font-medium uppercase ${formatColors[format] ?? "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"}`,
			children: [
				format,
				" (",
				count,
				")"
			]
		}, format))
	});
}
var scopeLabels = {
	all: "All products",
	filtered: "Search filter",
	one: "Single product"
};
var scopeColors = {
	all: "bg-[var(--accent)]/20 text-[var(--accent)]",
	filtered: "bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]",
	one: "bg-purple-500/20 text-purple-400"
};
function EmptyHint() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-sm text-[var(--text-muted)]",
		children: "No exports yet"
	});
}
function ExportInsights({ exportsByFormat = {}, exportsByScope = {}, topExportFields = [] }) {
	const scopeEntries = Object.entries(exportsByScope ?? {});
	if (!(Object.keys(exportsByFormat ?? {}).length > 0 || scopeEntries.length > 0 || (topExportFields ?? []).length > 0)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyHint, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-sm font-medium text-[var(--text-secondary)]",
				children: "Formats"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormatBadges, { exportsByFormat: exportsByFormat ?? {} })] }),
			scopeEntries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-sm font-medium text-[var(--text-secondary)]",
				children: "Product scope"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: scopeEntries.map(([scope, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: `rounded px-2 py-1 text-xs font-medium ${scopeColors[scope] ?? "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"}`,
					children: [
						scopeLabels[scope] ?? scope,
						" (",
						count,
						")"
					]
				}, scope))
			})] }),
			(topExportFields ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-sm font-medium text-[var(--text-secondary)]",
				children: "Most selected fields"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: (topExportFields ?? []).map(({ field, count }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "rounded bg-[var(--bg-tertiary)] px-2 py-1 font-mono text-xs text-[var(--text-secondary)]",
					children: [
						field,
						" (",
						count,
						")"
					]
				}, field))
			})] })
		]
	});
}
var accentClasses = {
	blue: "text-[var(--accent)]",
	green: "text-[var(--accent-green)]",
	orange: "text-[var(--accent-orange)]"
};
function StatCard({ label, value, icon: Icon, accent = "blue" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-[var(--text-secondary)]",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-4 w-4 ${accentClasses[accent]}` })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-3xl font-semibold text-[var(--text-primary)]",
			children: value
		})]
	});
}
//#endregion
export { formatTimestamp as i, ExportInsights as n, StatCard as r, EventTable as t };
