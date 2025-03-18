import { useState, useEffect } from "react";
import { auth } from "../config/firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Divider,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import LogoutIcon from "@mui/icons-material/Logout";

function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Set up an auth state observer that persists across page navigation
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    // Clean up the observer when component unmounts
    return () => unsubscribe();
  }, []);

  // Login with Email
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setUser(auth.currentUser);
    } catch (error) {
      alert("Login failed");
    }
  };

  // Google Login
  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      alert("Google login failed");
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleClick = (path: string) => {
    // Navigate to the gallery page and pass the tag as a query parameter
    window.location.href = `/${path}`;
  };

  const navigationTiles = [
    {
      title: "Bookings",
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: "#4caf50",
      path: "bookings",
      description: "Manage customer reservations and availability"
    },
    {
      title: "Gallery Management",
      icon: <PhotoLibraryIcon sx={{ fontSize: 40 }} />,
      color: "#2196f3",
      path: "gallery-management",
      description: "Upload and organize property photos"
    },
    {
      title: "Room Management",
      icon: <MeetingRoomIcon sx={{ fontSize: 40 }} />,
      color: "#ff9800",
      path: "room-management",
      description: "Manage room details, pricing and amenities"
    }
  ];

  return (
    <Container maxWidth="lg">
      {user ? (
        <Box sx={{ mt: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Typography variant="h4" component="h1">
              Admin Dashboard
            </Typography>
            <Box display="flex" alignItems="center">
              <Box mr={2}>
                <Avatar src={user.photoURL || undefined} alt={user.displayName || user.email}>
                  {user.displayName ? user.displayName[0] : user.email[0]}
                </Avatar>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {user.displayName || user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Button 
                onClick={logout} 
                variant="outlined" 
                color="secondary" 
                startIcon={<LogoutIcon />} 
                sx={{ ml: 2 }}
              >
                Logout
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={3}>
            {navigationTiles.map((tile) => (
              <Grid item xs={12} sm={6} md={4} key={tile.path}>
                <Card 
                  sx={{ 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column",
                    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleClick(tile.path)}
                    sx={{ 
                      flex: 1, 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center", 
                      p: 3 
                    }}
                  >
                    <Box 
                      sx={{ 
                        backgroundColor: tile.color, 
                        borderRadius: "50%", 
                        width: 80, 
                        height: 80, 
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "center",
                        color: "white",
                        mb: 2
                      }}
                    >
                      {tile.icon}
                    </Box>
                    <CardContent sx={{ textAlign: "center", p: 1 }}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {tile.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tile.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              width: "100%", 
              maxWidth: 400,
              borderRadius: 2,
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Admin Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your credentials to access the admin dashboard
              </Typography>
            </Box>
            
            <form noValidate>
              <TextField
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                variant="outlined"
                required
                autoComplete="email"
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                required
                autoComplete="current-password"
              />
              <Button 
                onClick={login} 
                variant="contained" 
                fullWidth 
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0"
                  }
                }}
              >
                Login
              </Button>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              <Button
                onClick={googleLogin}
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ 
                  py: 1.5,
                  borderColor: "#4285F4",
                  color: "#4285F4",
                  "&:hover": {
                    borderColor: "#2d74da",
                    backgroundColor: "rgba(66, 133, 244, 0.04)"
                  }
                }}
              >
                Login with Google
              </Button>
            </form>
          </Paper>
        </Box>
      )}
    </Container>
  );
}

export default Home;