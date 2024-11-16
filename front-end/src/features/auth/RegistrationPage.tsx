import React from "react";
import { Form, redirect, useActionData, useRouteLoaderData } from "react-router-dom";
import { TextField, Button, Typography, Divider, Box, Alert, Paper, Stack } from "@mui/material";
import { AuthData } from "./authData";
import InlineLink from "../../components/InlineLink/InlineLink";
import GoogleAuthButton from "./GoogleAuthButton";

export async function registerAction({ request }: { request: Request }) {
  let formData = await request.formData();
  try {
    const email_address = formData.get("email_address");
    const password = formData.get("password");
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email_address, password })
      }
    );

    if (res.ok) {
      return redirect("/account");
    } else if (res.status === 400) {
      return "Sorry, someone is already registered with this email address.";
    }
    throw new Error("Unexpected status code.");
  } catch (error) {
    return "Sorry, registration failed. Please try again later.";
  }
}

export function RegistrationPage() {
  const authData = useRouteLoaderData("app") as AuthData;
  const registrationError = useActionData() as string | undefined;

  const loginLink = <InlineLink path="/login" anchor="log in" />;
  const loggedOutContent = (
    <>Create an account or alternatively sign in with Google. 
    If you already have an account, please {loginLink} instead.</>
  );
  const loggedInContent = <>You are already logged in as {authData.email_address}.</>;

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#f9f9f9" }}>
      <Paper elevation={3} sx={{ maxWidth: "500px", width: "100%", padding: "2rem", borderRadius: "12px" }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Create Your Account
        </Typography>
        <Typography variant="body1" textAlign="center" color="textSecondary" gutterBottom>
          {authData.logged_in ? loggedInContent : loggedOutContent}
        </Typography>
        <Divider sx={{ marginY: "1.5rem" }} />
        <Form method="post">
          <Stack spacing={3}>
            <TextField
              id="email_address"
              label="Email Address"
              name="email_address"
              type="email"
              required
              fullWidth
              variant="outlined"
            />
            <TextField
              id="password"
              label="Password"
              name="password"
              type="password"
              required
              fullWidth
              variant="outlined"
              inputProps={{ minLength: 8, maxLength: 25 }}
              helperText="Password must be between 8-25 characters."
            />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
              Register
            </Button>
          </Stack>
        </Form>
        {registrationError && (
          <Alert severity="error" sx={{ marginTop: "1rem" }}>
            {registrationError}
          </Alert>
        )}
        <Divider sx={{ marginY: "2rem" }} />
        <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
          <GoogleAuthButton />
        </Box>
      </Paper>
    </Box>
  );
}
