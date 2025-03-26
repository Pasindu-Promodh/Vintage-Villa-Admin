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
  useMediaQuery,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material/styles";

function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
      icon: <EventIcon sx={{ fontSize: isMobile ? 30 : 40 }} />,
      color: "#4caf50",
      path: "booking-management",
      description: "Manage customer reservations and availability"
    },
    {
      title: "Gallery Management",
      icon: <PhotoLibraryIcon sx={{ fontSize: isMobile ? 30 : 40 }} />,
      color: "#2196f3",
      path: "gallery-management",
      description: "Upload and organize property photos"
    },
    {
      title: "Room Management",
      icon: <MeetingRoomIcon sx={{ fontSize: isMobile ? 30 : 40 }} />,
      color: "#ff9800",
      path: "room-management",
      description: "Manage room details, pricing and amenities"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ px: isMobile ? 2 : 3 }}>
      {user ? (
        <Box sx={{ mt: isMobile ? 2 : 4 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mb={isMobile ? 2 : 4}
          >
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1"
              align="center"
              sx={{ mb: 2 }}
            >
              Admin Dashboard
            </Typography>
            
            <Box 
              display="flex" 
              flexDirection={isMobile ? "column" : "row"}
              alignItems="center" 
              width="100%"
              justifyContent="center"
            >
              <Box 
                display="flex" 
                alignItems="center" 
                mb={isMobile ? 1 : 0}
              >
                <Avatar 
                  src={user.photoURL || undefined} 
                  alt={user.displayName || user.email}
                  sx={{ mr: 1 }}
                >
                  {user.displayName ? user.displayName[0] : user.email[0]}
                </Avatar>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  sx={{ 
                    maxWidth: isMobile ? "180px" : "auto",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {user.displayName || user.email}
                </Typography>
              </Box>
              
              <Button 
                onClick={logout} 
                variant="outlined" 
                color="secondary" 
                size={isMobile ? "small" : "medium"}
                startIcon={<LogoutIcon />} 
                sx={{ 
                  ml: isMobile ? 0 : 2,
                  mt: isMobile ? 1 : 0
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: isMobile ? 2 : 4 }} />

          <Grid container spacing={isMobile ? 2 : 3}>
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
                      p: isMobile ? 2 : 3
                    }}
                  >
                    <Box 
                      sx={{ 
                        backgroundColor: tile.color, 
                        borderRadius: "50%", 
                        width: isMobile ? 60 : 80, 
                        height: isMobile ? 60 : 80, 
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "center",
                        color: "white",
                        mb: 2
                      }}
                    >
                      {tile.icon}
                    </Box>
                    <CardContent sx={{ textAlign: "center", p: isMobile ? 0 : 1, width: "100%" }}>
                      <Typography variant={isMobile ? "h6" : "h5"} component="h2" gutterBottom>
                        {tile.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          display: "-webkit-box",
                          overflow: "hidden",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2
                        }}
                      >
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
              p: isMobile ? 3 : 4, 
              width: "100%", 
              maxWidth: isMobile ? 340 : 400,
              borderRadius: 2,
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
                Admin Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your credentials to access the dashboard
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
                size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
              />
              <Button 
                onClick={login} 
                variant="contained" 
                fullWidth 
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: isMobile ? 1 : 1.5,
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0"
                  }
                }}
              >
                Login
              </Button>
              <Divider sx={{ my: 2 }}>
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
                  py: isMobile ? 1 : 1.5,
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