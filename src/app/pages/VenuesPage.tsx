import React, { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { money } from "../lib/format";
import { BrandMark } from "../components/Brand";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { venueApi } from "../services/api";
import { useLoader, useOnline } from "../hooks/useMedia";
import { Banner, EmptyState, Pagination, VenueCard, VenueCardSkeleton } from "../components/ui";
import { PageHeader } from "../components/Motion";
import { VenueQuery } from "../lib/types";

const PER_PAGE = 8;
const PRICE_MIN = 0;
const PRICE_MAX = 200000; // won per hour
const PRICE_STEP = 5000;
const SORT_TO_API: Record<string, string> = { cheap: "cheap", exp: "expensive", pop: "popular", top: "rating" };
const RATINGS: [number, string][] = [
  [0, "Any"],
  [3, "3+"],
  [4, "4+"],
  [4.5, "4.5+"],
];
const TYPES = ["All", "Course", "Simulator", "Range"];

interface Filters {
  min: number;
  max: number;
  rating: number;
  type: string;
}
const NO_FILTERS: Filters = { min: PRICE_MIN, max: PRICE_MAX, rating: 0, type: "All" };

const countActive = (f: Filters) =>
  (f.min > PRICE_MIN || f.max < PRICE_MAX ? 1 : 0) + (f.rating > 0 ? 1 : 0) + (f.type !== "All" ? 1 : 0);

function FilterControls({ value, onChange }: { value: Filters; onChange: (patch: Partial<Filters>) => void }) {
  const { t } = useTranslation();
  const typeText = (v: string) => (v === "All" ? t("venues.all") : t(`venueType.${v.toUpperCase()}`));
  return (
    <>
      <div className="g-field">
        <span className="g-label">
          <Trans
            i18nKey="venues.priceLabel"
            values={{ min: money(value.min), max: `${money(value.max)}${value.max >= PRICE_MAX ? "+" : ""}` }}
            components={{ 0: <span className="g-num" /> }}
          />
        </span>
        <div style={{ display: "flex", gap: 16 }}>
          <label style={{ flex: 1, minWidth: 0 }}>
            <span className="g-hint">{t("venues.min")}</span>
            <input className="g-range" type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={value.min}
              onChange={(e) => onChange({ min: Math.min(+e.target.value, value.max) })} aria-label={t("venues.minAria")} />
          </label>
          <label style={{ flex: 1, minWidth: 0 }}>
            <span className="g-hint">{t("venues.max")}</span>
            <input className="g-range" type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={value.max}
              onChange={(e) => onChange({ max: Math.max(+e.target.value, value.min) })} aria-label={t("venues.maxAria")} />
          </label>
        </div>
      </div>

      <div className="g-field">
        <span className="g-label" id="frl">{t("venues.minRating")}</span>
        <div className="g-chips" role="radiogroup" aria-labelledby="frl">
          {RATINGS.map(([v, text]) => (
            <button key={v} className="g-fchip" type="button" role="radio" aria-checked={value.rating === v} aria-label={v === 0 ? t("venues.ratingAnyAria") : t("venues.ratingAria", { value: v })} onClick={() => onChange({ rating: v })}>
              {v === 0 ? t("venues.ratingAny") : text}
            </button>
          ))}
        </div>
      </div>

      <div className="g-field">
        <span className="g-label" id="ftl">{t("venues.venueType")}</span>
        <div className="g-chips" role="group" aria-labelledby="ftl">
          {TYPES.map((v) => (
            <button key={v} className="g-fchip" type="button" aria-pressed={value.type === v} onClick={() => onChange({ type: v })}>
              {typeText(v)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default function VenuesPage() {
  const { t } = useTranslation();
  const { isMobile } = useOutletContext<{ isMobile: boolean }>();
  const online = useOnline();
  const [params, setParams] = useSearchParams();

  // everything the list shows lives in the URL, so refresh and back/forward just work
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "pop";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const applied: Filters = useMemo(
    () => ({
      min: Number(params.get("min")) || PRICE_MIN,
      max: Number(params.get("max")) || PRICE_MAX,
      rating: Number(params.get("rating")) || 0,
      type: TYPES.includes(params.get("type") ?? "") ? (params.get("type") as string) : "All",
    }),
    [params]
  );

  const update = (patch: Record<string, string | number | null>, keepPage = false) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === null || v === "" ? next.delete(k) : next.set(k, String(v))));
    if (!keepPage) next.delete("page");
    setParams(next, { replace: true });
  };
  const filterPatch = (f: Filters) => ({
    min: f.min > PRICE_MIN ? f.min : null,
    max: f.max < PRICE_MAX ? f.max : null,
    rating: f.rating > 0 ? f.rating : null,
    type: f.type !== "All" ? f.type : null,
  });

  // desktop: filters apply as you go (sliders wait a moment); mobile: edit a draft, then Apply
  const [draft, setDraft] = useState<Filters>(applied);
  const [sheet, setSheet] = useState(false);
  const [searchText, setSearchText] = useState(q);
  useEffect(() => setDraft(applied), [applied]);
  useEffect(() => setSearchText(q), [q]);

  const changeFilters = (patch: Partial<Filters>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (!isMobile) {
      const priceOnly = "min" in patch || "max" in patch;
      if (!priceOnly) update(filterPatch(next));
    }
  };
  useEffect(() => {
    if (isMobile) return;
    if (draft.min === applied.min && draft.max === applied.max) return;
    const timer = window.setTimeout(() => update(filterPatch(draft)), 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.min, draft.max]);

  useEffect(() => {
    const timer = window.setTimeout(() => searchText !== q && update({ q: searchText.trim() || null }), 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const query: VenueQuery = {
    page,
    limit: PER_PAGE,
    sort: SORT_TO_API[sort] ?? "popular",
    search: q || undefined,
    minPrice: applied.min > PRICE_MIN ? applied.min : undefined,
    maxPrice: applied.max < PRICE_MAX ? applied.max : undefined,
    minRating: applied.rating > 0 ? applied.rating : undefined,
    type: applied.type !== "All" ? applied.type.toUpperCase() : undefined,
  };
  const key = params.toString();
  const { data, loading, error, reload } = useLoader(() => venueApi.list(query), [key]);

  const total = data?.total ?? 0;
  const venues = data?.venues ?? [];
  const activeCount = countActive(applied);
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const none = !loading && !error && venues.length === 0;
  const from = (page - 1) * PER_PAGE;

  const clearFilters = () => {
    setDraft(NO_FILTERS);
    update(filterPatch(NO_FILTERS));
  };

  return (
    <main className="g-mainpage">
      <div className="g-wrap" style={{ display: "grid", gap: 24 }}>
        <PageHeader title={t("venues.title")} subtitle={t("venues.subtitle")} />

        {!online && (
          <Banner info icon="i-wifi" title={t("venues.offlineTitle")}>
            {t("venues.offlineText")}
          </Banner>
        )}

        <div className="g-row" style={{ alignItems: "flex-end" }}>
          <div className="g-field" style={{ flex: "2 1 260px" }}>
            <label className="g-label" htmlFor="q">{t("venues.searchLabel")}</label>
            <div className="g-iconin g-iconin--search">
              <BrandMark className="g-iconin-mark" size={22} />
              <input className="g-input" id="q" type="search" placeholder={t("venues.searchPlaceholder")} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </div>
          </div>
          <div className="g-field" style={{ flex: "1 1 180px" }}>
            <label className="g-label" htmlFor="sort">{t("venues.sortBy")}</label>
            <select className="g-select" id="sort" value={sort} onChange={(e) => update({ sort: e.target.value })}>
              <option value="cheap">{t("venues.sort.cheap")}</option>
              <option value="exp">{t("venues.sort.exp")}</option>
              <option value="pop">{t("venues.sort.pop")}</option>
              <option value="top">{t("venues.sort.top")}</option>
            </select>
          </div>
          {isMobile && (
            <button className="g-btn g-btn--secondary" type="button" onClick={() => { setDraft(applied); setSheet(true); }} aria-haspopup="dialog" style={{ flex: "1 1 100%" }}>
              <i className="i i-sliders" />{t("venues.filters")}
              {activeCount > 0 && <span className="g-fcount" aria-label={t("venues.activeFilters", { count: activeCount })}>{activeCount}</span>}
            </button>
          )}
        </div>

        {!isMobile && (
          <div className="g-filters">
            <FilterControls value={draft} onChange={changeFilters} />
          </div>
        )}

        <div className="g-between">
          <p className="g-num" style={{ fontWeight: 700 }} aria-live="polite">
            {loading || error ? "" : t("venues.count", { count: total })}
          </p>
          {activeCount > 0 && !isMobile && (
            <button className="g-textbtn" type="button" onClick={clearFilters}><i className="i i-sm i-x" />{t("venues.clearFilters")}</button>
          )}
        </div>

        {error && (
          <Banner title={t("venues.loadErrorTitle")} action={<button className="g-btn g-btn--secondary g-btn--sm" type="button" onClick={reload}>{t("common.retry")}</button>}>
            {t("venues.loadErrorText")}
          </Banner>
        )}

        {loading && (
          <div className="g-cards" aria-busy="true" aria-label={t("venues.loadingAria")}>
            {Array.from({ length: 4 }, (_, k) => <VenueCardSkeleton key={k} />)}
          </div>
        )}

        {none && q && activeCount === 0 && (
          <EmptyState icon="i-search" title={t("venues.noneTitle")} text={t("venues.noneText", { q })}
            action={<button className="g-btn g-btn--secondary" type="button" onClick={() => update({ q: null })}>{t("venues.clearSearch")}</button>} />
        )}
        {none && activeCount > 0 && (
          <EmptyState icon="i-sliders" title={t("venues.noMatchTitle")} text={t("venues.noMatchText")}
            action={<button className="g-btn g-btn--secondary" type="button" onClick={clearFilters}>{t("venues.clearFilters")}</button>} />
        )}
        {none && !q && activeCount === 0 && <EmptyState icon="i-search" title={t("venues.emptyTitle")} text={t("venues.emptyText")} />}

        {venues.length > 0 && (
          <>
            <div className="g-cards">{venues.map((v, i) => <VenueCard key={v._id} venue={v} index={i} />)}</div>
            <Pagination page={page} pageCount={pageCount} label={t("venues.pages")} onPage={(n) => update({ page: n }, true)}
              summary={t("venues.showing", { from: from + 1, to: from + venues.length, total })} />
          </>
        )}
      </div>

      {isMobile && sheet && (
        <div className="g-sheetwrap" onMouseDown={(e) => e.target === e.currentTarget && setSheet(false)}>
          <div className="g-sheet" role="dialog" aria-label={t("venues.filters")} aria-modal="true">
            <span className="g-grab" aria-hidden="true" />
            <div className="g-between">
              <h2 style={{ fontSize: 19 }}>{t("venues.filters")}</h2>
              <button className="g-iconbtn" type="button" aria-label={t("venues.closeFilters")} onClick={() => setSheet(false)}><i className="i i-x" /></button>
            </div>
            <FilterControls value={draft} onChange={(patch) => setDraft({ ...draft, ...patch })} />
            <p className="g-hint g-num" aria-live="polite">
              {countActive(draft) === 0 ? t("venues.noFiltersActive") : t("venues.filtersActive", { count: countActive(draft) })}
            </p>
            <div className="g-row" style={{ flexWrap: "nowrap" }}>
              <button className="g-btn g-btn--secondary" type="button" onClick={() => setDraft(NO_FILTERS)} style={{ flex: 1 }}>{t("venues.clearFilters")}</button>
              <button className="g-btn g-btn--primary" type="button" style={{ flex: 1 }} onClick={() => { update(filterPatch(draft)); setSheet(false); }}>
                {t("venues.apply")}
                {countActive(draft) > 0 && <span className="g-fcount" style={{ background: "var(--on-primary)", color: "var(--primary)" }}>{countActive(draft)}</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
