import { BrowserRouter, Routes, Route } from "react-router-dom"
import Discover from "@/pages/Discover"
import LuminaPage from "@/pages/LuminaPage"
import SentienceLanding from "@/pages/SentienceLanding"
import MindInfo from "@/pages/MindInfo"
import EmotionalUnloading from './pages/EmotionalUnloading';
import WeeklyReport from './pages/WeeklyReport';
import VoiceNotes from './pages/VoiceNotes';
import EmotionalPatterns from './pages/EmotionalPatterns';
import MoodTracker from './pages/MoodTracker';
import ThoughtReframer from './pages/ThoughtReframer';
import SmartJournalling2 from './pages/SmartJournalling2';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<SentienceLanding />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/lumina" element={<LuminaPage />} />
                <Route path="/sentience" element={<SentienceLanding />} />
                <Route path="/mind-info" element={<MindInfo />} />
                <Route path="/emotional-unloading" element={<EmotionalUnloading />} />
                <Route path="/emotional-patterns" element={<EmotionalPatterns />} />
                <Route path="/weekly-report" element={<WeeklyReport />} />
                <Route path="/smart-journalling" element={<SmartJournalling2 />} />
                <Route path="/voice-notes" element={<VoiceNotes />} />
                <Route path="/mood-tracker" element={<MoodTracker />} />
                <Route path="/thought-reframer" element={<ThoughtReframer />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App
