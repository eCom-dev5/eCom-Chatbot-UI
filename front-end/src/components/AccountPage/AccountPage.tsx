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
            onClick= {() => navigate("/")} // Navigate to home on click
            sx={{
              backgroundColor: "#FFA500", // Your custom color
              color: "#000", // Text color
              "&:hover": {
                backgroundColor: "#FFAf00", // Hover color
              },
            }}
          >
            Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
