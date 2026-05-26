import { Suspense } from "react";
import { Navigate, useParams } from "react-router-dom";
import { engineRoutes, nativeEngineViews } from "../routes.js";

export default function EngineRoutePage() {
  const { engineId } = useParams();
  const route = engineRoutes.find((r) => r.id === engineId);
  const View = nativeEngineViews[engineId];

  if (!route || !View) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<p className="v3-muted">Loading assessment…</p>}>
      <View />
    </Suspense>
  );
}
