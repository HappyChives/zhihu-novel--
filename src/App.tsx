import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { HotspotSurvey } from "./components/HotspotSurvey/HotspotSurvey";
import { Inspiration } from "./components/Inspiration/Inspiration";
import { TopicSelect } from "./components/TopicSelect/TopicSelect";
import { OutlineGen } from "./components/OutlineGen/OutlineGen";
import { WritingAssist } from "./components/WritingAssist/WritingAssist";
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
            <Route path="/hotspot" element={<HotspotSurvey />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="/topic" element={<TopicSelect />} />
            <Route path="/outline" element={<OutlineGen />} />
            <Route path="/writing" element={<WritingAssist />} />
            <Route path="/cover" element={<CoverMaterials />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
