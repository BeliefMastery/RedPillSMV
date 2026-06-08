import { Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import LayoutShell from "./components/LayoutShell.jsx";
import HomePage from "./pages/HomePage.jsx";
import EngineRoutePage from "./pages/EngineRoutePage.jsx";
import IntegratedMapPage from "./pages/IntegratedMapPage.jsx";
import ArchetypeSpreadPage from "./pages/ArchetypeSpreadPage.jsx";
import SexualContractModulePage from "./pages/SexualContractModulePage.jsx";

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
              <IntegratedMapPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="archetype-spread"
          element={
            <ErrorBoundary label="archetype-spread">
              <ArchetypeSpreadPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="learn/sexual-contract"
          element={
            <ErrorBoundary label="sexual-contract">
              <SexualContractModulePage />
            </ErrorBoundary>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
