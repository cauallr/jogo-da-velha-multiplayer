import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Local from "./pages/Local";
import Multi from "./pages/Multi";
import Config from "./pages/Config";
import BackAudio from './pages/elements/backAudio';

function App() {
  return (
    <>
      <BackAudio />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/local" element={<Local />} />
          <Route path="/multi" element={<Multi />} />
          <Route path="/config" element={<Config />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
