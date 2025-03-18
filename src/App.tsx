// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import "./App.css";
import Bookings from "./pages/Bookings";
import { SnackbarProvider } from "notistack";
import GalleryManagement from "./pages/GalleryManagement/GalleryManagement";
import RoomManagement from "./pages/RoomManagement/RoomManagement";
import TagManagement from "./pages/TagManagement";

const App: React.FC = () => {
  return (
    <SnackbarProvider maxSnack={4}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/gallery-management" element={<GalleryManagement />} />
          <Route path="/room-management" element={<RoomManagement />} />
          <Route path="/tag-management" element={<TagManagement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  );
};

export default App;
