import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import LayoutShell from "./components/LayoutShell.jsx";
import HomePage from "./pages/HomePage.jsx";
import EngineRoutePage from "./pages/EngineRoutePage.jsx";

const IntegratedMapPage = lazy(() => import("./pages/IntegratedMapPage.jsx"));
const ArchetypeSpreadPage = lazy(() => import("./pages/ArchetypeSpreadPage.jsx"));
const SexualContractModulePage = lazy(() => import("./pages/SexualContractModulePage.jsx"));

function PageLoading() {
  return (
    <div className="surface" aria-live="polite">
      <p className="v3-muted">Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutShell />}>
        <Route
          index
          element={
            <ErrorBoundary label="home">
              <HomePage />
            </ErrorBoundary>
          }
        />
        <Route
          path="engines/:engineId"
          element={
            <ErrorBoundary label="engine">
              <EngineRoutePage />
            </ErrorBoundary>
          }
        />
        <Route
          path="integrated-map"
          element={
            <ErrorBoundary label="integrated-map">
              <Suspense fallback={<PageLoading />}>
                <IntegratedMapPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="archetype-spread"
          element={
            <ErrorBoundary label="archetype-spread">
              <Suspense fallback={<PageLoading />}>
                <ArchetypeSpreadPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="learn/sexual-contract"
          element={
            <ErrorBoundary label="sexual-contract">
              <Suspense fallback={<PageLoading />}>
                <SexualContractModulePage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
