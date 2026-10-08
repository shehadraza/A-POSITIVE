"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
  Smartphone,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type CartItem = {
  id: string;
  productId?: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  category: string;
  stock: number;
  quantity: number;
  size: string;
  product?: unknown;
};

/* =========================================================
   SUPABASE
========================================================= */

const supabase = createClient();

/* =========================================================
   CONSTANTS
========================================================= */

const CART_KEY =
  "a_positive_cart";

const BKASH_NUMBER =
  "01850350510";

const ADVANCE_PAYMENT = 150;

const DELIVERY_CHARGE = 150;

/* =========================================================
   PRICE HELPER
========================================================= */

function getNumericPrice(
  price:
    | string
    | number
    | null
    | undefined
) {
  if (
    price === null ||
    price === undefined
  ) {
    return 0;
  }

  if (
    typeof price ===
    "number"
  ) {
    return Number.isFinite(
      price
    )
      ? price
      : 0;
  }

  const cleaned =
    String(price).replace(
      /[^\d.]/g,
      ""
    );

  return Number(cleaned) || 0;
}

/* =========================================================
   NORMALIZE CART
========================================================= */

function normalizeCartItem(
  value: unknown
): CartItem | null {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return null;
  }

  const item =
    value as Record<
      string,
      unknown
    >;

  const product =
    item.product !== null &&
    typeof item.product ===
      "object"
      ? (item.product as Record<
          string,
          unknown
        >)
      : null;

  const id =
    item.id ??
    item.productId ??
    product?.id;

  if (!id) {
    return null;
  }

  const name =
    item.name ??
    product?.name ??
    "Product";

  const brand =
    item.brand ??
    product?.brand ??
    "A-POSITIVE";

  const price =
    item.price ??
    product?.price ??
    "0";

  const image =
    item.image ??
    item.image_url ??
    product?.image_url ??
    product?.image ??
    "";

  const category =
    item.category ??
    product?.category ??
    "FASHION";

  const stock =
    Number(
      item.stock ??
        product?.stock ??
        0
    ) || 0;

  const quantity =
    Math.max(
      1,
      Number(
        item.quantity ?? 1
      ) || 1
    );

  const size =
    item.size !== null &&
    item.size !== undefined
      ? String(
          item.size
        )
      : "";

  return {
    id: String(id),

    productId: String(
      item.productId ??
        product?.id ??
        id
    ),

    name: String(name),

    brand: String(brand),

    price: String(price),

    image: String(image),

    category:
      String(category),

    stock,

    quantity,

    size,

    product:
      item.product ??
      undefined,
  };
}

/* =========================================================
   CHECKOUT PAGE
========================================================= */

