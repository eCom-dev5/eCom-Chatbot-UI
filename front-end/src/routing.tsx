import { createBrowserRouter } from "react-router-dom";

import AccountPage from "./components/AccountPage/AccountPage.tsx";
import { App, authLoader } from "./App/App.tsx";
import { Cart, cartLoader } from "./features/orders/Cart.tsx";
import { CheckoutPage, checkoutAction } from "./features/orders/CheckoutPage.tsx";
import { removeCartItemAction } from "./features/orders/OrderItem.tsx";
import FallbackErrorPage from "./components/FallbackErrorPage/FallbackErrorPage.tsx";
import { LoginPage, loginAction } from "./features/auth/LoginPage.tsx";
import { OrderDetailsPage, orderDetailsLoader } from "./features/orders/OrderDetailsPage.tsx";
import { ordersLoader } from "./features/orders/OrdersHistory.tsx";
import PaymentPage from "./features/orders/PaymentPage.tsx";
import PaymentReturn from "./features/orders/PaymentReturn.tsx";
import { ProductDetail, productDetailLoader, addToCartAction } from "./features/products/ProductDetail.tsx";
import { ProductFeed, productFeedLoader } from "./features/products/ProductFeed.tsx";
import { RegistrationPage, registerAction } from "./features/auth/RegistrationPage.tsx";


// https://reactrouter.com/en/main/routers/create-browser-router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <FallbackErrorPage />,
    loader: authLoader,
    id: "app",
    children: [
      {
        path: "",
        element: <ProductFeed />,
        loader: productFeedLoader,
      },
      {
        path: "account",
        element: <AccountPage />,
        loader: ordersLoader
      },
      {
        path: "cart",
        element: <Cart />,
        loader: cartLoader,
        action: removeCartItemAction,
      },
      {
        path: "category/:categorySlug",
        element: <ProductFeed />,
        loader: productFeedLoader,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
        loader: cartLoader,
        action: checkoutAction,
      },
      // {
      //   // Redirect to confirmation page directly after checkout
      //   path: "checkout/:orderId/confirmation",
      //   element: <CheckoutConfirmation />,
      // },
      {
        path: "checkout/:id/success",
        element: <OrderDetailsPage checkoutSuccess={true} />,
        loader: orderDetailsLoader,
      },
      {
        path: "login",
        element: <LoginPage />,
        action: loginAction,
      },
      {
        path: "orders/:id",
        element: <OrderDetailsPage />,
        loader: orderDetailsLoader,
      },
      {
        path: "products/:id/:productNameSlug",
        element: <ProductDetail />,
        loader: productDetailLoader,
        action: addToCartAction,
      },
      {
        path: "register",
        element: <RegistrationPage />,
        action: registerAction,
      },
      {
        path: "search",
        element: <ProductFeed isSearchResults={true} />,
        loader: productFeedLoader,
      },
    ],
  },
]);
