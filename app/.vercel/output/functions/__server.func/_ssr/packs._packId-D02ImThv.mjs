import { r as __toESM } from "../_runtime.mjs";
import { N as require_react, g as require_jsx_runtime, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./packs._packId-Bmxyg3G9.mjs";
import { a as useQuery, i as useMutation } from "../_libs/convex.mjs";
import { t as api } from "./api-DSJLF2wo.mjs";
import { i as formatTimestamp, n as FormatBadges, r as StatCard, t as EventTable } from "./StatCard-Barp4q1W.mjs";
import { a as ArrowLeft, i as Download, n as RefreshCw, o as Activity, t as Search } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/packs._packId-D02ImThv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function toDatetimeLocal(iso) {
	const d = new Date(iso);
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromDatetimeLocal(value) {
	return new Date(value).toISOString();
}
function PackEditor({ packId, pack }) {
	const updateMeta = useMutation(api.packs.updateMeta);
	const updateProduct = useMutation(api.packs.updateProduct);
	const [version, setVersion] = (0, import_react.useState)(pack.meta.version);
	const [generatedAt, setGeneratedAt] = (0, import_react.useState)(toDatetimeLocal(pack.meta.generatedAt));
	const [staleAfter, setStaleAfter] = (0, import_react.useState)(toDatetimeLocal(pack.meta.staleAfter));
	const [products, setProducts] = (0, import_react.useState)(pack.products.map((p) => ({
		sku: p.sku,
		price: p.price,
		stock: p.stock
	})));
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setVersion(pack.meta.version);
		setGeneratedAt(toDatetimeLocal(pack.meta.generatedAt));
		setStaleAfter(toDatetimeLocal(pack.meta.staleAfter));
		setProducts(pack.products.map((p) => ({
			sku: p.sku,
			price: p.price,
			stock: p.stock
		})));
	}, [pack]);
	async function handleSave() {
		setSaving(true);
		setMessage(null);
		try {
			await updateMeta({
				packId,
				version,
				generatedAt: fromDatetimeLocal(generatedAt),
				staleAfter: fromDatetimeLocal(staleAfter)
			});
			for (const product of products) await updateProduct({
				packId,
				sku: product.sku,
				price: product.price,
				stock: product.stock
			});
			setMessage("Saved — open the pack file and click Update to pull fresh data.");
		} catch (err) {
			setMessage(err instanceof Error ? err.message : "Save failed");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-medium",
					children: "Edit pack data"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-[var(--text-secondary)]",
					children: "Demo controls — changes apply immediately to the API"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void handleSave(),
					disabled: saving,
					className: "rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50",
					children: saving ? "Saving…" : "Save changes"
				})]
			}),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mb-4 text-sm ${message.startsWith("Saved") ? "text-[var(--accent-green)]" : "text-[var(--accent-orange)]"}`,
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-[var(--text-secondary)]",
							children: "Version"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: version,
							onChange: (e) => setVersion(e.target.value),
							className: "w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)]"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-[var(--text-secondary)]",
							children: "Generated at"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "datetime-local",
							value: generatedAt,
							onChange: (e) => setGeneratedAt(e.target.value),
							className: "w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)]"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-[var(--text-secondary)]",
							children: "Stale after"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "datetime-local",
							value: staleAfter,
							onChange: (e) => setStaleAfter(e.target.value),
							className: "w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)]"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-[var(--border)] text-left text-[var(--text-secondary)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 pr-4 font-medium",
								children: "SKU"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 pr-4 font-medium",
								children: "Price (SEK)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Stock"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: products.map((product, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-[var(--border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 pr-4 font-mono text-[var(--text-muted)]",
								children: product.sku
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 pr-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: product.price,
									onChange: (e) => {
										const next = [...products];
										next[index] = {
											...product,
											price: Number(e.target.value)
										};
										setProducts(next);
									},
									className: "w-28 rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: product.stock,
									onChange: (e) => {
										const next = [...products];
										next[index] = {
											...product,
											stock: Number(e.target.value)
										};
										setProducts(next);
									},
									className: "w-24 rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1"
								})
							})
						]
					}, product.sku)) })]
				})
			})
		]
	});
}
function PackDetailPage() {
	const { packId } = Route.useParams();
	const pack = useQuery(api.packs.getByPackId, { packId });
	const stats = useQuery(api.telemetry.packStats, { packId });
	const events = useQuery(api.telemetry.recent, {
		packId,
		limit: 30
	});
	if (pack === void 0 || stats === void 0 || events === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-16 text-center text-[var(--text-secondary)]",
		children: "Loading pack…"
	});
	if (!pack) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-[var(--text-secondary)]",
			children: ["Pack not found: ", packId]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "mt-4 inline-block text-[var(--accent)]",
			children: "← Back to overview"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), "Overview"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold",
					children: pack.meta.assortment
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-mono text-sm text-[var(--text-muted)]",
					children: packId
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-[var(--text-secondary)]",
					children: [
						"Version ",
						pack.meta.version,
						" · ",
						pack.products.length,
						" products · Last seen",
						" ",
						stats.lastSeen ? formatTimestamp(stats.lastSeen) : "never"
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Opens",
						value: stats.opens,
						icon: Activity,
						accent: "blue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Exports",
						value: stats.exports,
						icon: Download,
						accent: "green"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Updates",
						value: stats.updates,
						icon: RefreshCw,
						accent: "orange"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Top search",
						value: stats.topSearches[0]?.query ?? "—",
						icon: Search
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackEditor, {
				packId,
				pack
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-lg font-medium",
					children: "Export formats"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormatBadges, { exportsByFormat: stats.exportsByFormat })]
			}),
			stats.topSearches.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-lg font-medium",
					children: "Top searches"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: stats.topSearches.map(({ query, count }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded bg-[var(--bg-tertiary)] px-3 py-1 text-sm text-[var(--text-secondary)]",
						children: [
							query,
							" (",
							count,
							")"
						]
					}, query))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-lg font-medium",
					children: "Event timeline"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventTable, { events })]
			})
		]
	});
}
//#endregion
export { PackDetailPage as component };
