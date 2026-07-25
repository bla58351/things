import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import OverviewPage from './pages/OverviewPage';
import ItemDetailPage from './pages/ItemDetailPage';
import LocationScanPage from './pages/LocationScanPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
        </Route>
        <Route path="/location/:id" element={<LocationScanPage />} />
      </Routes>
    </BrowserRouter>
  );
}