export const engineLoaders = {
  archetype: () => import("@site/archetype-engine.js"),
  polarity: () => import("@site/temperament-engine.js"),
  attraction: () => import("@site/attraction-engine.js"),
  relationship: () => import("@site/relationship-engine.js"),
};

export const engineClassNames = {
  archetype: "ArchetypeEngine",
  polarity: "TemperamentEngine",
  attraction: "AttractionEngine",
  relationship: "RelationshipEngine",
};
