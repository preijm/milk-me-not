import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { productHeads, productSeo } from "./productSeo";
import { htmlForRoute } from "./staticSeo";

const A = "1d610abd-f24f-4db2-b9ae-0e7a9e07bb24";
const B = "57014af5-ae9a-4c57-b0ba-65c0d895d9cb";

describe("productSeo", () => {
  it("names the product, the count, the average and the tier", () => {
    const { title, description } = productSeo({ brandName: "Oatly", productName: "Barista", count: 2, avgScore: 8 });
    expect(title).toBe("Oatly Barista — Reviews | Milk Me Not");
    expect(description).toMatch(/^See 2 community ratings of Oatly Barista on Milk Me Not — average score 8\.0\/10, rated .+\.$/);
  });

  it("speaks in the singular for one rating", () => {
    expect(productSeo({ brandName: "X", productName: "Y", count: 1, avgScore: 5 }).description).toContain("See 1 community rating of");
  });

  it("asks for a first rating when there is none", () => {
    expect(productSeo({ brandName: "X", productName: "Y", count: 0, avgScore: null }).description).toBe(
      "Be the first to rate X Y on Milk Me Not.",
    );
  });
});

describe("productHeads", () => {
  it("returns nothing when the fetch failed", () => {
    expect(productHeads(null)).toEqual({});
  });

  it("writes one head per product, averaging only the scored rows", () => {
    const heads = productHeads([
      { product_id: B, brand_name: "Alpro", product_name: "Soya", rating: 6 },
      { product_id: A, brand_name: "Oatly", product_name: "Barista", rating: 8 },
      { product_id: A, brand_name: "Oatly", product_name: "Barista", rating: 6 },
      { product_id: A, brand_name: "Oatly", product_name: "Barista", rating: null },
    ]);
    expect(Object.keys(heads)).toEqual([A, B]);
    expect(heads[A].description).toContain("See 3 community ratings");
    expect(heads[A].description).toContain("average score 7.0/10");
  });

  it("skips anything that is not a product id, so no path can be built from it", () => {
    expect(productHeads([{ product_id: "../index", rating: 5 }, { product_id: null, rating: 5 }])).toEqual({});
  });

  it("falls back on unknown names rather than writing 'null'", () => {
    expect(productHeads([{ product_id: A, rating: 5 }])[A].title).toBe("Unknown brand Unknown product — Reviews | Milk Me Not");
  });

  it("stamps into the real index.html with the product's own canonical", () => {
    const shell = readFileSync("index.html", "utf8");
    const head = productHeads([{ product_id: A, brand_name: "Oat & Co", product_name: "<Barista>", rating: 7 }])[A];
    const html = htmlForRoute(shell, `/product/${A}`, head);
    expect(html).toContain(`<link rel="canonical" href="https://milkmenot.com/product/${A}" />`);
    expect(html).toContain(`<meta property="og:url" content="https://milkmenot.com/product/${A}"`);
    expect(html).toContain("<title>Oat &amp; Co &lt;Barista> — Reviews | Milk Me Not</title>");
  });
});
