// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import NotFound from "./pages/NotFound";
// import "./App.css";
// import Bookings from "./pages/Bookings";
// import { SnackbarProvider } from "notistack";
// import GalleryManagement from "./pages/GalleryManagement/GalleryManagement";
// import RoomManagement from "./pages/RoomManagement/RoomManagement";
// import TagManagement from "./pages/TagManagement";

// const App: React.FC = () => {
//   return (
//     <SnackbarProvider maxSnack={4}>
//       <Router>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/bookings" element={<Bookings />} />
//           <Route path="/gallery-management" element={<GalleryManagement />} />
//           <Route path="/room-management" element={<RoomManagement />} />
//           <Route path="/tag-management" element={<TagManagement />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </Router>
//     </SnackbarProvider>
//   );
// };

// export default App;

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth } from "./config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import "./App.css";
import Bookings from "./pages/Bookings";
import { SnackbarProvider } from "notistack";
import GalleryManagement from "./pages/GalleryManagement/GalleryManagement";
import RoomManagement from "./pages/RoomManagement/RoomManagement";
import TagManagement from "./pages/TagManagement";

// Create auth context
interface AuthContextType {
  currentUser: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
});

// Auth provider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
const useAuth = () => {
  return useContext(AuthContext);
};

// Secure route component using Firebase auth
const SecureRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? element : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <SnackbarProvider maxSnack={4}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Home page contains the login functionality */}
            <Route path="/" element={<Home />} />

            {/* Secure routes */}
            <Route
              path="/bookings"
              element={<SecureRoute element={<Bookings />} />}
            />
            <Route
              path="/gallery-management"
              element={<SecureRoute element={<GalleryManagement />} />}
            />
            <Route
              path="/room-management"
              element={<SecureRoute element={<RoomManagement />} />}
            />
            <Route
              path="/tag-management"
              element={<SecureRoute element={<TagManagement />} />}
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </SnackbarProvider>
  );
};

export default App;
