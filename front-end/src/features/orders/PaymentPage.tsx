import { useEffect, useState } from "react";
import { useParams, useRouteLoaderData } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

import { AuthData } from "../auth/authData";
import InlineErrorPage from "../../components/InlineErrorPage/InlineErrorPage";
import utilStyles from "../../App/utilStyles.module.css";

// Load Stripe
const stripePromise = loadStripe(`${process.env.REACT_APP_STRIPE_PUBLIC_KEY}`);

export default function PaymentPage() {
  const { orderId } = useParams();
  const authData = useRouteLoaderData("app") as AuthData;
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch client secret for payment session
    const basePath = `${process.env.REACT_APP_API_BASE_URL}/checkout/create-payment-session`;
    fetch(`${basePath}?order_id=${orderId}`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch payment session.");
        }
        return res.json();
      })
      .then((data: { clientSecret: string }) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to initialize payment. Please try again.");
        setLoading(false);
      });
  }, [orderId]);

  if (!authData.logged_in) {
    return <InlineErrorPage pageName="Order failed" type="login_required" loginRedirect="/orders" />;
  }

  if (error) {
    return (
      <div className={utilStyles.pagePadding}>
        <h1 className={utilStyles.h1}>Payment Error</h1>
        <p className={utilStyles.error}>{error}</p>
        <p>
          <a href="/orders" className={utilStyles.button}>
            Go back to Orders
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className={utilStyles.pagePadding} id="checkout">
      <h1 className={utilStyles.h1}>Complete Your Payment</h1>
      <p className={utilStyles.mb2rem}>
        <strong>Test Mode:</strong> The payment system (Stripe) is in test mode. No actual payment will be processed.
      </p>
      <p>Use the following test card details:</p>
      <ul className={utilStyles.testCardDetails}>
        <li><strong>Email:</strong> test@example.com</li>
        <li><strong>Card Number:</strong> 4242 4242 4242 4242</li>
        <li><strong>Expiry Date:</strong> 12/34</li>
        <li><strong>CVC:</strong> 123</li>
        <li><strong>Name:</strong> John Smith</li>
        <li><strong>Postcode:</strong> A1 1AB</li>
      </ul>

      {loading ? (
        <div className={utilStyles.loading}>
          <p>Loading payment details...</p>
          <div className={utilStyles.spinner}></div>
        </div>
      ) : (
        clientSecret && (
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        )
      )}
    </div>
  );
}
