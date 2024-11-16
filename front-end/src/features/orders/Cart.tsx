import React from 'react';
import { Link, useActionData, useLoaderData, useRouteLoaderData } from "react-router-dom";
import { AuthData } from "../auth/authData";
import { OrderItemData } from "./orderItemData";
import { RemoveCartItemActionData } from "./OrderItem";
import InlineErrorPage from "../../components/InlineErrorPage/InlineErrorPage";
import InlineLink from "../../components/InlineLink/InlineLink";
import { getProductDetailPath } from "../products/utils";
import { renderOrderItems } from "./utils";
import { Button, Box, Typography, Paper, Grid, Divider } from "@mui/material";
import utilStyles from "../../App/utilStyles.module.css";

export type CartLoaderData = {
  cartData: OrderItemData[],
  cartLoaderErrMsg?: string
}

export async function cartLoader() {
  let cartData: OrderItemData[] = [];
  try {
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cart`, { credentials: "include" });
    if (res.ok) {
      cartData = await res.json();
      return { cartData };
    }
    throw new Error("Unexpected status code.");
  } catch (error) {
    return { cartData, cartLoaderErrMsg: "Sorry, your cart could not be loaded. Please try again later." };
  }
}

export function Cart() {
  const authData = useRouteLoaderData("app") as AuthData;
  const { cartData, cartLoaderErrMsg } = useLoaderData() as CartLoaderData;
  const removalResult = useActionData() as RemoveCartItemActionData | undefined;

  if (!authData.logged_in) {
    return <InlineErrorPage pageName="Cart" type="login_required" loginRedirect="/cart" />;
  } else if (cartLoaderErrMsg) {
    return <InlineErrorPage pageName="Cart" message={cartLoaderErrMsg} />;
  }

  function renderRemovalMessage() {
    if (!removalResult) {
      return null;
    }
    const { error, productId, productName } = removalResult;

    let message: string | React.JSX.Element;
    if (error) {
      message = `Sorry, '${productName}' couldn't be removed from your cart.`;
    } else {
      const productPath = getProductDetailPath(productId, productName);
      message = <><InlineLink path={productPath} anchor={productName} /> was removed from your cart.</>;
    }
    return <Typography variant="body1" color="error" sx={{ fontWeight: 'bold' }}>{message}</Typography>;
  }

  return (
    <Box className={utilStyles.pagePadding} sx={{ paddingTop: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Cart</Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        You are logged in as {authData.email_address}.
        {cartData?.length > 0 ?
          <> View your cart below or <InlineLink path="/checkout" anchor="check out" />.</>
          : null}
      </Typography>
      
      {removalResult ? renderRemovalMessage() : null}

      {cartData?.length > 0 ?
        <>
          <Box sx={{ marginBottom: 3 }}>
            {renderOrderItems(cartData, true)}
          </Box>

          <Divider sx={{ marginBottom: 2 }} />

          <Link to="/checkout" style={{ textDecoration: 'none' }}>
          <Button
          variant="contained"
          color="primary"
          size="large" // Keeps the button size small
          sx={{
          borderRadius: 1, // Slightly more rounded for a softer appearance
          padding: '4px 12px', // Reduced padding to make the button smaller
          textTransform: 'none', // Prevents text from being uppercased
          marginTop: 2, // Optional: Adds some space above the button
          }}
          >
            Go to checkout
          </Button>
          </Link>
        </>
        : <Typography variant="body1">Your cart is empty.</Typography>
      }
    </Box>
  );
}
