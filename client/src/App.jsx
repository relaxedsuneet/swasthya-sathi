import MedicalFactChecker from './components/MedicalFactChecker';

function App() {
  // We remove the wrapper div because MedicalFactChecker 
  // already handles the full-screen layout.
  return <MedicalFactChecker />;
}

export default App;