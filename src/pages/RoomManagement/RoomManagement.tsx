import * as React from "react";
import { useState, useEffect } from "react";
import { db } from "../../config/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

// Component imports
import RoomList from "./components/RoomList";
import AddRoomDialog from "./components/AddRoomDialog";
import EditRoomDialog from "./components/EditRoomDialog";
import DeleteConfirmationDialog from "./components/DeleteConfirmationDialog";
import PricingSettingsCard from "./components/PricingSettingsCard";
import AlertMessage from "./components/AlertMessage";
import { enqueueSnackbar } from "notistack";

// Interfaces
interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  price_extra: number;
  image: string;
  isActive: boolean;
  displayOrder: number;
  capacity: number;
  amenities: string[];
  lastUpdated: number;
}

interface PricingSettings {
  lunchPrice: number;
  dinnerPrice: number;
  discountRate: number;
  lastUpdated: number;
}

// Default values
const defaultFormData = {
  title: "",
  description: "",
  price: 0,
  price_extra: 0,
  image: "",
  isActive: true,
  capacity: 2,
  amenities: ["Breakfast"],
  displayOrder: 0,
};

const defaultPricingSettings = {
  lunchPrice: 15,
  dinnerPrice: 25,
  discountRate: 10,
  lastUpdated: Date.now(),
};

