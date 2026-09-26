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
  UserRound,
  Smartphone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  category: string;
  stock: number;
  quantity: number;
};

/* =========================================================
   SUPABASE
========================================================= */

const supabase = createClient();

/* =========================================================
   CONSTANTS
========================================================= */

const CART_KEY = "a_positive_cart";

const BKASH_NUMBER = "01850350510";

const ADVANCE_PAYMENT = 150;

const DELIVERY_CHARGE = 150;

/* =========================================================
   PRICE HELPER
========================================================= */

function getNumericPrice(
  price: string | number | null | undefined
) {
  if (
    price === null ||
    price === undefined
  ) {
    return 0;
  }

  if (typeof price === "number") {
    return price;
  }

  const cleaned = String(
    price
  ).replace(
    /[^\d.]/g,
    ""
  );

  return Number(cleaned) || 0;
}

/* =========================================================
   CHECKOUT PAGE
========================================================= */

export default function CheckoutPage() {
  const router = useRouter();

  /* =======================================================
     STATE
  ======================================================= */

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

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
     LOAD USER + CART
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadCheckout() {
      try {
        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw new Error(
            userError.message
          );
        }

        const user =
          userData?.user;

        if (!user) {
  router.replace("/login?next=/checkout");
  return;
}

        if (!mounted) {
          return;
        }

        setEmail(
          user.email ?? ""
        );

        const savedCart =
          localStorage.getItem(
            CART_KEY
          );

        if (!savedCart) {
          setCart([]);

          return;
        }

        try {
          const parsed =
            JSON.parse(
              savedCart
            );

          if (
            Array.isArray(
              parsed
            )
          ) {
            const normalizedCart =
              parsed
                .filter(
                  (item) =>
                    item &&
                    item.id
                )
                .map(
                  (item) => ({
                    id: String(
                      item.id
                    ),

                    name: String(
                      item.name ??
                        "Product"
                    ),

                    brand: String(
                      item.brand ??
                        "A-POSITIVE"
                    ),

                    price: String(
                      item.price ??
                        "৳0"
                    ),

                    image: String(
                      item.image ??
                        item.image_url ??
                        ""
                    ),

                    category:
                      String(
                        item.category ??
                          "FASHION"
                      ),

                    stock:
                      Number(
                        item.stock
                      ) || 0,

                    quantity:
                      Math.max(
                        1,
                        Number(
                          item.quantity
                        ) || 1
                      ),
                  })
                );

            setCart(
              normalizedCart
            );
          } else {
            setCart([]);
          }
        } catch (cartError) {
          console.error(
            "CART PARSING ERROR:",
            cartError
          );

          localStorage.removeItem(
            CART_KEY
          );

          setCart([]);
        }
      } catch (err) {
        console.error(
          "CHECKOUT LOADING ERROR:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your checkout."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCheckout();

    return () => {
      mounted = false;
    };
  }, [router]);

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
              item.quantity
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

  /*
    Customer pays delivery charge now.
    Product subtotal is collected through COD.
  */

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

    if (!trimmedTransactionId) {
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

    setPlacingOrder(true);

    try {
      /* ---------------------------------------------------
         GET CURRENT USER
      --------------------------------------------------- */

      const {
        data: userData,
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          userError.message
        );
      }

      const user =
        userData?.user;

      if (!user) {
        router.replace(
          "/login"
        );

        return;
      }

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
          .slice(0, 6)
          .toUpperCase()}`;

      /* ---------------------------------------------------
         ORDER ITEMS
      --------------------------------------------------- */

      const orderItems =
        cart.map(
          (item) => ({
            id: String(
              item.id
            ),

            name: item.name,

            brand: item.brand,

            category:
              item.category,

            price: item.price,

            image: item.image,

            quantity:
              item.quantity,
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
        /*
         * REQUIRED ORDER NUMBER
         */
        order_number:
          orderNumber,

        /*
         * CUSTOMER
         */
        user_id:
          user.id,

        customer_email:
          user.email ??
          email,

        /*
         * ORDER ITEMS
         */
        items:
          orderItems,

        /*
         * MONEY
         */
        subtotal:
          subtotal,

        delivery_charge:
          deliveryCharge,

        total:
          grandTotal,

        /*
         * ORDER STATUS
         */
        status:
          "pending",

        order_status:
          "processing",

        /*
         * PAYMENT STATUS
         */
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

        /*
         * SHIPPING
         */
        shipping_name:
          trimmedName,

        shipping_phone:
          cleanPhone,

        shipping_address:
          shippingAddress,
      };

      /* ---------------------------------------------------
         DEBUG PAYLOAD
      --------------------------------------------------- */

      console.log(
        "================================"
      );

      console.log(
        "A-POSITIVE ORDER PAYLOAD:"
      );

      console.log(
        orderPayload
      );

      console.log(
        "================================"
      );

      /* ---------------------------------------------------
         INSERT ORDER

         IMPORTANT:
         No .select()
         No .single()

         Because INSERT can succeed while
         SELECT is blocked by RLS.
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
    "================================"
  );

  console.error(
    "ORDER CREATION ERROR MESSAGE:",
    orderError.message
  );

  console.error(
    "ORDER CREATION ERROR DETAILS:",
    orderError.details
  );

  console.error(
    "ORDER CREATION ERROR HINT:",
    orderError.hint
  );

  console.error(
    "ORDER CREATION ERROR CODE:",
    orderError.code
  );

  console.error(
    "ORDER CREATION ERROR:",
    orderError
  );

  console.error(
    "================================"
  );

  throw new Error(
    orderError.message ||
      "Unable to create your order."
  );
}

console.log(
  "================================"
);

console.log(
  "A-POSITIVE ORDER CREATED SUCCESSFULLY"
);

console.log(
  "ORDER RESULT:",
  orderResult
);

console.log(
  "ORDER NUMBER:",
  orderNumber
);

console.log(
  "================================"
);

      

      /* ---------------------------------------------------
         ORDER SUCCESS
      --------------------------------------------------- */

      console.log(
        "================================"
      );

      console.log(
        "A-POSITIVE ORDER CREATED SUCCESSFULLY"
      );

      console.log(
        "ORDER NUMBER:",
        orderNumber
      );

      console.log(
        "================================"
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
          router.push(
            "/orders"
          );

          router.refresh();
        },
        1400
      );
    } catch (err) {
      console.error(
        "================================"
      );

      console.error(
        "PLACE ORDER ERROR:",
        err
      );

      console.error(
        "================================"
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
            Secure your selected pieces and
            complete your delivery details.
          </p>
        </div>

        {/* EMPTY CART */}

        {cart.length ===
        0 ? (
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

                  <UserRound
                    size={19}
                  />

                </div>

                <div className="checkout-grid">

                  {/* NAME */}

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
                          event.target
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

                  {/* EMAIL */}

                  <label>
                    <span>
                      EMAIL
                    </span>

                    <input
                      type="email"
                      value={email}
                      readOnly
                    />
                  </label>

                  {/* PHONE */}

                  <label>
                    <span>
                      PHONE NUMBER
                    </span>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(
                        event
                      ) =>
                        setPhone(
                          event.target
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

                  <MapPin
                    size={19}
                  />

                </div>

                <div className="checkout-grid">

                  {/* ADDRESS */}

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
                          event.target
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

                  {/* CITY */}

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
                          event.target
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

                {/* PAYMENT METHOD */}

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

                {/* BKASH BOX */}

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

                  {/* NUMBER */}

                  <div className="bkash-number-box">

                    <span>
                      PAYMENT TO BKASH NUMBER
                    </span>

                    <strong>
                      {BKASH_NUMBER}
                    </strong>

                  </div>

                  {/* INSTRUCTIONS */}

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

                  {/* TRANSACTION ID */}

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
                          event.target
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

                {/* PAYMENT BREAKDOWN */}

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
                  <Check size={17} />
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

              {/* HEADER */}

              <div className="summary-header">

                <span>
                  YOUR ORDER
                </span>

                <Package size={18} />

              </div>

              {/* ITEMS */}

              <div className="summary-items">

                {cart.map(
                  (item) => (
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
                            fontSize:
                              8,
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

              {/* TOTALS */}

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

              {/* PAYMENT STATUS */}

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

              {/* SECURE NOTE */}

              <div className="secure-note">

                <Check size={14} />

                <span>
                  Your order information
                  is securely processed
                  through A-POSITIVE.
                </span>

              </div>

            </aside>

          </form>
        )}

      </div>
    </main>
  );
}