import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { engineRoutes, pageMeta } from "../routes.js";

export default function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const engine = engineRoutes.find((r) => pathname.endsWith(r.id));
    const meta = pageMeta[pathname] || (engine
      ? { title: `${engine.label} | Red-Pill Relational Suite`, description: engine.label }
      : pageMeta["/"]);
    document.title = meta.title;
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.name = "description";
      document.head.appendChild(desc);
    }
    desc.content = meta.description;
  }, [pathname]);

  return null;
}
