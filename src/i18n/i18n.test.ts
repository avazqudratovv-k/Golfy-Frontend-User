import { en } from "./en";
import { ko } from "./ko";

// flatten to "a.b.c" keys; arrays count as one value; plural suffixes are normalised
function keys(obj: any, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`.replace(/_(zero|one|two|few|many|other)$/, "")]
  );
}

describe("translations", () => {
  it("Korean and English have exactly the same keys", () => {
    const e = new Set(keys(en));
    const k = new Set(keys(ko));
    expect(Array.from(e).filter((x) => !k.has(x))).toEqual([]);
    expect(Array.from(k).filter((x) => !e.has(x))).toEqual([]);
  });

  it("array resources have the same length in both languages", () => {
    const mismatches: string[] = [];
    const walk = (a: any, b: any, path: string) => {
      Object.keys(a).forEach((key) => {
        if (Array.isArray(a[key]) && b[key]?.length !== a[key].length) mismatches.push(path + key);
        else if (a[key] && typeof a[key] === "object" && !Array.isArray(a[key])) walk(a[key], b[key] ?? {}, `${path}${key}.`);
      });
    };
    walk(en, ko, "");
    expect(mismatches).toEqual([]);
  });

  it("no value is empty", () => {
    const empty = (o: any, p = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        typeof v === "string" ? (v.trim() ? [] : [p + k]) : Array.isArray(v) ? [] : empty(v, `${p}${k}.`)
      );
    expect(empty(en)).toEqual([]);
    expect(empty(ko)).toEqual([]);
  });
});
