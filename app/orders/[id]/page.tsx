"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  UserRound,
  XCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type OrderItem = {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  price: number | string;
  image?: string | null;
  quantity: number;
};

type Order = {
  id: string;
  order_number: string | null;
  customer_email: string | null;

  items:
    | OrderItem[]
    | string
    | null;

  subtotal: number | string;
  delivery_charge: number | string;
  total: number | string;

  status: string | null;
  payment_status: string | null;
  order_status: string | null;

  payment_method: string | null;
  transaction_id: string | null;

  advance_paid: number | string;
  cod_amount: number | string;

  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;

  created_at: string;
  updated_at?: string | null;
};

const supabase =
  createClient();

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(
  value:
    | number
    | string
    | null
    | undefined
) {
  return `৳${Number(
    value || 0
  ).toLocaleString("en-BD")}`;
}

function formatDate(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-BD",
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
    }
  );
}

function parseOrderItems(
  value:
    | OrderItem[]
    | string
    | null
    | undefined
): OrderItem[] {
  if (!value) {
    return [];
  }

  if (
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    try {
      const parsed =
        JSON.parse(value);

      return Array.isArray(
        parsed
      )
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getPaymentStatus(
  order: Order
) {
  return (
    order.payment_status ??
    "pending"
  ).toLowerCase();
}

function getOrderStatus(
  order: Order
) {
  return (
    order.order_status ??
    order.status ??
    "processing"
  ).toLowerCase();
}

/* =========================================================
   PAYMENT STATUS
========================================================= */

function PaymentStatus({
  status,
}: {
  status: string;
}) {
  if (
    status ===
    "verified"
  ) {
    return (
      <span className="customer-status verified">
        <CheckCircle2
          size={14}
        />
        PAYMENT VERIFIED
      </span>
    );
  }

  if (
    status === "failed"
  ) {
    return (
      <span className="customer-status failed">
        <XCircle
          size={14}
        />
        PAYMENT FAILED
      </span>
    );
  }

  return (
    <span className="customer-status pending">
      <Clock3
        size={14}
      />
      PAYMENT PENDING
    </span>
  );
}

/* =========================================================
   ORDER STATUS
========================================================= */

function OrderStatus({
  status,
}: {
  status: string;
}) {
  switch (
    status
  ) {
    case "confirmed":
      return (
        <span className="customer-status verified">
          <CheckCircle2
            size={14}
          />
          ORDER CONFIRMED
        </span>
      );

    case "packed":
      return (
        <span className="customer-status processing">
          <Package
            size={14}
          />
          PACKED
        </span>
      );

    case "shipped":
      return (
        <span className="customer-status processing">
          <Package
            size={14}
          />
          SHIPPED
        </span>
      );

    case "delivered":
      return (
        <span className="customer-status verified">
          <CheckCircle2
            size={14}
          />
          DELIVERED
        </span>
      );

    case "cancelled":
      return (
        <span className="customer-status failed">
          <XCircle
            size={14}
          />
          CANCELLED
        </span>
      );

    case "payment_failed":
      return (
        <span className="customer-status failed">
          <XCircle
            size={14}
          />
          PAYMENT FAILED
        </span>
      );

    default:
      return (
        <span className="customer-status processing">
          <Clock3
            size={14}
          />
          PROCESSING
        </span>
      );
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function OrderDetailsPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const orderId = String(
    params.id ?? ""
  );

  const [
    order,
    setOrder,
  ] =
    useState<Order | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     LOAD ORDER
  ======================================================== */

  const loadOrder =
    useCallback(
      async () => {
        if (!orderId) {
          setLoading(false);
          setError(
            "Invalid order ID."
          );
          return;
        }

        try {
          setError("");

          const {
            data: userData,
            error: userError,
          } =
            await supabase.auth.getUser();

          if (
            userError
          ) {
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

          const {
            data,
            error:
              orderError,
          } =
            await supabase
              .from("orders")
              .select("*")
              .eq(
                "id",
                orderId
              )
              .eq(
                "user_id",
                user.id
              )
              .maybeSingle();

          if (
            orderError
          ) {
            console.error(
              "ORDER LOAD ERROR:",
              orderError
            );

            throw new Error(
              orderError.message
            );
          }

          if (!data) {
            throw new Error(
              "Order not found."
            );
          }

          const normalizedOrder =
            {
              ...data,

              items:
                parseOrderItems(
                  data.items
                ),
            } as Order;

          setOrder(
            normalizedOrder
          );
        } catch (err) {
          console.error(
            "ORDER DETAILS ERROR:",
            err
          );

          setOrder(
            null
          );

          setError(
            err instanceof
            Error
              ? err.message
              : "Unable to load this order."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        orderId,
        router,
      ]
    );

  /* =======================================================
     LOAD + REALTIME
  ======================================================== */

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    loadOrder();

    const channel =
      supabase
        .channel(
          `customer-order-${orderId}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema:
              "public",
            table:
              "orders",
            filter: `id=eq.${orderId}`,
          },
          () => {
            loadOrder();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    orderId,
    loadOrder,
  ]);

  /* =======================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <main className="customer-order-page">
        <div className="customer-order-loading">
          LOADING ORDER...
        </div>

        <style jsx>{`
          .customer-order-page {
            min-height: 100vh;
            background: #f7f6f2;
          }

          .customer-order-loading {
            min-height: 70vh;
            display: grid;
            place-items: center;
            color: #999;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 2px;
          }
        `}</style>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================== */

  if (!order) {
    return (
      <main className="customer-order-page">
        <div className="customer-order-error">
          <span>
            ORDER ERROR
          </span>

          <h1>
            Order not
            <br />
            found.
          </h1>

          <p>
            {error ||
              "We could not find this order."}
          </p>

          <Link href="/orders">
            <ArrowLeft
              size={14}
            />
            BACK TO ORDERS
          </Link>
        </div>

        <style jsx>{`
          .customer-order-page {
            min-height: 100vh;
            background: #f7f6f2;
          }

          .customer-order-error {
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 30px;
          }

          .customer-order-error > span {
            color: #999;
            font-size: 7px;
            font-weight: 900;
            letter-spacing: 1.8px;
          }

          .customer-order-error h1 {
            margin: 15px 0;
            font-family: Georgia, serif;
            font-size: 48px;
            line-height: 0.9;
            font-weight: 400;
          }

          .customer-order-error p {
            max-width: 400px;
            color: #777;
            font-size: 10px;
            line-height: 1.7;
          }

          .customer-order-error a {
            margin-top: 20px;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: #111;
            text-decoration: none;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 1.2px;
          }
        `}</style>
      </main>
    );
  }

  /* =======================================================
     NORMALIZED VALUES
  ======================================================== */

  const paymentStatus =
    getPaymentStatus(
      order
    );

  const orderStatus =
    getOrderStatus(
      order
    );

  const orderItems =
    parseOrderItems(
      order.items
    );

  return (
    <main className="customer-order-page">
      <div className="customer-order-container">

        {/* BACK */}

        <Link
          href="/orders"
          className="customer-order-back"
        >
          <ArrowLeft
            size={15}
          />
          BACK TO ORDERS
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="customer-order-header">
          <span>
            A-POSITIVE / ORDER DETAILS
          </span>

          <h1>
            ORDER
            <br />
            <em>
              CONFIRMATION.
            </em>
          </h1>

          <div className="customer-order-number">
            #
            {(
              order.order_number ??
              order.id.slice(
                0,
                8
              )
            ).toUpperCase()}
          </div>

          <p>
            Placed on{" "}
            {formatDate(
              order.created_at
            )}
          </p>
        </header>

        {/* =================================================
            STATUS
        ================================================= */}

        <section className="customer-status-grid">
          <div className="customer-status-card">
            <span>
              PAYMENT
            </span>

            <PaymentStatus
              status={
                paymentStatus
              }
            />
          </div>

          <div className="customer-status-card">
            <span>
              ORDER
            </span>

            <OrderStatus
              status={
                orderStatus
              }
            />
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="customer-order-layout">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="customer-order-main">

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <section className="customer-order-card">
              <div className="customer-card-heading">
                <div>
                  <span>
                    ORDER ITEMS
                  </span>

                  <h2>
                    YOUR
                    <br />
                    <em>
                      SELECTION.
                    </em>
                  </h2>
                </div>

                <ShoppingBag
                  size={19}
                />
              </div>

              <div className="customer-products">
                {orderItems.length >
                0 ? (
                  orderItems.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={`${order.id}-${item.id}-${index}`}
                        className="customer-product"
                      >
                        <div className="customer-product-image">
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
                            <Package
                              size={
                                20
                              }
                            />
                          )}
                        </div>

                        <div className="customer-product-info">
                          <span>
                            {
                              item.brand ??
                              "A-POSITIVE"
                            }
                          </span>

                          <strong>
                            {
                              item.name
                            }
                          </strong>

                          <small>
                            {item.category ??
                              "FASHION"}
                            {" • "}
                            QTY{" "}
                            {
                              item.quantity
                            }
                          </small>
                        </div>

                        <strong className="customer-product-price">
                          {formatPrice(
                            Number(
                              item.price
                            ) *
                              Number(
                                item.quantity ||
                                  1
                              )
                          )}
                        </strong>
                      </div>
                    )
                  )
                ) : (
                  <div className="customer-empty-items">
                    <Package
                      size={25}
                    />

                    <span>
                      No order items
                      were found.
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                DELIVERY
            ================================================= */}

            <section className="customer-order-card">
              <div className="customer-card-heading">
                <div>
                  <span>
                    DELIVERY
                  </span>

                  <h2>
                    SHIPPING
                    <br />
                    <em>
                      DETAILS.
                    </em>
                  </h2>
                </div>

                <MapPin
                  size={19}
                />
              </div>

              <div className="customer-detail-grid">

                <div>
                  <span>
                    NAME
                  </span>

                  <strong>
                    {order.shipping_name ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    PHONE
                  </span>

                  <strong>
                    <Phone
                      size={12}
                      style={{
                        verticalAlign:
                          "middle",
                        marginRight: 5,
                      }}
                    />

                    {order.shipping_phone ||
                      "—"}
                  </strong>
                </div>

                <div className="customer-full-detail">
                  <span>
                    DELIVERY ADDRESS
                  </span>

                  <strong>
                    {order.shipping_address ||
                      "—"}
                  </strong>
                </div>

              </div>
            </section>

            {/* =================================================
                PAYMENT
            ================================================= */}

            <section className="customer-order-card">
              <div className="customer-card-heading">
                <div>
                  <span>
                    PAYMENT
                  </span>

                  <h2>
                    BKASH
                    <br />
                    <em>
                      DETAILS.
                    </em>
                  </h2>
                </div>
              </div>

              <div className="customer-detail-grid">

                <div>
                  <span>
                    METHOD
                  </span>

                  <strong>
                    {(
                      order.payment_method ??
                      "online"
                    ).toUpperCase()}
                  </strong>
                </div>

                <div>
                  <span>
                    TRANSACTION ID
                  </span>

                  <strong className="transaction-text">
                    {order.transaction_id ??
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    ADVANCE PAID
                  </span>

                  <strong>
                    {formatPrice(
                      order.advance_paid
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    CASH ON DELIVERY
                  </span>

                  <strong>
                    {formatPrice(
                      order.cod_amount
                    )}
                  </strong>
                </div>

              </div>

              {paymentStatus ===
                "pending" && (
                <div className="customer-payment-note pending-note">
                  <Clock3
                    size={14}
                  />

                  <p>
                    Your bKash payment is
                    currently waiting for
                    verification.
                  </p>
                </div>
              )}

              {paymentStatus ===
                "verified" && (
                <div className="customer-payment-note verified-note">
                  <CheckCircle2
                    size={14}
                  />

                  <p>
                    Your payment has been
                    verified successfully.
                  </p>
                </div>
              )}

              {paymentStatus ===
                "failed" && (
                <div className="customer-payment-note failed-note">
                  <XCircle
                    size={14}
                  />

                  <p>
                    Your payment could not
                    be verified. Please
                    contact A-POSITIVE.
                  </p>
                </div>
              )}
            </section>

          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <aside className="customer-order-sidebar">

            {/* SUMMARY */}

            <section className="customer-order-card">
              <div className="customer-card-heading">
                <div>
                  <span>
                    SUMMARY
                  </span>

                  <h2>
                    ORDER
                    <br />
                    <em>
                      TOTAL.
                    </em>
                  </h2>
                </div>
              </div>

              <div className="customer-summary-lines">

                <div>
                  <span>
                    PRODUCT SUBTOTAL
                  </span>

                  <strong>
                    {formatPrice(
                      order.subtotal
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    DELIVERY
                  </span>

                  <strong>
                    {formatPrice(
                      order.delivery_charge
                    )}
                  </strong>
                </div>

                <div className="customer-summary-total">
                  <span>
                    ORDER TOTAL
                  </span>

                  <strong>
                    {formatPrice(
                      order.total
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    PAID NOW
                  </span>

                  <strong>
                    {formatPrice(
                      order.advance_paid
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    PAY ON DELIVERY
                  </span>

                  <strong>
                    {formatPrice(
                      order.cod_amount
                    )}
                  </strong>
                </div>

              </div>
            </section>

            {/* ACCOUNT */}

            <section className="customer-order-card">
              <div className="customer-card-heading">
                <div>
                  <span>
                    CUSTOMER
                  </span>

                  <h2>
                    YOUR
                    <br />
                    <em>
                      ACCOUNT.
                    </em>
                  </h2>
                </div>

                <UserRound
                  size={19}
                />
              </div>

              <div className="customer-account-info">
                <span>
                  EMAIL
                </span>

                <strong>
                  {order.customer_email ??
                    "—"}
                </strong>
              </div>

              <Link
                href="/orders"
                className="customer-outline-button"
              >
                VIEW ALL ORDERS

                <ArrowLeft
                  size={14}
                  style={{
                    transform:
                      "rotate(180deg)",
                  }}
                />
              </Link>
            </section>

          </aside>
        </div>
      </div>

      {/* =====================================================
          STYLES
      ====================================================== */}

      <style jsx>{`
        .customer-order-page {
          min-height: 100vh;
          padding: 55px 5% 100px;
          background: #f7f6f2;
          color: #111;
        }

        .customer-order-container {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .customer-order-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #777;
          text-decoration: none;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.5px;
          transition: opacity 0.25s ease;
        }

        .customer-order-back:hover {
          opacity: 0.5;
        }

        .customer-order-header {
          margin-top: 55px;
        }

        .customer-order-header > span {
          display: block;
          margin-bottom: 15px;
          color: #999;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .customer-order-header h1 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(
            48px,
            7vw,
            88px
          );
          line-height: 0.87;
          font-weight: 400;
          letter-spacing: -4px;
        }

        .customer-order-header h1 em {
          font-style: italic;
        }

        .customer-order-number {
          margin-top: 24px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .customer-order-header p {
          margin-top: 8px;
          color: #888;
          font-size: 9px;
        }

        .customer-status-grid {
          margin-top: 35px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .customer-status-card {
          min-height: 100px;
          padding: 18px;
          border: 1px solid #e4e0d8;
          background: #fff;
        }

        .customer-status-card > span {
          display: block;
          margin-bottom: 13px;
          color: #999;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1.6px;
        }

        .customer-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 10px;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .customer-status.pending {
          background: #f5efe0;
          color: #806321;
        }

        .customer-status.verified {
          background: #e7f2ea;
          color: #2d6845;
        }

        .customer-status.failed {
          background: #f5e4e4;
          color: #963434;
        }

        .customer-status.processing {
          background: #edf1f5;
          color: #4c6178;
        }

        .customer-order-layout {
          margin-top: 18px;
          display: grid;
          grid-template-columns:
            minmax(0, 1.55fr)
            minmax(300px, 0.8fr);
          gap: 18px;
          align-items: start;
        }

        .customer-order-main,
        .customer-order-sidebar {
          display: grid;
          gap: 18px;
        }

        .customer-order-card {
          padding: 25px;
          border: 1px solid #e4e0d8;
          background: #fff;
        }

        .customer-card-heading {
          margin-bottom: 23px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .customer-card-heading div > span {
          display: block;
          margin-bottom: 8px;
          color: #999;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }

        .customer-card-heading h2 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 28px;
          line-height: 0.9;
          font-weight: 400;
          letter-spacing: -1px;
        }

        .customer-card-heading h2 em {
          font-style: italic;
        }

        .customer-products {
          display: grid;
          gap: 10px;
        }

        .customer-product {
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 13px;
          background: #faf9f6;
        }

        .customer-product-image {
          width: 62px;
          height: 76px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          background: #ebe8e0;
          overflow: hidden;
          color: #999;
        }

        .customer-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .customer-product-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .customer-product-info span {
          color: #999;
          font-size: 5px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .customer-product-info strong {
          overflow: hidden;
          color: #222;
          font-family: Georgia, serif;
          font-size: 13px;
          font-weight: 400;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .customer-product-info small {
          color: #777;
          font-size: 7px;
        }

        .customer-product-price {
          font-size: 10px;
          white-space: nowrap;
        }

        .customer-empty-items {
          min-height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 10px;
          color: #999;
          font-size: 8px;
        }

        .customer-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .customer-detail-grid > div {
          min-height: 68px;
          padding: 13px;
          border: 1px solid #ece8e1;
          background: #faf9f7;
        }

        .customer-detail-grid > div > span {
          display: block;
          margin-bottom: 7px;
          color: #999;
          font-size: 5.5px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .customer-detail-grid strong {
          display: block;
          color: #333;
          font-size: 9px;
          line-height: 1.5;
          word-break: break-word;
        }

        .customer-full-detail {
          grid-column: 1 / -1;
        }

        .transaction-text {
          font-family: monospace;
          font-size: 8px !important;
          word-break: break-all;
        }

        .customer-payment-note {
          margin-top: 15px;
          padding: 13px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 8px;
          line-height: 1.6;
        }

        .customer-payment-note p {
          margin: 0;
        }

        .pending-note {
          background: #faf6e9;
          color: #806321;
        }

        .verified-note {
          background: #edf6ef;
          color: #2d6845;
        }

        .failed-note {
          background: #f8eaea;
          color: #963434;
        }

        .customer-summary-lines {
          display: grid;
          gap: 10px;
        }

        .customer-summary-lines > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .customer-summary-lines span {
          color: #999;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .customer-summary-lines strong {
          font-size: 10px;
        }

        .customer-summary-total {
          margin-top: 5px;
          padding-top: 14px;
          border-top: 1px solid #111;
        }

        .customer-summary-total strong {
          font-size: 14px;
        }

        .customer-account-info {
          margin-bottom: 18px;
          padding: 13px;
          border: 1px solid #ece8e1;
          background: #faf9f7;
        }

        .customer-account-info span {
          display: block;
          margin-bottom: 6px;
          color: #999;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .customer-account-info strong {
          display: block;
          color: #333;
          font-size: 8px;
          word-break: break-word;
        }

        .customer-outline-button {
          min-height: 42px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid #111;
          color: #111;
          text-decoration: none;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.3px;
          transition:
            background 0.25s ease,
            color 0.25s ease,
            transform 0.25s ease;
        }

        .customer-outline-button:hover {
          background: #111;
          color: #fff;
          transform: translateY(-2px);
        }

        @media (max-width: 850px) {
          .customer-order-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .customer-order-page {
            padding: 35px 4% 70px;
          }

          .customer-order-header {
            margin-top: 42px;
          }

          .customer-order-header h1 {
            letter-spacing: -3px;
          }

          .customer-status-grid {
            grid-template-columns: 1fr;
          }

          .customer-order-card {
            padding: 19px;
          }

          .customer-card-heading h2 {
            font-size: 25px;
          }

          .customer-detail-grid {
            grid-template-columns: 1fr;
          }

          .customer-full-detail {
            grid-column: auto;
          }

          .customer-product {
            align-items: flex-start;
          }

          .customer-product-price {
            font-size: 9px;
          }
        }
      `}</style>
    </main>
  );
}