/**
 * Suite navigation targets for legacy HTML vs V3 hash-router SPA.
 */

export function isSpaSuiteHost() {
  return document.body?.dataset?.bmLegacyPage !== "true";
}

/** @param {'archetype'|'polarity'|'attraction'|'relationship'|'home'} slug */
export function suiteEngineHref(slug) {
  if (isSpaSuiteHost()) {
    const spa = {
      archetype: "#/engines/archetype",
      polarity: "#/engines/polarity",
      attraction: "#/engines/attraction",
      relationship: "#/engines/relationship",
      home: "#/",
    };
    return spa[slug] ?? "#/";
  }
  const legacy = {
    archetype: "archetype.html",
    polarity: "temperament.html",
    attraction: "attraction.html",
    relationship: "relationship.html",
    home: "index.html",
  };
  return legacy[slug] ?? "index.html";
}
