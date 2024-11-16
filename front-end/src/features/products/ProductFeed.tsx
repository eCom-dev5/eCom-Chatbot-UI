import React, { useState, useEffect } from "react";
import { redirect, useLoaderData, useRouteLoaderData } from "react-router-dom";
import { ProductData } from "./productData";
import InlineErrorPage from "../../components/InlineErrorPage/InlineErrorPage";
import ProductFeedItem from "./ProductFeedItem";
import { Box, Typography, Grid, CircularProgress, Paper } from "@mui/material";
import './ProductFeed.module.css'; // Import the CSS file

// Add paths to all available video files
const videoPaths = [
  "/assets/video1.mp4",
  "/assets/video2.mp4",
  "/assets/video3.mp4",
];

type ProductFeedProps = {
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

type AuthData = {
  id: string;
  logged_in: boolean;
};

export async function fetchCategoryData(categorySlug: string) {
  const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/categories`);
  if (!res.ok) throw new Error("Unsuccessful categories fetch.");
  const categories: CategoryData[] = await res.json();
  const filteredCategories = categories.filter((c) => c.url_slug === categorySlug);
  if (!filteredCategories.length) throw new Response("Not Found", { status: 404 });
  return filteredCategories[0];
}

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
      categoryData = await fetchCategoryData(params.categorySlug);
      productsFetchURL += `?category_id=${categoryData.id}`;
    } else if (url.pathname.includes("search")) {
      searchTerm = url.searchParams.get("q");
      if (!searchTerm) return redirect("/");
      productsFetchURL += `?search_term=${searchTerm}`;
    }

    const res = await fetch(productsFetchURL);
    if (!res.ok) throw new Error("Unsuccessful products fetch.");
    productsData = await res.json();
  } catch (error) {
    if (error.status === 404) throw error;
    errMsg = "Sorry, products could not be loaded.";
  }

  return { productsData, categoryData, searchTerm, errMsg };
}

export function ProductFeed({ isSearchResults }: ProductFeedProps) {
  const { categoryData, productsData, searchTerm, errMsg } = useLoaderData() as LoaderData;
  const [clickedProducts, setClickedProducts] = useState<string[]>([]);
  const authData = useRouteLoaderData("app") as AuthData;
  const userId = authData?.id;

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    // Set an interval to change the video every 10 seconds (adjust as needed)
    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoPaths.length);
    }, 10000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  if (errMsg) return <InlineErrorPage pageName="Error" message={errMsg} />;

  const handleProductClick = async (productId: string) => {
    if (!clickedProducts.includes(productId)) setClickedProducts([...clickedProducts, productId]);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user-click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, clicked_product: productId }),
      });
      if (!res.ok) throw new Error(`Error! Status: ${res.status}`);
    } catch (error) {
      console.error("Failed to send clicked product:", error);
    }
  };

  const getDescriptionText = () => {
    if (isSearchResults) {
      const count = productsData.length;
      return `${count} ${count === 1 ? "result" : "results"} for "${searchTerm}".`;
    }
    if (categoryData) return categoryData.description;
    return "";
  };

  const renderFeedItems = () => {
    if (!productsData.length)
      return <Typography variant="body2">Sorry, no products were found.</Typography>;

    return (
      <Grid container spacing={2} className="productGrid">
        {productsData.map((product) => (
          <Grid item xs={12} sm={6} md={3} key={product.parent_asin}>
            <Box
              onClick={() => handleProductClick(product.parent_asin)}
              sx={{
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <ProductFeedItem productData={product} userId={userId} />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        padding: "2rem",
        maxWidth: "1100px",
        margin: "0 auto",
        bgcolor: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}
      >
        {/* Render the current video */}
        <Box sx={{ width: "100%", overflow: "hidden", textAlign: "center", borderRadius: "8px" }}>
          <video 
            src={videoPaths[currentVideoIndex]}
            autoPlay 
            loop 
            muted 
            style={{
              width: "100%",
              height: "300px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          >
            Your browser does not support the video tag.
          </video>
        </Box>
      </Paper>
      {productsData.length ? renderFeedItems() : <CircularProgress />}
    </Box>
  );
}
