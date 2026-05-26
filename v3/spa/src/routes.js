import { lazy } from "react";

export const navItems = [
  { path: "/", label: "Home" },
  { path: "/engines/archetype", label: "Archetype" },
  { path: "/engines/polarity", label: "Polarity" },
  { path: "/engines/attraction", label: "Attraction" },
  { path: "/engines/relationship", label: "Relationships" },
];

export const engineRoutes = [
  {
    id: "archetype",
    path: "/engines/archetype",
    label: "Modern Archetype Identification",
    shortLabel: "Archetype",
    cover: "./images/redpill-cover.jpg",
    hero: "./images/redpill-tool.jpg",
  },
  {
    id: "polarity",
    path: "/engines/polarity",
    label: "Polarity Position Mapping",
    shortLabel: "Polarity",
    cover: "./images/temperament-analysis-cover.jpg",
    hero: "./images/temperament-analysis-cover.jpg",
    engineModule: "temperament-engine.js",
    engineClass: "TemperamentEngine",
  },
  {
    id: "attraction",
    path: "/engines/attraction",
    label: "Attraction, Status and Selection",
    shortLabel: "Attraction",
    cover: "./images/attraction-cover.jpg",
    hero: "./images/attraction-cover.jpg",
  },
  {
    id: "relationship",
    path: "/engines/relationship",
    label: "Relationship Viability",
    shortLabel: "Relationships",
    cover: "./images/relationship-optimization-cover.jpg",
    hero: "./images/relationship-optimization-cover.jpg",
  },
];

export const nativeEngineViews = {
  archetype: lazy(() => import("./engines/archetype/ArchetypeEngineView.jsx")),
  polarity: lazy(() => import("./engines/polarity/PolarityEngineView.jsx")),
  attraction: lazy(() => import("./engines/attraction/AttractionEngineView.jsx")),
  relationship: lazy(() => import("./engines/relationship/RelationshipEngineView.jsx")),
};

export const pageMeta = {
  "/": {
    title: "Unplugged Dynamics: Red-Pill Relational Suite",
    description:
      "Modern dating and relationship evaluation: archetype, SMV, polarity, and viability. Offline on your device.",
  },
  "/integrated-map": {
    title: "Integrated map | Red-Pill Relational Suite",
    description: "Combined read across identity, expression, and market position.",
  },
  "/archetype-spread": {
    title: "Archetype spread table | Red-Pill Relational Suite",
    description: "Full archetype taxonomy reference table.",
  },
};
