import { Routes, Route } from 'react-router';
import { HomePage } from './pages/HomePage';
import { PropertyPage } from './pages/PropertyPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/property/:slug" element={<PropertyPage />} />
    </Routes>
  );
}
