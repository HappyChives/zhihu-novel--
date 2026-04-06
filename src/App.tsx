import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { HotspotAnalysis } from "./components/HotspotAnalysis/HotspotAnalysis";
import { Inspiration } from "./components/Inspiration/Inspiration";
import { WorldSetting } from "./components/WorldSetting/WorldSetting";
import { OutlineGen } from "./components/OutlineGen/OutlineGen";
import { CharacterDesign } from "./components/CharacterDesign/CharacterDesign";
import { ChapterOutline } from "./components/ChapterOutline/ChapterOutline";
import { DraftWriting } from "./components/DraftWriting/DraftWriting";
import { CoverMaterials } from "./components/CoverMaterials/CoverMaterials";
import { Settings } from "./components/Settings/Settings";
import { AppProvider } from "./lib/context";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/hotspot" replace />} />
            <Route path="/hotspot" element={<HotspotAnalysis />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="/world" element={<WorldSetting />} />
            <Route path="/outline" element={<OutlineGen />} />
            <Route path="/character" element={<CharacterDesign />} />
            <Route path="/chapter-outline" element={<ChapterOutline />} />
            <Route path="/writing" element={<DraftWriting />} />
            <Route path="/cover" element={<CoverMaterials />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