function RoomManagement() {
  // Theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Auth state
  const [loading, setLoading] = useState(true);

  // Data state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
    ...defaultPricingSettings,
  });
  const [tempPricingSettings, setTempPricingSettings] =
    useState<PricingSettings>({ ...defaultPricingSettings });

  // UI state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [error, setError] = useState("");

  // Auth observer
  useEffect(() => {
    fetchRooms();
    fetchPricingSettings();
  }, []);

  // Data fetching functions
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "rooms"));
      const roomsList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          isActive: data.isActive !== undefined ? data.isActive : true,
        } as Room;
      });

      roomsList.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setRooms(roomsList);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingSettings = async () => {
    try {
      const pricingDoc = await getDoc(doc(db, "settings", "pricing"));

      if (pricingDoc.exists()) {
        const data = pricingDoc.data() as PricingSettings;
        setPricingSettings(data);
        setTempPricingSettings(data);
      } else {
        await setDoc(doc(db, "settings", "pricing"), defaultPricingSettings);
        setPricingSettings(defaultPricingSettings);
        setTempPricingSettings(defaultPricingSettings);
      }
    } catch (err) {
      console.error("Error fetching pricing settings:", err);
      setError("Failed to load pricing settings. Please try again.");
    }
  };

  // Room CRUD operations
  const handleAddRoom = async () => {
    try {
      if (!formData.title || !formData.description || formData.price <= 0) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      let displayOrder = formData.displayOrder;
      if (displayOrder === 0 && rooms.length > 0) {
        displayOrder = Math.max(...rooms.map((r) => r.displayOrder || 0)) + 1;
      }

      await addDoc(collection(db, "rooms"), {
        ...formData,
        displayOrder,
        lastUpdated: Date.now(),
      });

      showToast("Room added successfully!", "success");
      setIsAddDialogOpen(false);
      resetForm();
      fetchRooms();
    } catch (err) {
      console.error("Error adding room:", err);
      showToast("Failed to add room. Please try again.", "error");
    }
  };

  const handleUpdateRoom = async () => {
    if (!roomToEdit) return;

    try {
      if (!formData.title || !formData.description || formData.price <= 0) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      await updateDoc(doc(db, "rooms", roomToEdit.id), {
        ...formData,
        lastUpdated: Date.now(),
      });

      showToast("Room updated successfully!", "success");
      setIsEditDialogOpen(false);
      fetchRooms();
    } catch (err) {
      console.error("Error updating room:", err);
      showToast("Failed to update room. Please try again.", "error");
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteDoc(doc(db, "rooms", roomId));
      showToast("Room deleted successfully!", "success");
      setIsDeleteDialogOpen(false);
      fetchRooms();
    } catch (err) {
      console.error("Error deleting room:", err);
      showToast("Failed to delete room. Please try again.", "error");
    }
  };

  const toggleRoomStatus = async (room: Room) => {
    try {
      await updateDoc(doc(db, "rooms", room.id), {
        isActive: !room.isActive,
        lastUpdated: Date.now(),
      });
      showToast(
        `Room ${room.isActive ? "disabled" : "enabled"} successfully!`,
        "success"
      );
      fetchRooms();
    } catch (err) {
      console.error("Error toggling room status:", err);
      showToast("Failed to update room status. Please try again.", "error");
    }
  };

  const moveRoom = async (roomIndex: number, direction: "up" | "down") => {
    if (
      (direction === "up" && roomIndex === 0) ||
      (direction === "down" && roomIndex === rooms.length - 1)
    ) {
      return;
    }

    const newRooms = [...rooms];
    const currentRoom = newRooms[roomIndex];
    const targetIndex = direction === "up" ? roomIndex - 1 : roomIndex + 1;
    const targetRoom = newRooms[targetIndex];

    try {
      // Swap display orders in Firestore
      await updateDoc(doc(db, "rooms", currentRoom.id), {
        displayOrder: targetRoom.displayOrder,
        lastUpdated: Date.now(),
      });

      await updateDoc(doc(db, "rooms", targetRoom.id), {
        displayOrder: currentRoom.displayOrder,
        lastUpdated: Date.now(),
      });

      // Update local state
      const temp = currentRoom.displayOrder;
      currentRoom.displayOrder = targetRoom.displayOrder;
      targetRoom.displayOrder = temp;

      [newRooms[roomIndex], newRooms[targetIndex]] = [
        newRooms[targetIndex],
        newRooms[roomIndex],
      ];

      setRooms(newRooms);
      showToast("Room order updated!", "success");
    } catch (err) {
      console.error("Error updating room order:", err);
      showToast("Failed to update room order. Please try again.", "error");
    }
  };

  // Pricing settings operations
  const savePricingSettings = async () => {
    try {
      const updatedSettings = {
        ...tempPricingSettings,
        lastUpdated: Date.now(),
      };

      await setDoc(doc(db, "settings", "pricing"), updatedSettings);
      setPricingSettings(updatedSettings);
      setIsEditingPricing(false);
      showToast("Pricing settings updated successfully!", "success");
    } catch (err) {
      console.error("Error updating pricing settings:", err);
      showToast(
        "Failed to update pricing settings. Please try again.",
        "error"
      );
    }
  };

  // Helper functions
  const handleEditRoom = (room: Room) => {
    setRoomToEdit(room);
    setFormData({
      title: room.title || "",
      description: room.description || "",
      price: room.price || 0,
      price_extra: room.price_extra || 0,
      image: room.image || "",
      isActive: room.isActive !== undefined ? room.isActive : true,
      capacity: room.capacity || 2,
      amenities: room.amenities || [],
      displayOrder: room.displayOrder || 0,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ ...defaultFormData });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" ||
        name === "price_extra" ||
        name === "capacity" ||
        name === "displayOrder"
          ? parseFloat(value)
          : value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleAmenitiesChange = (amenities: string[]) => {
    setFormData({
      ...formData,
      amenities,
    });
  };

  const handlePricingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempPricingSettings({
      ...tempPricingSettings,
      [name]: parseFloat(value),
    });
  };

  const cancelEditPricing = () => {
    setTempPricingSettings(pricingSettings);
    setIsEditingPricing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Toast function using Snackbar
  const showToast = (
    message: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    enqueueSnackbar(message, { variant });
  };

  return (
    <Container 
      maxWidth={false} 
      disableGutters={isMobile}
      sx={{
        px: isMobile ? 1 : 2, 
        width: "100%"
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "flex-start" : "center"}
        gap={isMobile ? 1 : 0}
        mb={2}
        mt={1}
      >
        <Typography variant={isMobile ? "h5" : "h4"}>Room Management</Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth={isMobile}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{ mt: isMobile ? 1 : 0 }}
        >
          Add New Room
        </Button>
      </Box>

      {/* Alerts */}
      <AlertMessage message={error} type="error" />

      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Pricing Settings */}
      <PricingSettingsCard
        pricingSettings={pricingSettings}
        tempPricingSettings={tempPricingSettings}
        isEditingPricing={isEditingPricing}
        formatCurrency={formatCurrency}
        onSave={savePricingSettings}
        onCancel={cancelEditPricing}
        onEdit={() => setIsEditingPricing(true)}
        onChange={handlePricingInputChange}
      />

      {/* Room List */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: isMobile ? 1 : 2, 
          mb: 3,
          borderRadius: isMobile ? 1 : 2
        }}
      >
        <Typography variant="h5" mb={isMobile ? 1 : 2}>
          Room Listings ({rooms.length})
        </Typography>

        <RoomList
          rooms={rooms}
          loading={loading}
          formatCurrency={formatCurrency}
          onEdit={handleEditRoom}
          onToggleStatus={toggleRoomStatus}
          onMove={moveRoom}
          onDelete={(room) => {
            setRoomToEdit(room);
            setIsDeleteDialogOpen(true);
          }}
        />
      </Paper>

      {/* Dialogs */}
      <AddRoomDialog
        open={isAddDialogOpen}
        formData={formData}
        onClose={() => {
          setIsAddDialogOpen(false);
          resetForm();
        }}
        onInputChange={handleInputChange}
        onCheckboxChange={handleCheckboxChange}
        onAmenitiesChange={handleAmenitiesChange}
        onSubmit={handleAddRoom}
      />

      <EditRoomDialog
        open={isEditDialogOpen}
        formData={formData}
        onClose={() => {
          setIsEditDialogOpen(false);
          resetForm();
        }}
        onInputChange={handleInputChange}
        onCheckboxChange={handleCheckboxChange}
        onAmenitiesChange={handleAmenitiesChange}
        onSubmit={handleUpdateRoom}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        room={roomToEdit}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={() => {
          if (roomToEdit) {
            handleDeleteRoom(roomToEdit.id);
          }
        }}
      />
    </Container>
  );
}

export default RoomManagement;