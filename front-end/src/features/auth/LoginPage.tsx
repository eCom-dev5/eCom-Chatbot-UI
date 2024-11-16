import React from "react";
import { Form, redirect, useActionData, useRouteLoaderData, useSearchParams } from "react-router-dom";
import { TextField, Button, Typography, Divider, Box, Alert, Paper, Stack } from "@mui/material";
import { AuthData } from "./authData";
import InlineLink from "../../components/InlineLink/InlineLink";
import GoogleAuthButton from "./GoogleAuthButton";

export async function loginAction({ request }: { request: Request }) {
  let formData = await request.formData();
  try {
    const username = formData.get("email_address");
    const password = formData.get("password");
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
      }
    );

    if (res.ok) {
      let redirectPath = new URL(request.url).searchParams.get("redirect") || "/account";
      if (redirectPath.charAt(0) !== "/") {
        redirectPath = `/${redirectPath}`;
      }
      return redirect(redirectPath);
    } else if (res.status === 401) {
      return "Login failed. The username or password is incorrect.";
    }
    throw new Error("Unexpected status code.");
  } catch (error) {
    return "Sorry, login failed. Please try again later.";
  }
}

export function LoginPage() {
  const authData = useRouteLoaderData("app") as AuthData;
  const loginError = useActionData() as string | undefined;
  const [searchParams] = useSearchParams();
  const isGoogleError = searchParams.get("googleAuthError");

  const registerLink = <InlineLink path="/register" anchor="register" />;
  const loggedOutContent = <>If you haven't created an account, please {registerLink} first or sign in with Google below.</>;
  const loggedInContent = <>You are already logged in as {authData.email_address}.</>;
  const googleError = <>Sorry, Google sign in failed. Please try again later or {registerLink} instead.</>;

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#f9f9f9" }}>
      <Paper elevation={3} sx={{ maxWidth: "500px", width: "100%", padding: "2rem", borderRadius: "12px" }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Log in
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
            />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
              Log in
            </Button>
          </Stack>
        </Form>
        {loginError && (
          <Alert severity="error" sx={{ marginTop: "1rem" }}>
            {loginError}
          </Alert>
        )}
        <Divider sx={{ marginY: "2rem" }} />
        <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
          <GoogleAuthButton />
          {isGoogleError && (
            <Alert severity="error" sx={{ marginTop: "1rem" }}>
              {googleError}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
