import React from "react";
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
};

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

  const handleClearCart = async () => {
    // Logic for clearing the cart
    console.log("Clear cart action triggered");
  };

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
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>Your Cart</Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        You are logged in as <strong>{authData.email_address}</strong>.
        {cartData?.length > 0 ? (
          <> View your cart below or <InlineLink path="/checkout" anchor="check out now" />.</>
        ) : null}
      </Typography>
      
      {removalResult ? renderRemovalMessage() : null}

      {cartData?.length > 0 ? (
        <>
          <Box sx={{ marginBottom: 3 }}>
            {renderOrderItems(cartData, true)}
          </Box>

          <Divider sx={{ marginBottom: 2 }} />

          {/* Clear Cart Button */}
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={handleClearCart}
            sx={{
              marginRight: 2,
              borderRadius: 1,
              textTransform: 'none',
            }}
          >
            Clear Cart
          </Button>

          {/* Go to Checkout Button */}
          <Link to="/checkout" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                borderRadius: 1,
                padding: '8px 20px',
                textTransform: 'none',
                backgroundColor: "#FFA500",
                color: "#000",
                "&:hover": {
                  backgroundColor: "#FFAf00",
                },
              }}
            >
              Go to Checkout
            </Button>
          </Link>
        </>
      ) : (
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Your cart is empty. <InlineLink path="/products" anchor="Start shopping now" />.
        </Typography>
      )}
    </Box>
  );
}
