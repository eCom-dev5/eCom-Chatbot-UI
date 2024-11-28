import React, { useState, useEffect, useMemo } from "react";
import { redirect, useLoaderData, useRouteLoaderData } from "react-router-dom";
import { ProductData } from "./productData";
import InlineErrorPage from "../../components/InlineErrorPage/InlineErrorPage";
import ProductFeedItem from "./ProductFeedItem";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  Pagination,
} from "@mui/material";
import "./ProductFeed.module.css";

const gifPaths = [
  "/assets/page1.gif",
  "/assets/page2.gif",
  "/assets/page3.gif",
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

// Fetch category data based on slug
export async function fetchCategoryData(categorySlug: string) {
  const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/categories`);
  if (!res.ok) throw new Error("Unsuccessful categories fetch.");
  const categories: CategoryData[] = await res.json();
  console.log(categories);
  const filteredCategories = categories.filter((c) => c.url_slug === categorySlug);
  if (!filteredCategories.length) throw new Response("Not Found", { status: 404 });
  return filteredCategories[0];
}

// Loader function for the product feed
export async function productFeedLoader({ params, request }: any) {
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
  } catch (error: any) {
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

  const itemsPerPage = 16; // Products per page
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(productsData.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return productsData.slice(startIndex, startIndex + itemsPerPage);
  }, [productsData, currentPage]);

  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const [gifError, setGifError] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGifIndex((prevIndex) => (prevIndex + 1) % gifPaths.length);
      setGifError(false); // Reset error state when switching GIF
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleGifError = () => setGifError(true);

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
      return `${count} ${count === 1 ? "result" : "results"} for \"${searchTerm}\".`;
    }
    if (categoryData) return categoryData.description;
    return "";
  };

  if (errMsg) return <InlineErrorPage pageName="Error" message={errMsg} />;

  return (
    <Box
      sx={{
        padding: "2rem",
        maxWidth: "100%",
        margin: "0 auto",
        bgcolor: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      <Paper elevation={2} sx={{ padding: "1rem", marginBottom: "1.5rem" }}>
        <Box sx={{ textAlign: "center", borderRadius: "8px" }}>
          <img
            src={gifPaths[currentGifIndex]}
            alt="Product Animation"
            onError={handleGifError}
            style={{
              width: "100%",
              height: "300px",
              objectFit: "cover",
              borderRadius: "8px",
              display: gifError ? "none" : "block",
            }}
          />
          {gifError && (
            <Typography variant="body2" color="error">
              Error loading GIF.
            </Typography>
          )}
        </Box>
      </Paper>

      <Typography variant="h6" sx={{ marginBottom: "1rem", textAlign: "center" }}>
        {getDescriptionText()}
      </Typography>

      {productsData.length ? (
        <Grid container spacing={3} justifyContent="center">
          {paginatedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.parent_asin}>
              <Box
                onClick={() => handleProductClick(product.parent_asin)}
                sx={{
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                    transform: "scale(1.03)",
                    transition: "0.2s",
                  },
                }}
              >
                <ProductFeedItem productData={product} userId={userId} />
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <CircularProgress sx={{ margin: "auto" }} />
      )}

      <Box sx={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
        <Pagination count={totalPages} page={currentPage} onChange={(e, value) => setCurrentPage(value)} />
      </Box>
    </Box>
  );
}