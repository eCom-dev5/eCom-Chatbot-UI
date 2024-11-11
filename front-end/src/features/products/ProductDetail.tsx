// Import necessary modules and dependencies
import React, { useState, useEffect } from "react";
import { Form, Link, redirect, useActionData, useLoaderData, useRouteLoaderData } from "react-router-dom";
import ChatbotWidget from "../../components/ChatbotWidget/ChatbotWidget";
import { AuthData } from "../auth/authData";
import { ProductData } from "./productData";
import InlineErrorPage from "../../components/InlineErrorPage/InlineErrorPage";
import InlineLink from "../../components/InlineLink/InlineLink";
import StarRating from "../../components/StarRating/StarRating";
import { getProductDetailPath } from "./utils";
import utilStyles from "../../App/utilStyles.module.css";
import styles from "./ProductDetail.module.css";

// Type definition for Loader Data
type LoaderData = {
  productData: ProductData,
  errMsg: string | null
}

// Action to add a product to the cart
export async function addToCartAction({ params }) {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/cart/items/${params.id}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (res.ok) {
      const cartLink = <InlineLink path="/cart" anchor="cart" />
      return <>This item has been added to your {cartLink}.</>;
    } else if (res.status === 400) {
      const errorMessage = await res.text();
      return errorMessage;
    }
    throw new Error("Unexpected status code.");
  } catch (error) {
    return "Sorry, this item couldn't be added to your cart.";
  }
}

// Loader function to fetch product details
export async function productDetailLoader({ params }) {
  let { productData, errMsg } = { productData: {}, errMsg: null } as LoaderData;

  try {
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/products/${params.id}`);

    if (res.status === 404) {
      throw new Response("Not Found", { status: 404 });
    } else if (!res.ok) {
      throw new Error("Unsuccessful product fetch.");
    }

    productData = await res.json();

    // Redirect to the canonical path if necessary
    const currentPath = `/products/${params.id}/${params.productNameSlug}`;
    const canonicalPath = getProductDetailPath(productData.parent_asin, productData.title);
    if (currentPath !== canonicalPath) {
      return redirect(canonicalPath);
    }

  } catch (error) {
    if (error.status === 404) {
      throw error;
    }
    errMsg = "Sorry, this product could not be loaded.";
  }

  return { productData, errMsg };
}

export function ProductDetail() {
  const { productData, errMsg } = useLoaderData() as LoaderData;
  const authData = useRouteLoaderData("app") as AuthData;
  const addToCartMessage = useActionData() as string | undefined;

  // State to store unique clicked products by the user
  const [clickedProducts, setClickedProducts] = useState<string[]>([]);

  // Function to handle product click and log interaction
  const handleProductClick = (productId: string) => {
    // Ensure the product is added only once to avoid duplicates
    if (!clickedProducts.includes(productId)) {
      const updatedClickedProducts = [...clickedProducts, productId];
      setClickedProducts(updatedClickedProducts);

      // Send updated clicked products to the backend
      sendClickedProductsToBackend(updatedClickedProducts);
    }
  };

  // Function to send clicked products to the backend API endpoint
// Function to send clicked products to the backend
const sendClickedProductsToBackend = async (clickedProductsArray: string[]) => {
  try {
    console.log("clicked products testing", clickedProductsArray);
    
    // Send the array of clicked products to the backend API endpoint
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user-click`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: authData.id, // Assuming `authData` contains the user ID
        clicked_products: clickedProductsArray,
      }),
    });

    if (!res.ok) {
      throw new Error(`Error! Status: ${res.status}`);
    }

    console.log('User click data logged successfully.');

  } catch (error) {
    console.error("Failed to send clicked products to backend:", error);
  }
};


  // Render error page if product fails to load
  if (errMsg) {
    return <InlineErrorPage pageName="Error" message={errMsg} />;
  }

  const { features, description, average_rating, rating_number, price, thumb, parent_asin } = productData;

  function renderButton() {
    const buttonStyles = `${utilStyles.button} ${styles.button}`;
    if (authData.logged_in) {
      return (
        <Form method="post">
          <button type="submit" className={buttonStyles}>Add to cart</button>
        </Form>
      );
    } else {
      const currentPath = getProductDetailPath(productData.parent_asin, productData.title);
      const linkPath = `/login?redirect=${currentPath}`;
      return <Link to={linkPath} className={buttonStyles}>Log in to buy</Link>;
    }
  }

  // Main product detail render
  return (
    <div className={utilStyles.pagePadding} onClick={() => handleProductClick(parent_asin)}>
      <section className={styles.summarySection}>
        <div className={styles.imageContainer}>
          <img
            src={thumb}
            alt={productData.title}
            height="500"
            width="500"
            className={styles.image}></img>
        </div>
        <div className={styles.summaryTextContent}>
          <h1 className={styles.productName}>{productData.title}</h1>
          <p className={styles.price}>{price}</p>
          <hr />
          <p>{description}</p>
          <hr />
          {renderButton()}
          {addToCartMessage ? <p className={styles.buttonMessage}>{addToCartMessage}</p> : null}
          {average_rating ?
          <div>
            <StarRating rating={average_rating} />
            <div className={styles.ratingText}>Rated {average_rating}/5.00 based on {rating_number} ratings</div>
          </div>
          : null}
        </div>
      </section>
      <section className={styles.descriptionSection}>
        <h2>Description</h2>
        <p className={utilStyles.XLText}>{features}</p>
        <p>{description}</p>
      </section>
      {/* Chatbot Widget Integration */}
      {authData?.id && (
        <ChatbotWidget userId={String(authData.id)} parentAsin={parent_asin} />
      )}

    </div>
  );
}
