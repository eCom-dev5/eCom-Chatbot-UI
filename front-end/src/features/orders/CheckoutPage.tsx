import { Form, Link, redirect, useActionData, useLoaderData, useRouteLoaderData } from "react-router-dom";

import { AuthData } from "../auth/authData";
import { CartLoaderData } from "./Cart";
import { renderOrderItems } from "./utils";
import InlineErrorPage from "../../components/InlineErrorPage/InlineErrorPage";

import utilStyles from "../../App/utilStyles.module.css";

export async function checkoutAction({ request }: { request: Request }) {
  let formData = await request.formData();
  try {
    const address = formData.get("address");
    const postcode = formData.get("postcode");

    const res = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/checkout/create-pending-order`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ address, postcode })
      }
    );

    if (res.ok) {
      const { order_id }: { order_id: number } = await res.json();
      // Redirect to order confirmation or summary page
      return redirect(`/orders/${order_id}`);
    }
    throw new Error("Unexpected status code.");
  } catch (error) {
    return { checkoutErrMsg: "Sorry, your order could not be completed. Please try again later." };
  }
}


export function CheckoutPage() {
  // https://reactrouter.com/en/main/hooks/use-route-loader-data
  const authData = useRouteLoaderData("app") as AuthData;
  const { cartData, cartLoaderErrMsg } = useLoaderData() as CartLoaderData;
  const checkoutActionData = useActionData() as { checkoutErrMsg: string } | undefined;
  const checkoutErrMsg = checkoutActionData?.checkoutErrMsg;

  if (!authData.logged_in) {
    return <InlineErrorPage pageName="Checkout" type="login_required" loginRedirect="/cart" />;
  } else if (cartLoaderErrMsg) {
    return <InlineErrorPage pageName="Checkout" message={cartLoaderErrMsg} />;
  } else if (cartData.length === 0) {
    return <InlineErrorPage pageName="Checkout" message="Your cart is empty so it is not possible to checkout." />;
  }

  function getTotalCost() {
    let totalCost = 0;
    cartData.forEach(item => {
      console.log("price for each product",item.product_price)
      totalCost += Number(item.product_price) * item.product_quantity;
    });
    return parseFloat(totalCost.toFixed(2));
  }

  return (
    <div className={utilStyles.pagePadding}>
      <h1 className={utilStyles.h1}>Checkout</h1>
      <p className={utilStyles.mb2rem}>Complete your order below.</p>
      <div className={utilStyles.checkoutContainer}>
        {/* Left Column: Order Items */}
        <div className={utilStyles.orderItemsColumn}>
          <h2>Order items</h2>
          {renderOrderItems(cartData, false)}
        </div>
  
        {/* Right Column: Total Cost and Delivery Address */}
        <div className={utilStyles.rightColumn}>
          <div className={`${utilStyles.mb3rem} ${utilStyles.XLText}`}>
            <strong>
              Total cost: <span className={utilStyles.red}>${getTotalCost()}</span>
            </strong>
          </div>
  
          <h2>Delivery address</h2>
          <Form method="post" className={utilStyles.stackedForm}>
            <label htmlFor="address" className={utilStyles.label}>Delivery name and address</label>
            <textarea id="address" className={utilStyles.input} name="address" rows={6} minLength={15} maxLength={300} required />
            <label htmlFor="postcode" className={utilStyles.label}>Postcode</label>
            <input id="postcode" className={utilStyles.input} type="text" name="postcode" minLength={5} maxLength={8} required />
            <button type="submit" className={`${utilStyles.mt2rem} ${utilStyles.button}`}>Place order</button>
          </Form>
          {checkoutErrMsg ? (
            <div className={utilStyles.mt2rem}>
              <p className={`${utilStyles.mb2rem} ${utilStyles.red}`}>
                <strong>{checkoutErrMsg}</strong>
              </p>
              <Link to="/" className={utilStyles.button}>Continue shopping</Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
  
}
