import {
  urlListeProduitsComplete,
  urlsAccueilMisesEnAvant,
} from "../src/lib/catalog-api";

describe("catalog-api", () => {
  it("ajoute _nc aux URLs catalogue (anti-cache)", () => {
    expect(urlListeProduitsComplete()).toMatch(/[?&]_nc=\d+/);
    const u = urlsAccueilMisesEnAvant();
    expect(u.featured).toMatch(/[?&]_nc=\d+/);
    expect(u.exclusif).toMatch(/[?&]_nc=\d+/);
  });
});
