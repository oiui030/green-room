import { Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from './lib/store.jsx';
import { Intro, About, Onboard } from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import Care from './screens/Care.jsx';
import Discover, { Species, Missing } from './screens/Discover.jsx';
import Plant from './screens/Plant.jsx';
import Log from './screens/Log.jsx';
import Plan from './screens/Plan.jsx';
import Help from './screens/Help.jsx';

// Until onboarding is done, every app screen sends you to the intro.
function Gate({ children }) {
  const { state } = useStore();
  return state.profile.onboarded ? children : <Navigate to="/intro" replace />;
}

export default function App() {
  const { state } = useStore();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={state.profile.onboarded ? '/home' : '/intro'} replace />} />
      <Route path="/intro" element={<Intro />} />
      <Route path="/about" element={<About />} />
      <Route path="/onboard" element={<Onboard />} />
      <Route path="/home" element={<Gate><Home /></Gate>} />
      <Route path="/care" element={<Gate><Care /></Gate>} />
      <Route path="/discover" element={<Gate><Discover /></Gate>} />
      <Route path="/species/:key" element={<Gate><Species /></Gate>} />
      <Route path="/plant/:id" element={<Gate><Plant /></Gate>} />
      <Route path="/log" element={<Gate><Log /></Gate>} />
      <Route path="/plan/:id" element={<Gate><Plan /></Gate>} />
      <Route path="/help" element={<Gate><Help /></Gate>} />
      <Route path="*" element={<Missing />} />
    </Routes>
  );
}
