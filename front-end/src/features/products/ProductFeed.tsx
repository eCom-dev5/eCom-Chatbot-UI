import React, { useState } from "react";
import { redirect, useLoaderData, useRouteLoaderData } from "react-router-dom";

import { ProductData } from "./productData";
import InlineErrorPage from "../../components/InlineErrorPage/InlineErrorPage";
import ProductFeedItem from "./ProductFeedItem";

import utilStyles from "../../App/utilStyles.module.css";
import styles from "./ProductFeed.module.css";

type ProductFeedProps = {
  /** Whether the feed is generated using a search term in the URL path */
  isSearchResults?: boolean;
};

type CategoryData = {
  id: number;
  name: string;
  description: string;
  url_slug: string;
};

type LoaderData = {
  categoryData: CategoryData | null;
  productsData: ProductData[];
  searchTerm: string | null;
  errMsg: string | null;
};

// NEW: Define the type for authData to include the userId property
type AuthData = {
  id: string; // Assuming the user ID is a string, adjust accordingly if it's a number
  logged_in: boolean;
};

// Helper function to fetch category data based on URL slug
export async function fetchCategoryData(categorySlug: string) {
  const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/categories`);
  if (!res.ok) {
    throw new Error("Unsuccessful categories fetch.");
  }
  const categories: CategoryData[] = await res.json();
  const filteredCategories = categories.filter((c) => c.url_slug === categorySlug);
  if (filteredCategories.length === 0) {
    throw new Response("Not Found", { status: 404 });
  }
  return filteredCategories[0];
}

// Loader function to fetch product feed data
export async function productFeedLoader({ params, request }) {
  let { categoryData, productsData, searchTerm, errMsg } = {
    categoryData: null,
    productsData: [],
    searchTerm: null,
    errMsg: null,
  } as LoaderData;

  try {
    let productsFetchURL = `${process.env.REACT_APP_API_BASE_URL}/products`;
    const url = new URL(request.url);

    if (params.categorySlug) {
      // Fetch category data
      categoryData = await fetchCategoryData(params.categorySlug);
      productsFetchURL += `?category_id=${categoryData.id}`;
    } else if (url.pathname.includes("search")) {
      searchTerm = url.searchParams.get("q");
      if (!searchTerm) {
        return redirect("/");
      }
      productsFetchURL += `?search_term=${searchTerm}`;
    }

    // Fetch product listings data
    const res = await fetch(productsFetchURL);
    if (!res.ok) {
      throw new Error("Unsuccessful products fetch.");
    }
    productsData = await res.json();
  } catch (error) {
    if (error.status === 404) {
      throw error; // Serve 404 error page
    }
    errMsg = "Sorry, products could not be loaded.";
  }

  return { productsData, categoryData, searchTerm, errMsg };
}

export function ProductFeed({ isSearchResults }: ProductFeedProps) {
  const { categoryData, productsData, searchTerm, errMsg } = useLoaderData() as LoaderData;

  // NEW: State for tracking clicked products in the session
  const [clickedProducts, setClickedProducts] = useState<string[]>([]);

  // Updated: Define the type for `authData` so TypeScript knows the structure
  const authData = useRouteLoaderData("app") as AuthData;
  const userId = authData?.id; // No TypeScript error since `authData` has an explicit type

  if (errMsg) {
    return <InlineErrorPage pageName="Error" message={errMsg} />;
  }

  function getHeadingText() {
    if (isSearchResults) {
      return "Search Results";
    } else if (categoryData) {
      return categoryData.name;
    } else {
      return "Random Picks";
    }
  }

  function getDescriptionText() {
    if (isSearchResults) {
      const productCount = productsData.length;
      const resultText = productCount !== 1 ? "results" : "result";
      return `${productCount} ${resultText} for "${searchTerm}".`;
    } else if (categoryData) {
      return categoryData.description;
    } else {
      return "";
    }
  }

  // Function to handle product click and update the state
  const handleProductClick = (productId: string) => {
    if (!clickedProducts.includes(productId)) {
      // Add the product to clickedProducts if it is not already present (to avoid duplicates)
      const updatedClickedProducts = [...clickedProducts, productId];
      setClickedProducts(updatedClickedProducts);
    }

    // Send only the clicked product and user ID to the backend
    sendClickedProductToBackend(productId);
  };

  // Function to send a single clicked product to the backend
  const sendClickedProductToBackend = async (productId: string) => {
    try {
      console.log("Clicked product:", productId);
  
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user-click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId, // Make sure userId is defined
          clicked_product: productId, // Send single product ID
        }),
      });
  
      if (!res.ok) {
        throw new Error(`Error! Status: ${res.status}`);
      }
  
      console.log("User click data logged successfully.");
    } catch (error) {
      console.error("Failed to send clicked product to backend:", error);
    }
  };
  

  // Render feed items and add onClick handler for tracking
  function renderFeedItems() {
    if (productsData.length === 0) {
      return <p className={utilStyles.emptyFeedMessage}>Sorry, no products were found.</p>;
    }
    // Pass `userId` to `ProductFeedItem` and handle click tracking
    const feedItems = productsData.map((product) => (
      <div key={product.parent_asin} onClick={() => handleProductClick(product.parent_asin)}>
        <ProductFeedItem productData={product} userId={userId} />
      </div>
    ));
    return <div className={styles.productGrid}>{feedItems}</div>;
  }

  return (
    <div className={utilStyles.pagePadding}>
      <div className={utilStyles.mb4rem}>
        <h1 className={utilStyles.h1}>{getHeadingText()}</h1>
        <p>{getDescriptionText()}</p>
      </div>
      {renderFeedItems()}
    </div>
  );
}
