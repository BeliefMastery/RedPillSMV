import { Navigate, Route, Routes } from "react-router-dom";
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
        <Route index element={<HomePage />} />
        <Route path="engines/:engineId" element={<EngineRoutePage />} />
        <Route path="integrated-map" element={<IntegratedMapPage />} />
        <Route path="archetype-spread" element={<ArchetypeSpreadPage />} />
        <Route path="learn/sexual-contract" element={<SexualContractModulePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
