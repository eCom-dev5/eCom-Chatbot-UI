import React from "react";
import { useRouteLoaderData, useNavigate } from "react-router-dom";
import { AuthData } from "../../features/auth/authData";
import InlineErrorPage from "../InlineErrorPage/InlineErrorPage";
import InlineLink from "../InlineLink/InlineLink";
import { OrdersHistory } from "../../features/orders/OrdersHistory";
import { Box, Typography, Paper, Divider, Button } from "@mui/material";

export default function AccountPage() {
  const authData = useRouteLoaderData("app") as AuthData;
  const navigate = useNavigate();

  if (!authData.logged_in) {
    return <InlineErrorPage pageName="Your account" type="login_required" />;
  }

  // Log out handler
  async function handleClickLogOut() {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/auth/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Include cookies in the request
        }
      );
      if (!res.ok) {
        throw new Error(`Logout failed with status ${res.status}`);
      }
      // Navigate to login or home page after logout
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <Box sx={{ padding: "2rem", bgcolor: "#ffffff", minHeight: "100vh" }}>
      <Paper
        elevation={3}
        sx={{ padding: "2rem", borderRadius: "12px", maxWidth: "800px", margin: "0 auto" }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Your Account
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: "1.5rem" }}>
          You are logged in as <strong>{authData.email_address}</strong>.
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: "2rem" }}>
          View your previous orders below or{" "}
          <InlineLink path="/cart" anchor="visit your cart" />.
        </Typography>
        <Divider sx={{ marginBottom: "2rem" }} />
        <Typography variant="h5" component="h2" gutterBottom>
          Your Orders
        </Typography>
        <OrdersHistory />
        <Box sx={{ marginTop: "2rem", textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={handleClickLogOut} // Attach logout handler
            sx={{
              backgroundColor: "#FFA500", // Your custom color
              color: "#000", // Text color
              "&:hover": {
                backgroundColor: "#FFAf00", // Hover color
              },
            }}
          >
            Log Out
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
