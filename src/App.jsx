import { BrowserRouter, Routes, Route } from "react-router-dom";
import Canalizacion from "./modules/canalizacion/Canalizacion";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Canalizacion />} />
        <Route path="/canalizacion" element={<Canalizacion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;