import React, { createContext, useContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth, db } from "./config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import "./App.css";
import { SnackbarProvider } from "notistack";
import GalleryManagement from "./pages/GalleryManagement/GalleryManagement";
import RoomManagement from "./pages/RoomManagement/RoomManagement";
import TagManagement from "./pages/TagManagement";
import BookingManagement from "./pages/Bookings/BookingManagement";

// Create auth context
interface AuthContextType {
  currentUser: any;
  // true  = signed in AND on the admins/{uid} allow-list
  // false = signed in but NOT an admin
  // null  = signed out
  isAdmin: boolean | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: null,
  loading: true,
});

// Auth provider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const snap = await getDoc(doc(db, "admins", user.uid));
          setIsAdmin(snap.exists());
        } catch (err) {
          console.error("Admin check failed:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
const useAuth = () => {
  return useContext(AuthContext);
};

// Secure route: requires a signed-in user who is on the admin allow-list.
const SecureRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser && isAdmin ? element : <Navigate to="/" replace />;
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
              path="/booking-management"
              element={<SecureRoute element={<BookingManagement />} />}
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