export default function CheckoutPage() {
  const router =
    useRouter();

  /* =======================================================
     STATE
  ======================================================= */

  const [cart, setCart] =
    useState<CartItem[]>(
      []
    );

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    placingOrder,
    setPlacingOrder,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [
    transactionId,
    setTransactionId,
  ] = useState("");

  /* =======================================================
     LOAD CART
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    function loadCart() {
      try {
        setLoading(true);
        setError("");

        const savedCart =
          localStorage.getItem(
            CART_KEY
          );

        if (!savedCart) {
          if (mounted) {
            setCart([]);
          }

          return;
        }

        const parsed: unknown =
          JSON.parse(
            savedCart
          );

        if (
          !Array.isArray(parsed)
        ) {
          if (mounted) {
            setCart([]);
          }

          return;
        }

        const normalizedCart =
          parsed
            .map(
              (
                item: unknown
              ) =>
                normalizeCartItem(
                  item
                )
            )
            .filter(
              (
                item
              ): item is CartItem =>
                Boolean(item)
            );

        if (mounted) {
          setCart(
            normalizedCart
          );
        }
      } catch (cartError) {
        console.error(
          "CHECKOUT CART ERROR:",
          cartError
        );

        localStorage.removeItem(
          CART_KEY
        );

        if (mounted) {
          setCart([]);
          setError(
            "Unable to load your cart."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCart();

    const cartListener =
      () => {
        loadCart();
      };

    window.addEventListener(
      "a_positive_cart_updated",
      cartListener
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "a_positive_cart_updated",
        cartListener
      );
    };
  }, []);

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal =
    useMemo(() => {
      return cart.reduce(
        (
          total,
          item
        ) => {
          return (
            total +
            getNumericPrice(
              item.price
            ) *
              Number(
                item.quantity
              )
          );
        },
        0
      );
    }, [cart]);

  /* =======================================================
     PAYMENT
  ======================================================= */

  const deliveryCharge =
    DELIVERY_CHARGE;

  const advancePayment =
    ADVANCE_PAYMENT;

  const codAmount =
    Math.max(
      subtotal,
      0
    );

  const grandTotal =
    subtotal +
    deliveryCharge;

  /* =======================================================
     PLACE ORDER
  ======================================================= */

  async function handlePlaceOrder(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (placingOrder) {
      return;
    }

    setError("");
    setSuccess("");

    /* -----------------------------------------------------
       CART
    ----------------------------------------------------- */

    if (cart.length === 0) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    /* -----------------------------------------------------
       NAME
    ----------------------------------------------------- */

    const trimmedName =
      fullName.trim();

    if (!trimmedName) {
      setError(
        "Please enter your full name."
      );

      return;
    }

    if (
      trimmedName.length <
      2
    ) {
      setError(
        "Please enter a valid full name."
      );

      return;
    }

    /* -----------------------------------------------------
       EMAIL
    ----------------------------------------------------- */

    const trimmedEmail =
      email.trim();

    if (!trimmedEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        trimmedEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    /* -----------------------------------------------------
       PHONE
    ----------------------------------------------------- */

    const cleanPhone =
      phone.replace(
        /\D/g,
        ""
      );

    if (!cleanPhone) {
      setError(
        "Please enter your phone number."
      );

      return;
    }

    if (
      !/^01\d{9}$/.test(
        cleanPhone
      )
    ) {
      setError(
        "Please enter a valid Bangladesh phone number."
      );

      return;
    }

    /* -----------------------------------------------------
       ADDRESS
    ----------------------------------------------------- */

    const trimmedAddress =
      address.trim();

    if (!trimmedAddress) {
      setError(
        "Please enter your delivery address."
      );

      return;
    }

    if (
      trimmedAddress.length <
      5
    ) {
      setError(
        "Please enter a complete delivery address."
      );

      return;
    }

    /* -----------------------------------------------------
       CITY
    ----------------------------------------------------- */

    const trimmedCity =
      city.trim();

    if (!trimmedCity) {
      setError(
        "Please enter your city or area."
      );

      return;
    }

    /* -----------------------------------------------------
       TRANSACTION ID
    ----------------------------------------------------- */

    const trimmedTransactionId =
      transactionId.trim();

    if (
      !trimmedTransactionId
    ) {
      setError(
        "Please enter your bKash transaction ID."
      );

      return;
    }

    if (
      trimmedTransactionId.length <
      5
    ) {
      setError(
        "Please enter a valid bKash transaction ID."
      );

      return;
    }

    setPlacingOrder(
      true
    );

    try {
      /* ---------------------------------------------------
         GENERATE ORDER NUMBER
      --------------------------------------------------- */

      const orderNumber =
        `AP-${Date.now()
          .toString(36)
          .toUpperCase()}-${crypto
          .randomUUID()
          .replace(
            /-/g,
            ""
          )
          .slice(
            0,
            6
          )
          .toUpperCase()}`;

      /* ---------------------------------------------------
         ORDER ITEMS
      --------------------------------------------------- */

      const orderItems =
        cart.map(
          (
            item: CartItem
          ) => ({
            id: String(
              item.id
            ),

            productId:
              item.productId ??
              item.id,

            name:
              item.name,

            brand:
              item.brand,

            category:
              item.category,

            price:
              item.price,

            image:
              item.image,

            quantity:
              item.quantity,

            size:
              item.size || "",
          })
        );

      /* ---------------------------------------------------
         SHIPPING ADDRESS
      --------------------------------------------------- */

      const shippingAddress =
        `${trimmedAddress}, ${trimmedCity}`;

      /* ---------------------------------------------------
         ORDER PAYLOAD
      --------------------------------------------------- */

      const orderPayload = {
        order_number:
          orderNumber,

        /*
         * Guest checkout.
         * No auth user is required.
         */

        user_id:
          null,

        customer_email:
          trimmedEmail,

        items:
          orderItems,

        subtotal:
          subtotal,

        delivery_charge:
          deliveryCharge,

        total:
          grandTotal,

        status:
          "pending",

        order_status:
          "processing",

        payment_status:
          "pending",

        payment_method:
          "online",

        transaction_id:
          trimmedTransactionId,

        advance_paid:
          advancePayment,

        cod_amount:
          codAmount,

        shipping_name:
          trimmedName,

        shipping_phone:
          cleanPhone,

        shipping_address:
          shippingAddress,
      };

      console.log(
        "A-POSITIVE GUEST ORDER PAYLOAD:",
        orderPayload
      );

      /* ---------------------------------------------------
         CREATE ORDER
      --------------------------------------------------- */

      const {
        data: orderResult,
        error: orderError,
      } =
        await supabase.rpc(
          "create_customer_order",
          {
            p_order:
              orderPayload,
          }
        );

      /* ---------------------------------------------------
         DATABASE ERROR
      --------------------------------------------------- */

      if (orderError) {
        console.error(
          "ORDER CREATION ERROR:",
          orderError
        );

        throw new Error(
          orderError.message ||
            "Unable to create your order."
        );
      }

      console.log(
        "GUEST ORDER CREATED:",
        orderResult
      );

      /* ---------------------------------------------------
         CLEAR CART
      --------------------------------------------------- */

      localStorage.removeItem(
        CART_KEY
      );

      setCart([]);

      window.dispatchEvent(
        new Event(
          "a_positive_cart_updated"
        )
      );

      /* ---------------------------------------------------
         SUCCESS
      --------------------------------------------------- */

      setSuccess(
        `Your order has been placed successfully. Order #${orderNumber}`
      );

      /* ---------------------------------------------------
         REDIRECT
      --------------------------------------------------- */

      window.setTimeout(
        () => {
          const orderId =
            orderResult?.id ??
            orderResult?.order_id ??
            orderNumber;

          router.push(
            `/orders/${encodeURIComponent(
              String(orderId)
            )}`
          );

          router.refresh();
        },
        1400
      );
    } catch (err) {
      console.error(
        "PLACE ORDER ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while placing your order."
      );
    } finally {
      setPlacingOrder(
        false
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="checkout-page">
        <div className="checkout-loading">
          LOADING CHECKOUT...
        </div>

        <style jsx global>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          .checkout-page {
            min-height: 100vh;
            background: #f8f7f3;
            color: #11100e;
          }

          .checkout-loading {
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-size: 9px;
            letter-spacing: 0.22em;
            opacity: 0.45;
          }
        `}</style>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="checkout-page">
      <div className="checkout-container">

        {/* BACK */}

        <Link
          href="/"
          className="checkout-back"
        >
          <ArrowLeft size={16} />
          BACK TO A-POSITIVE
        </Link>

        {/* HEADING */}

        <div className="checkout-heading">
          <span>
            A-POSITIVE / CHECKOUT
          </span>

          <h1>
            COMPLETE
            <br />
            <em>
              YOUR ORDER.
            </em>
          </h1>

          <p>
            No account required. Complete your
            delivery details and place your order.
          </p>
        </div>

        {/* EMPTY CART */}

        {cart.length === 0 ? (
          <div className="checkout-empty">

            <ShoppingBag
              size={38}
            />

            <span>
              YOUR BAG IS EMPTY
            </span>

            <h2>
              Nothing here
              <br />
              yet.
            </h2>

            <Link href="/">
              CONTINUE SHOPPING
            </Link>

          </div>
        ) : (
          <form
            className="checkout-layout"
            onSubmit={
              handlePlaceOrder
            }
          >

            {/* =====================================================
                LEFT
            ====================================================== */}

            <div className="checkout-main">

              {/* CUSTOMER DETAILS */}

              <section className="checkout-card">

                <div className="checkout-section-title">

                  <div>
                    <span>
                      01
                    </span>

                    <h2>
                      CUSTOMER DETAILS
                    </h2>
                  </div>

                  <div className="section-icon">
                    <ShoppingBag
                      size={19}
                    />
                  </div>

                </div>

                <div className="checkout-grid">

                  <label>
                    <span>
                      FULL NAME
                    </span>

                    <input
                      type="text"
                      value={
                        fullName
                      }
                      onChange={(
                        event
                      ) =>
                        setFullName(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Your full name"
                      autoComplete="name"
                      disabled={
                        placingOrder
                      }
                    />
                  </label>

                  <label>
                    <span>
                      EMAIL
                    </span>

                    <input
                      type="email"
                      value={
                        email
                      }
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="your@email.com"
                      autoComplete="email"
                      disabled={
                        placingOrder
                      }
                    />
                  </label>

                  <label>
                    <span>
                      PHONE NUMBER
                    </span>

                    <input
                      type="tel"
                      value={
                        phone
                      }
                      onChange={(
                        event
                      ) =>
                        setPhone(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="01XXXXXXXXX"
                      inputMode="numeric"
                      maxLength={11}
                      autoComplete="tel"
                      disabled={
                        placingOrder
                      }
                    />
                  </label>

                </div>

              </section>

              {/* DELIVERY ADDRESS */}

              <section className="checkout-card">

                <div className="checkout-section-title">

                  <div>
                    <span>
                      02
                    </span>

                    <h2>
                      DELIVERY ADDRESS
                    </h2>
                  </div>

                  <MapPin size={19} />

                </div>

                <div className="checkout-grid">

                  <label className="full-field">
                    <span>
                      FULL DELIVERY ADDRESS
                    </span>

                    <textarea
                      value={
                        address
                      }
                      onChange={(
                        event
                      ) =>
                        setAddress(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="House / Road / Area / Delivery address"
                      rows={4}
                      disabled={
                        placingOrder
                      }
                    />
                  </label>

                  <label>
                    <span>
                      CITY / AREA
                    </span>

                    <input
                      type="text"
                      value={
                        city
                      }
                      onChange={(
                        event
                      ) =>
                        setCity(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Chandpur / Dhaka / etc."
                      disabled={
                        placingOrder
                      }
                    />
                  </label>

                </div>

              </section>

              {/* PAYMENT */}

              <section className="checkout-card">

                <div className="checkout-section-title">

                  <div>
                    <span>
                      03
                    </span>

                    <h2>
                      PAYMENT
                    </h2>
                  </div>

                  <CreditCard
                    size={19}
                  />

                </div>

                <div className="payment-option selected">

                  <div className="payment-radio">
                    <Check size={12} />
                  </div>

                  <div>
                    <strong>
                      bKash
                    </strong>

                    <span>
                      Advance delivery payment
                    </span>
                  </div>

                  <b>
                    bKASH
                  </b>

                </div>

                <div className="bkash-box">

                  <div className="bkash-payment-header">

                    <div className="bkash-icon">
                      <Smartphone
                        size={20}
                      />
                    </div>

                    <div>
                      <strong>
                        PAY ৳150 NOW
                      </strong>

                      <span>
                        Advance delivery charge
                      </span>
                    </div>

                  </div>

                  <div className="bkash-number-box">

                    <span>
                      PAYMENT TO BKASH NUMBER
                    </span>

                    <strong>
                      {
                        BKASH_NUMBER
                      }
                    </strong>

                  </div>

                  <div className="bkash-instructions">

                    <div className="instruction-step">

                      <span>
                        01
                      </span>

                      <p>
                        Open your bKash app
                        and choose Send Money.
                      </p>

                    </div>

                    <div className="instruction-step">

                      <span>
                        02
                      </span>

                      <p>
                        Send exactly{" "}
                        <strong>
                          ৳150
                        </strong>{" "}
                        to the bKash number
                        above.
                      </p>

                    </div>

                    <div className="instruction-step">

                      <span>
                        03
                      </span>

                      <p>
                        Enter the Transaction
                        ID below after payment.
                      </p>

                    </div>

                  </div>

                  <label className="transaction-field">

                    <span>
                      TRANSACTION ID / REFERENCE
                    </span>

                    <input
                      type="text"
                      value={
                        transactionId
                      }
                      onChange={(
                        event
                      ) =>
                        setTransactionId(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Enter bKash transaction ID"
                      autoComplete="off"
                      disabled={
                        placingOrder
                      }
                    />

                  </label>

                </div>

                <div className="payment-breakdown">

                  <div>
                    <span>
                      PAY NOW
                    </span>

                    <strong>
                      ৳150
                    </strong>
                  </div>

                  <div>
                    <span>
                      DELIVERY CHARGE
                    </span>

                    <strong>
                      ৳150
                    </strong>
                  </div>

                  <div>
                    <span>
                      CASH ON DELIVERY
                    </span>

                    <strong>
                      ৳
                      {codAmount.toLocaleString(
                        "en-BD"
                      )}
                    </strong>
                  </div>

                </div>

                <div className="cod-info">

                  <Check size={15} />

                  <p>
                    You only pay{" "}
                    <strong>
                      ৳150
                    </strong>{" "}
                    through bKash now.
                    The product price will
                    be collected when your
                    order is delivered.
                  </p>

                </div>

              </section>

              {/* ERROR */}

              {error && (
                <div
                  className="checkout-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div
                  className="checkout-success"
                  role="status"
                >
                  <Check
                    size={17}
                  />

                  {success}
                </div>
              )}

              {/* PLACE ORDER */}

              <button
                type="submit"
                className="place-order-button"
                disabled={
                  placingOrder ||
                  Boolean(
                    success
                  )
                }
              >
                {placingOrder ? (
                  <>
                    <span className="checkout-spinner" />
                    PLACING ORDER...
                  </>
                ) : (
                  <>
                    PLACE ORDER

                    <ArrowLeft
                      size={16}
                      style={{
                        transform:
                          "rotate(180deg)",
                      }}
                    />
                  </>
                )}
              </button>

            </div>

            {/* =====================================================
                RIGHT / ORDER SUMMARY
            ====================================================== */}

            <aside className="checkout-summary">

              <div className="summary-header">

                <span>
                  YOUR ORDER
                </span>

                <Package
                  size={18}
                />

              </div>

              <div className="summary-items">

                {cart.map(
                  (
                    item: CartItem
                  ) => (
                    <div
                      className="summary-item"
                      key={
                        item.id
                      }
                    >

                      {item.image ? (
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                        />
                      ) : (
                        <div
                          style={{
                            width: 58,
                            height: 70,
                            display:
                              "grid",
                            placeItems:
                              "center",
                            background:
                              "#e7e4dd",
                            color:
                              "#777",
                            fontSize: 8,
                            fontWeight:
                              800,
                          }}
                        >
                          A+
                        </div>
                      )}

                      <div>

                        <span>
                          {
                            item.brand
                          }
                        </span>

                        <strong>
                          {
                            item.name
                          }
                        </strong>

                        <small>
                          QTY{" "}
                          {
                            item.quantity
                          }

                          {item.size && (
                            <>
                              {" "}
                              · SIZE{" "}
                              {
                                item.size
                              }
                            </>
                          )}
                        </small>

                      </div>

                      <b>
                        ৳
                        {(
                          getNumericPrice(
                            item.price
                          ) *
                          item.quantity
                        ).toLocaleString(
                          "en-BD"
                        )}
                      </b>

                    </div>
                  )
                )}

              </div>

              <div className="summary-lines">

                <div>

                  <span>
                    PRODUCT SUBTOTAL
                  </span>

                  <strong>
                    ৳
                    {subtotal.toLocaleString(
                      "en-BD"
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    DELIVERY
                  </span>

                  <strong>
                    ৳150
                  </strong>

                </div>

                <div className="summary-total">

                  <span>
                    ORDER TOTAL
                  </span>

                  <strong>
                    ৳
                    {grandTotal.toLocaleString(
                      "en-BD"
                    )}
                  </strong>

                </div>

              </div>

              <div className="summary-payment">

                <div>

                  <span>
                    PAY NOW
                  </span>

                  <strong>
                    ৳150
                  </strong>

                </div>

                <div>

                  <span>
                    CASH ON DELIVERY
                  </span>

                  <strong>
                    ৳
                    {codAmount.toLocaleString(
                      "en-BD"
                    )}
                  </strong>

                </div>

              </div>

              <div className="secure-note">

                <Check size={14} />

                <span>
                  No account is required to
                  place your A-POSITIVE order.
                </span>

              </div>

            </aside>

          </form>
        )}

      </div>

      {/* =========================================================
          STYLES
      ========================================================= */}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        .checkout-page {
          min-height: 100vh;
          background: #f8f7f3;
          color: #11100e;
        }

        .checkout-container {
          max-width: 1380px;
          margin: 0 auto;
          padding: 32px 24px 90px;
        }

        .checkout-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #11100e;
          text-decoration: none;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          opacity: 0.56;
        }

        .checkout-back:hover {
          opacity: 1;
        }

        .checkout-heading {
          max-width: 850px;
          margin: 55px 0 55px;
        }

        .checkout-heading > span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          opacity: 0.42;
        }

        .checkout-heading h1 {
          margin: 15px 0 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(
            58px,
            8vw,
            110px
          );
          line-height: 0.84;
          letter-spacing: -0.06em;
          font-weight: 400;
        }

        .checkout-heading h1 em {
          font-style: italic;
        }

        .checkout-heading p {
          max-width: 540px;
          margin: 24px 0 0;
          font-size: 13px;
          line-height: 1.8;
          opacity: 0.55;
        }

        .checkout-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            390px;
          gap: 24px;
          align-items: start;
        }

        .checkout-main {
          min-width: 0;
        }

        .checkout-card {
          margin-bottom: 16px;
          padding: 25px;
          background: #fff;
          border: 1px solid
            rgba(17, 16, 14, 0.08);
        }

        .checkout-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .checkout-section-title > div:first-child {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .checkout-section-title span {
          font-size: 9px;
          letter-spacing: 0.12em;
          opacity: 0.4;
        }

        .checkout-section-title h2 {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.13em;
          font-weight: 700;
        }

        .checkout-section-title > svg,
        .checkout-section-title
          .section-icon {
          opacity: 0.45;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 15px;
        }

        .checkout-grid label {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .checkout-grid .full-field {
          grid-column: 1 / -1;
        }

        .checkout-grid label > span,
        .transaction-field > span {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.14em;
          opacity: 0.45;
        }

        .checkout-grid input,
        .checkout-grid textarea,
        .transaction-field input {
          width: 100%;
          border: 1px solid
            rgba(17, 16, 14, 0.12);
          background: #faf9f5;
          color: #11100e;
          outline: none;
          padding: 13px;
          font-size: 12px;
          border-radius: 0;
        }

        .checkout-grid input {
          min-height: 46px;
        }

        .checkout-grid textarea {
          min-height: 105px;
          resize: vertical;
          line-height: 1.6;
        }

        .checkout-grid input:focus,
        .checkout-grid textarea:focus,
        .transaction-field input:focus {
          border-color: #11100e;
          background: #fff;
        }

        .checkout-grid input:disabled,
        .checkout-grid textarea:disabled,
        .transaction-field input:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .payment-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 1px solid
            rgba(17, 16, 14, 0.1);
        }

        .payment-radio {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          background: #11100e;
          color: #fff;
        }

        .payment-option > div:nth-child(2) {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
        }

        .payment-option strong {
          font-size: 12px;
        }

        .payment-option span {
          font-size: 10px;
          opacity: 0.48;
        }

        .payment-option > b {
          font-size: 8px;
          letter-spacing: 0.12em;
          opacity: 0.42;
        }

        .bkash-box {
          margin-top: 12px;
          padding: 18px;
          background: #f8f7f3;
          border: 1px solid
            rgba(17, 16, 14, 0.08);
        }

        .bkash-payment-header {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .bkash-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          background: #11100e;
          color: #fff;
        }

        .bkash-payment-header
          > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .bkash-payment-header strong {
          font-size: 13px;
          letter-spacing: 0.04em;
        }

        .bkash-payment-header span {
          font-size: 10px;
          opacity: 0.48;
        }

        .bkash-number-box {
          margin-top: 18px;
          padding: 15px;
          background: #fff;
          border: 1px solid
            rgba(17, 16, 14, 0.08);
        }

        .bkash-number-box span {
          display: block;
          font-size: 8px;
          letter-spacing: 0.14em;
          opacity: 0.42;
        }

        .bkash-number-box strong {
          display: block;
          margin-top: 7px;
          font-size: 20px;
          letter-spacing: 0.04em;
        }

        .bkash-instructions {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .instruction-step {
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 10px;
          align-items: start;
        }

        .instruction-step > span {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.1em;
          opacity: 0.4;
          padding-top: 2px;
        }

        .instruction-step p {
          margin: 0;
          font-size: 10px;
          line-height: 1.65;
          opacity: 0.62;
        }

        .transaction-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-top: 17px;
        }

        .transaction-field input {
          min-height: 46px;
          background: #fff;
        }

        .payment-breakdown {
          margin-top: 17px;
          padding: 15px;
          background: #faf9f5;
          border: 1px solid
            rgba(17, 16, 14, 0.07);
          display: grid;
          gap: 9px;
        }

        .payment-breakdown > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .payment-breakdown span {
          font-size: 8px;
          letter-spacing: 0.12em;
          opacity: 0.45;
        }

        .payment-breakdown strong {
          font-size: 12px;
        }

        .cod-info {
          margin-top: 12px;
          padding: 12px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          background: #f0f3ef;
          color: #263d27;
        }

        .cod-info svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .cod-info p {
          margin: 0;
          font-size: 10px;
          line-height: 1.65;
        }

        .checkout-error,
        .checkout-success {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 14px 15px;
          margin-bottom: 12px;
          font-size: 11px;
          line-height: 1.5;
        }

        .checkout-error {
          background: #f8eaea;
          color: #8c2525;
          border: 1px solid
            rgba(140, 37, 37, 0.15);
        }

        .checkout-success {
          background: #edf5ee;
          color: #265e2c;
          border: 1px solid
            rgba(38, 94, 44, 0.13);
        }

        .place-order-button {
          width: 100%;
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          background: #11100e;
          color: #fff;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
        }

        .place-order-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .checkout-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid
            rgba(255, 255, 255, 0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation:
            checkout-spin 0.8s linear
              infinite;
        }

        @keyframes checkout-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .checkout-summary {
          position: sticky;
          top: 90px;
          background: #11100e;
          color: #fff;
          padding: 21px;
        }

        .summary-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 15px;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.1);
        }

        .summary-header span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.17em;
          opacity: 0.7;
        }

        .summary-header svg {
          opacity: 0.5;
        }

        .summary-items {
          display: grid;
          gap: 12px;
          padding: 17px 0;
        }

        .summary-item {
          display: grid;
          grid-template-columns:
            58px minmax(0, 1fr) auto;
          gap: 10px;
          align-items: center;
        }

        .summary-item > img {
          width: 58px;
          height: 70px;
          object-fit: cover;
          display: block;
          background: #ebe9e2;
        }

        .summary-item > div:nth-child(2) {
          min-width: 0;
        }

        .summary-item > div:nth-child(2) span {
          display: block;
          font-size: 7px;
          letter-spacing: 0.15em;
          opacity: 0.42;
        }

        .summary-item > div:nth-child(2) strong {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          line-height: 1.4;
          font-weight: 500;
        }

        .summary-item > div:nth-child(2) small {
          display: block;
          margin-top: 5px;
          font-size: 8px;
          letter-spacing: 0.08em;
          opacity: 0.48;
        }

        .summary-item > b {
          align-self: start;
          padding-top: 2px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
        }

        .summary-lines {
          padding: 16px 0;
          border-top: 1px solid
            rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.1);
          display: grid;
          gap: 10px;
        }

        .summary-lines > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .summary-lines span {
          font-size: 8px;
          letter-spacing: 0.12em;
          opacity: 0.42;
        }

        .summary-lines strong {
          font-size: 11px;
        }

        .summary-lines
          .summary-total {
          margin-top: 3px;
          padding-top: 12px;
          border-top: 1px solid
            rgba(255, 255, 255, 0.1);
        }

        .summary-lines
          .summary-total
          strong {
          font-size: 16px;
        }

        .summary-payment {
          margin-top: 14px;
          padding: 13px;
          background: rgba(
            255,
            255,
            255,
            0.06
          );
          display: grid;
          gap: 9px;
        }

        .summary-payment > div {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .summary-payment span {
          font-size: 8px;
          letter-spacing: 0.11em;
          opacity: 0.42;
        }

        .summary-payment strong {
          font-size: 11px;
        }

        .secure-note {
          margin-top: 14px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #fff;
          opacity: 0.56;
        }

        .secure-note svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .secure-note span {
          font-size: 9px;
          line-height: 1.5;
        }

        .checkout-empty {
          min-height: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #fff;
          border: 1px solid
            rgba(17, 16, 14, 0.08);
        }

        .checkout-empty > svg {
          opacity: 0.35;
        }

        .checkout-empty > span {
          margin-top: 18px;
          font-size: 8px;
          letter-spacing: 0.2em;
          opacity: 0.4;
        }

        .checkout-empty h2 {
          margin: 14px 0 25px;
          font-family:
            Georgia,
            serif;
          font-size: 42px;
          line-height: 0.95;
          font-style: italic;
          font-weight: 400;
          letter-spacing: -0.04em;
        }

        .checkout-empty a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 16px;
          background: #11100e;
          color: #fff;
          text-decoration: none;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        @media (max-width: 1050px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }

          .checkout-summary {
            position: static;
          }
        }

        @media (max-width: 650px) {
          .checkout-container {
            padding: 22px 15px 55px;
          }

          .checkout-heading {
            margin: 38px 0;
          }

          .checkout-heading h1 {
            font-size: 58px;
          }

          .checkout-card {
            padding: 18px;
          }

          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .checkout-grid
            .full-field {
            grid-column: auto;
          }

          .checkout-summary {
            padding: 17px;
          }

          .payment-option {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}