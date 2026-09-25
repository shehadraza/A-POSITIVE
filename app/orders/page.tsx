"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  customer_email: string | null;
    order_number: string | null;
  payment_status: string | null;
  order_status: string | null;
  items: OrderItem[];
  subtotal: number | string;
  delivery_charge: number | string;
  total: number | string;
  status: string;
  payment_method: string;
  transaction_id: string | null;
  advance_paid: number | string;
  cod_amount: number | string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  created_at: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (!mounted) return;

      if (error) {
        console.error("Orders fetch error:", error);
        setOrders([]);
      } else {
        setOrders((data ?? []) as Order[]);
      }

      setLoading(false);
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const formatPrice = (value: number | string) => {
    return `৳${Number(value || 0).toLocaleString("en-BD")}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "delivered") {
      return <CheckCircle2 size={15} />;
    }

    if (
      normalized === "shipped" ||
      normalized === "processing"
    ) {
      return <Truck size={15} />;
    }

    if (normalized === "cancelled") {
      return <XCircle size={15} />;
    }

    return <Clock3 size={15} />;
  };

  if (loading) {
    return (
      <>
        <main className="orders-page">
          <div className="orders-loading">
            LOADING ORDERS...
          </div>
        </main>

        <style jsx>{`
          .orders-page {
            min-height: 100vh;
            background: #f7f6f2;
            color: #111;
            padding: 70px 5%;
          }

          .orders-loading {
            min-height: 60vh;
            display: grid;
            place-items: center;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 2px;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <main className="orders-page">
        <div className="orders-container">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} />
            BACK TO A-POSITIVE
          </Link>

          <div className="orders-header">
            <span className="orders-eyebrow">
              A-POSITIVE / SHOPPING
            </span>

            <h1>
              MY <em>ORDERS</em>
            </h1>

            <p>
              Orders connected to{" "}
              <strong>{email}</strong> will
              appear here.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="orders-empty">
              <div className="orders-empty-icon">
                <Package size={32} />
              </div>

              <span>NO ORDERS YET</span>

              <h2>
                Your wardrobe is
                <br />
                waiting.
              </h2>

              <p>
                You haven't placed an order yet.
                Explore our latest collection and
                find something that feels like you.
              </p>

              <Link
                href="/#new-arrivals"
                className="shop-orders-button"
              >
                <ShoppingBag size={15} />
                EXPLORE COLLECTION
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="order-card"
                >
                  <div className="order-top">
                    <div>
                      <span className="order-label">
                        ORDER ID
                      </span>

                      <Link
  href={`/orders/${encodeURIComponent(order.id)}`}
  className="order-id-link"
>
  #
  {(
    order.order_number ??
    order.id.slice(0, 8)
  ).toUpperCase()}
</Link>
                    </div>

                    <div className="order-date">
                      {formatDate(order.created_at)}
                    </div>
                  </div>

                  <div className="order-status-group">

  <div className="order-status">
    {getStatusIcon(
      order.order_status ??
      order.status
    )}

    {(
      order.order_status ??
      order.status
    ).toUpperCase()}
  </div>

  <div
    className={`payment-status payment-${(
      order.payment_status ??
      "pending"
    ).toLowerCase()}`}
  >
    {(order.payment_status ??
      "pending") ===
    "verified" ? (
      <CheckCircle2 size={15} />
    ) : (
      <Clock3 size={15} />
    )}

    PAYMENT{" "}
    {(
      order.payment_status ??
      "pending"
    ).toUpperCase()}
  </div>

</div>

                  <div className="order-products">
                    {order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.id}`}
                        className="order-product"
                      >
                        <div className="product-image">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                            />
                          ) : (
                            <Package size={20} />
                          )}
                        </div>

                        <div className="product-info">
                          <strong>{item.name}</strong>

                          <span>
                            {item.brand || "A-POSITIVE"}
                          </span>

                          <small>
                            Qty: {item.quantity}
                          </small>
                        </div>

                        <strong className="product-price">
                          {formatPrice(
                            Number(item.price) *
                              item.quantity
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="order-bottom">
                    <div className="payment-info">
                      <div>
                        <span>SUBTOTAL</span>
                        <strong>
                          {formatPrice(order.subtotal)}
                        </strong>
                      </div>

                      <div>
                        <span>DELIVERY</span>
                        <strong>
                          {formatPrice(
                            order.delivery_charge
                          )}
                        </strong>
                      </div>

                      <div className="total-row">
                        <span>TOTAL</span>
                        <strong>
                          {formatPrice(order.total)}
                        </strong>
                      </div>
                    </div>

                    <div className="cod-box">
                      <span>PAYMENT</span>

                      <strong>
                        BDT {formatPrice(order.advance_paid)}
                      </strong>

                      <small>
                        Paid in advance
                      </small>

                      <strong>
                        COD {formatPrice(order.cod_amount)}
                      </strong>

                      <small>
                        Pay on delivery
                      </small>
                    </div>
                  </div>

                  <div className="shipping-info">
                    <span>DELIVERY TO</span>

                    <strong>
                      {order.shipping_name}
                    </strong>

                    <p>
                      {order.shipping_phone}
                      <br />
                      {order.shipping_address}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
      .order-id-link {
  color: #111;
  text-decoration: none;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 1px;
}

.order-id-link:hover {
  opacity: 0.55;
}
      .order-status-group {
  margin: 20px 25px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.order-status-group .order-status {
  margin: 0;
}

.payment-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1px;
}

.payment-pending {
  background: #f5efe0;
  color: #806321;
}

.payment-verified {
  background: #e7f2ea;
  color: #2d6845;
}

.payment-failed {
  background: #f5e4e4;
  color: #963434;
}
        .orders-page {
          min-height: 100vh;
          background: #f7f6f2;
          color: #111;
          padding: 70px 5% 100px;
        }

        .orders-container {
          width: min(1100px, 100%);
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #777;
          text-decoration: none;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.5px;
          margin-bottom: 55px;
        }

        .back-link:hover {
          color: #111;
        }

        .orders-header {
          margin-bottom: 45px;
        }

        .orders-eyebrow {
          display: block;
          color: #999;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 14px;
        }

        .orders-header h1 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(42px, 7vw, 76px);
          font-weight: 400;
          letter-spacing: -3px;
        }

        .orders-header h1 em {
          font-style: italic;
        }

        .orders-header p {
          margin-top: 16px;
          color: #777;
          font-size: 12px;
        }

        .orders-header strong {
          color: #111;
        }

        .orders-empty {
          min-height: 430px;
          background: #fff;
          border: 1px solid #e6e3dc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 50px 25px;
        }

        .orders-empty-icon {
          width: 68px;
          height: 68px;
          display: grid;
          place-items: center;
          border: 1px solid #ddd9d0;
          border-radius: 50%;
          margin-bottom: 25px;
        }

        .orders-empty > span {
          color: #999;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .orders-empty h2 {
          margin: 15px 0;
          font-family: Georgia, serif;
          font-size: 32px;
          font-weight: 400;
          line-height: 1.05;
        }

        .orders-empty p {
          max-width: 400px;
          color: #888;
          font-size: 12px;
          line-height: 1.7;
          margin-bottom: 25px;
        }

        .shop-orders-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 14px 20px;
          background: #111;
          color: #fff;
          text-decoration: none;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .orders-list {
          display: grid;
          gap: 22px;
        }

        .order-card {
          background: #fff;
          border: 1px solid #e6e3dc;
        }

        .order-top {
          padding: 22px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eeeae2;
        }

        .order-label {
          display: block;
          color: #999;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
        }

        .order-id {
          font-size: 13px;
          letter-spacing: 1px;
        }

        .order-date {
          color: #888;
          font-size: 10px;
        }

        .order-status {
          margin: 20px 25px 0;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          background: #f3f1ec;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .order-products {
          padding: 20px 25px;
          display: grid;
          gap: 12px;
        }

        .order-product {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px;
          background: #faf9f6;
        }

        .product-image {
          width: 64px;
          height: 78px;
          flex-shrink: 0;
          background: #eee;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .product-info strong {
          font-size: 12px;
        }

        .product-info span {
          color: #999;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .product-info small {
          color: #777;
          font-size: 9px;
        }

        .product-price {
          font-size: 12px;
          white-space: nowrap;
        }

        .order-bottom {
          padding: 22px 25px;
          border-top: 1px solid #eeeae2;
          border-bottom: 1px solid #eeeae2;
          display: flex;
          justify-content: space-between;
          gap: 30px;
        }

        .payment-info {
          width: 300px;
          display: grid;
          gap: 9px;
        }

        .payment-info > div {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .payment-info span,
        .cod-box > span {
          color: #999;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .payment-info strong {
          font-size: 11px;
        }

        .total-row {
          margin-top: 6px;
          padding-top: 10px;
          border-top: 1px solid #ddd9d0;
        }

        .total-row strong {
          font-size: 15px;
        }

        .cod-box {
          min-width: 190px;
          padding: 15px;
          background: #f5f3ee;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .cod-box strong {
          font-size: 12px;
        }

        .cod-box small {
          color: #888;
          font-size: 8px;
          margin-bottom: 5px;
        }

        .shipping-info {
          padding: 22px 25px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .shipping-info > span {
          color: #999;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .shipping-info > strong {
          font-size: 11px;
        }

        .shipping-info p {
          margin: 0;
          color: #777;
          font-size: 10px;
          line-height: 1.7;
        }

        @media (max-width: 650px) {
        .order-status-group {
    margin-left: 18px;
    margin-right: 18px;
  }
          .orders-page {
            padding: 35px 4% 70px;
          }

          .back-link {
            margin-bottom: 35px;
          }

          .orders-header h1 {
            letter-spacing: -2px;
          }

          .order-top {
            padding: 18px;
          }

          .order-status {
            margin-left: 18px;
            margin-right: 18px;
          }

          .order-products {
            padding: 15px 18px;
          }

          .order-product {
            padding: 9px;
          }

          .product-image {
            width: 55px;
            height: 68px;
          }

          .product-price {
            font-size: 10px;
          }

          .order-bottom {
            padding: 18px;
            flex-direction: column;
          }

          .payment-info {
            width: 100%;
          }

          .cod-box {
            width: 100%;
            min-width: 0;
          }

          .shipping-info {
            padding: 18px;
          }
        }
      `}</style>
    </>
  );
}