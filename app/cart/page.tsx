"use client";

import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  stock: number;
  createdAt: string;
  sales: number;
  views: number;
  cartAdds: number;
  wishlistCount: number;
  featured?: boolean;
};

type CartItem = Product & {
  quantity: number;
};

const CART_KEY = "a_positive_cart";
const WISHLIST_KEY = "a_positive_wishlist";

const formatPrice = (price: number) => {
  return `৳${price.toLocaleString("en-BD")}`;
};

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [stockError, setStockError] =
  useState("");

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const savedWishlist = localStorage.getItem(WISHLIST_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
  const safeCart = parsedCart
    .filter(
      (item) =>
        item &&
        item.id
    )
    .map((item) => {
      const stock = Math.max(
        0,
        Number(item.stock) || 0
      );

      const quantity = Math.max(
        1,
        Number(item.quantity) || 1
      );

      return {
        ...item,
        stock,
        quantity:
          stock > 0
            ? Math.min(
                quantity,
                stock
              )
            : quantity,
      };
    });

  setCart(safeCart);
}
      }

      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);

        if (Array.isArray(parsedWishlist)) {
          setWishlist(parsedWishlist);
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      window.dispatchEvent(
        new Event("a_positive_cart_updated")
      );
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cart, loaded]);

  useEffect(() => {
    try {
      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(wishlist)
      );
    } catch (error) {
      console.error("Failed to save wishlist:", error);
    }
  }, [wishlist]);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cart]);

  const deliveryCharge = cart.length > 0 ? 150 : 0;

  const total = subtotal + deliveryCharge;

  const totalItems = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cart]);
  const hasStockIssue = cart.some(
  (item) =>
    item.stock <= 0 ||
    item.quantity > item.stock
);

  const updateQuantity = (
  productId: string,
  change: number
) => {
  setStockError("");

  setCart((currentCart) =>
    currentCart
      .map((item) => {
        if (
          item.id !== productId
        ) {
          return item;
        }

        // Product is out of stock.
        if (item.stock <= 0) {
          return item;
        }

        const nextQuantity =
          item.quantity +
          change;

        if (nextQuantity <= 0) {
          return null;
        }

        return {
          ...item,
          quantity: Math.min(
            nextQuantity,
            item.stock
          ),
        };
      })
      .filter(Boolean) as CartItem[]
  );
};

  const removeItem = (productId: string) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== productId
      )
    );
  };

  const moveToWishlist = (product: CartItem) => {
    setWishlist((currentWishlist) => {
      if (currentWishlist.includes(product.id)) {
        return currentWishlist;
      }

      return [
        ...currentWishlist,
        product.id,
      ];
    });

    removeItem(product.id);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((currentWishlist) => {
      if (currentWishlist.includes(productId)) {
        return currentWishlist.filter(
          (id) => id !== productId
        );
      }

      return [
        ...currentWishlist,
        productId,
      ];
    });
  };

  const proceedToCheckout = () => {
  if (cart.length === 0) {
    return;
  }

  const invalidItems =
    cart.filter(
      (item) =>
        item.stock <= 0 ||
        item.quantity > item.stock
    );

  if (invalidItems.length > 0) {
    setStockError(
      "Some items in your bag are out of stock or have a quantity higher than the available stock."
    );

    setCart((currentCart) =>
      currentCart.map(
        (item) => ({
          ...item,
          quantity:
            item.stock > 0
              ? Math.min(
                  item.quantity,
                  item.stock
                )
              : item.quantity,
        })
      )
    );

    return;
  }

  setStockError("");

  router.push("/checkout");
};

  if (!loaded) {
    return (
      <main className="cart-page loading-page">
        <div className="loader">
          LOADING CART
        </div>

        <style jsx>{`
        .product-stock {
  display: block;
  margin-top: 7px;
  color: #777168;
  font-size: 6px;
  font-weight: 900;
  letter-spacing: 1.2px;
}

.product-stock.low {
  color: #9a7841;
}

.product-stock.out {
  color: #a13d3d;
}

.stock-error {
  margin-bottom: 18px;
  padding: 12px 13px;
  border: 1px solid #ead1d1;
  background: #f8eaea;
  color: #963434;
  font-size: 8px;
  line-height: 1.6;
}

.checkout-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
          .cart-page {
            min-height: 100vh;
            background: #faf9f6;
            color: #11100e;
            display: grid;
            place-items: center;
          }

          .loader {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 3px;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="cart-page">
      {/* HEADER */}
      <header className="cart-header">
        <div className="header-left">
          <Link
            href="/"
            className="back-button"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div className="brand-name">
              A-POSITIVE
            </div>

            <div className="page-label">
              SHOPPING BAG
            </div>
          </div>
        </div>

        <div className="header-count">
          {totalItems}{" "}
          {totalItems === 1
            ? "ITEM"
            : "ITEMS"}
        </div>
      </header>

      {/* CONTENT */}
      <section className="cart-container">
        {cart.length === 0 ? (
          <motion.div
            className="empty-cart"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <div className="empty-icon">
              <ShoppingBag size={30} />
            </div>

            <span className="eyebrow">
              YOUR SHOPPING BAG
            </span>

            <h1>
              YOUR BAG IS
              <br />
              <em>EMPTY.</em>
            </h1>

            <p>
              Discover something you love
              and add it to your bag.
            </p>

            <Link
              href="/"
              className="shop-button"
            >
              CONTINUE SHOPPING
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="page-heading">
              <div>
                <span className="eyebrow">
                  A-POSITIVE
                </span>

                <h1>
                  YOUR <em>BAG.</em>
                </h1>
              </div>

              <p>
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "items"}{" "}
                selected
              </p>
            </div>

            <div className="cart-layout">
              {/* ITEMS */}
              <div className="cart-items">
                {cart.map((item, index) => {
                  const isLiked =
                    wishlist.includes(item.id);

                  return (
                    <motion.article
                      key={item.id}
                      className="cart-item"
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                    >
                      {/* IMAGE */}
                      <Link
                        href={`/products/${item.id}`}
                        className="product-image"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                        />

                        {item.stock > 0 &&
                          item.stock <= 5 && (
                            <span className="stock-badge">
                              LOW STOCK
                            </span>
                          )}
                      </Link>

                      {/* DETAILS */}
                      <div className="product-details">
                        <div className="product-top">
                          <div>
                            <span className="product-brand">
                              {item.brand}
                            </span>

                            <Link
                              href={`/products/${item.id}`}
                              className="product-name"
                            >
                              {item.name}
                            </Link>

                           <span
  className={
    item.stock <= 0
      ? "product-stock out"
      : item.stock <= 5
      ? "product-stock low"
      : "product-stock"
  }
>
  {item.stock <= 0
    ? "OUT OF STOCK"
    : `${item.stock} AVAILABLE`}
</span>
                          </div>

                          <button
                            className="remove-button"
                            onClick={() =>
                              removeItem(
                                item.id
                              )
                            }
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>

                        <div className="product-bottom">
                          <div className="quantity-control">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  -1
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>

                            <span>
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  1
                                )
                              }
                              disabled={
  item.stock <= 0 ||
  item.quantity >=
    item.stock
}
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="item-price">
                            {formatPrice(
                              item.price *
                                item.quantity
                            )}
                          </div>
                        </div>

                        <div className="item-actions">
                          <button
                            className={
                              isLiked
                                ? "liked"
                                : ""
                            }
                            onClick={() =>
                              toggleWishlist(
                                item.id
                              )
                            }
                          >
                            <Heart
                              size={14}
                              fill={
                                isLiked
                                  ? "currentColor"
                                  : "none"
                              }
                            />

                            {isLiked
                              ? "IN WISHLIST"
                              : "SAVE FOR LATER"}
                          </button>

                          {!isLiked && (
                            <button
                              onClick={() =>
                                moveToWishlist(
                                  item
                                )
                              }
                            >
                              MOVE TO WISHLIST
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>

              {/* SUMMARY */}
              <aside className="summary">
                <div className="summary-inner">
                  <div className="summary-title">
                    ORDER SUMMARY
                  </div>

                  <div className="summary-row">
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatPrice(
                        subtotal
                      )}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>
                      Delivery
                    </span>

                    <strong>
                      {formatPrice(
                        deliveryCharge
                      )}
                    </strong>
                  </div>

                  <div className="summary-divider" />

                  <div className="summary-total">
                    <span>
                      TOTAL
                    </span>

                    <strong>
                      {formatPrice(total)}
                    </strong>
                  </div>
                  {(stockError ||
  hasStockIssue) && (
  <div
    className="stock-error"
    role="alert"
  >
    {stockError ||
      "Please update your cart because one or more items are unavailable."}
  </div>
)}

                  <p className="payment-note">
                    Delivery charge is ৳150.
                    <br />
                    Pay only ৳150 in advance
                    via bKash. Product amount
                    remains Cash on Delivery.
                  </p>

                 <button
  className="checkout-button"
  onClick={proceedToCheckout}
  disabled={hasStockIssue}
>
                    PROCEED TO CHECKOUT
                    <ArrowRight size={17} />
                  </button>

                  <Link
                    href="/"
                    className="continue-shopping"
                  >
                    <ArrowLeft size={14} />
                    CONTINUE SHOPPING
                  </Link>
                </div>
              </aside>
            </div>
          </>
        )}
      </section>

      {/* FOOTER */}
      <footer className="cart-footer">
        <div>
          <strong>
            A-POSITIVE
          </strong>

          <span>
            WEAR YOUR POSITIVITY.
          </span>
        </div>

        <span>
          © 2026 A-POSITIVE • ALL RIGHTS RESERVED
        </span>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .cart-page {
          min-height: 100vh;
          background: #faf9f6;
          color: #11100e;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .cart-header {
          min-height: 82px;
          padding: 0 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #dedbd3;
          background: #ffffff;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .back-button {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 1px solid #d8d5ce;
          color: #11100e;
          text-decoration: none;
          transition: 0.25s ease;
        }

        .back-button:hover {
          background: #11100e;
          color: #ffffff;
        }

        .brand-name {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 3px;
        }

        .page-label {
          margin-top: 4px;
          color: #88837a;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .header-count {
          color: #777168;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .cart-container {
          width: min(1380px, 90%);
          margin: 0 auto;
          padding: 65px 0 100px;
        }

        .page-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 45px;
        }

        .eyebrow {
          display: block;
          margin-bottom: 10px;
          color: #9a7841;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 3px;
        }

        .page-heading h1,
        .empty-cart h1 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(38px, 5vw, 68px);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: -2px;
        }

        .page-heading h1 em,
        .empty-cart h1 em {
          color: #b18a4b;
          font-style: italic;
        }

        .page-heading > p {
          margin: 0;
          color: #88837a;
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .cart-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 390px;
          gap: 55px;
          align-items: start;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 190px minmax(0, 1fr);
          gap: 25px;
          padding: 0 0 25px;
          margin-bottom: 25px;
          border-bottom: 1px solid #dedbd3;
        }

        .product-image {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 0.82;
          overflow: hidden;
          background: #eeeae2;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-image:hover img {
          transform: scale(1.04);
        }

        .stock-badge {
          position: absolute;
          left: 10px;
          top: 10px;
          padding: 6px 8px;
          background: #11100e;
          color: #ffffff;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .product-details {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3px 0;
        }

        .product-top {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .product-brand {
          display: block;
          margin-bottom: 9px;
          color: #a17d43;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .product-name {
          display: block;
          color: #11100e;
          font-family: Georgia, serif;
          font-size: 24px;
          line-height: 1.1;
          text-decoration: none;
        }

        .product-category {
          display: block;
          margin-top: 8px;
          color: #969087;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .remove-button {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border: 0;
          background: transparent;
          color: #8c8780;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .remove-button:hover {
          color: #11100e;
        }

        .product-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 35px;
        }

        .quantity-control {
          height: 38px;
          display: flex;
          align-items: center;
          border: 1px solid #d8d5ce;
          background: #ffffff;
        }

        .quantity-control button {
          width: 38px;
          height: 100%;
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: #11100e;
          cursor: pointer;
        }

        .quantity-control button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .quantity-control span {
          min-width: 30px;
          text-align: center;
          font-size: 11px;
          font-weight: 800;
        }

        .item-price {
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .item-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 20px;
        }

        .item-actions button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #8b857d;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.3px;
          cursor: pointer;
        }

        .item-actions button:hover,
        .item-actions button.liked {
          color: #9b753c;
        }

        .summary {
          position: sticky;
          top: 25px;
        }

        .summary-inner {
          padding: 30px;
          background: #ffffff;
          border: 1px solid #dedbd3;
        }

        .summary-title {
          margin-bottom: 30px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2.5px;
        }

        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 16px;
        }

        .summary-row span {
          color: #777168;
          font-size: 9px;
          letter-spacing: 0.5px;
        }

        .summary-row strong {
          font-size: 10px;
        }

        .summary-divider {
          height: 1px;
          margin: 25px 0;
          background: #dedbd3;
        }

        .summary-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .summary-total span {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .summary-total strong {
          font-size: 19px;
        }

        .payment-note {
          margin: 25px 0;
          padding: 14px;
          background: #f7f3ea;
          color: #756e63;
          font-size: 8px;
          line-height: 1.7;
        }

        .checkout-button {
          width: 100%;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 1px solid #11100e;
          background: #11100e;
          color: #ffffff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.8px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .checkout-button:hover {
          background: #b18a4b;
          border-color: #b18a4b;
        }

        .continue-shopping {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 20px;
          color: #777168;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.4px;
          text-decoration: none;
        }

        .continue-shopping:hover {
          color: #11100e;
        }

        .empty-cart {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .empty-icon {
          width: 72px;
          height: 72px;
          display: grid;
          place-items: center;
          margin-bottom: 25px;
          border: 1px solid #d8d5ce;
          color: #9b753c;
        }

        .empty-cart p {
          max-width: 360px;
          margin: 20px 0 30px;
          color: #88837a;
          font-size: 10px;
          line-height: 1.8;
        }

        .shop-button {
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 0 25px;
          background: #11100e;
          color: #ffffff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.5px;
          text-decoration: none;
        }

        .cart-footer {
          min-height: 100px;
          padding: 25px 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: #11100e;
          color: #ffffff;
        }

        .cart-footer div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .cart-footer strong {
          color: #c9a45c;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .cart-footer div span,
        .cart-footer > span {
          color: #777168;
          font-size: 6px;
          letter-spacing: 1.5px;
        }

        @media (max-width: 950px) {
          .cart-layout {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .summary {
            position: static;
          }

          .summary-inner {
            max-width: none;
          }
        }

        @media (max-width: 650px) {
          .cart-header {
            min-height: 72px;
            padding: 0 5%;
          }

          .cart-container {
            width: 90%;
            padding: 45px 0 70px;
          }

          .page-heading {
            align-items: flex-start;
            flex-direction: column;
            margin-bottom: 35px;
          }

          .page-heading h1,
          .empty-cart h1 {
            font-size: 43px;
          }

          .cart-item {
            grid-template-columns: 105px minmax(0, 1fr);
            gap: 15px;
          }

          .product-name {
            font-size: 17px;
          }

          .product-bottom {
            margin-top: 25px;
          }

          .item-price {
            font-size: 12px;
          }

          .summary-inner {
            padding: 23px;
          }

          .cart-footer {
            flex-direction: column;
            justify-content: center;
            text-align: center;
            padding: 30px 5%;
          }

          .cart-footer div {
            align-items: center;
          }
        }

        @media (max-width: 430px) {
          .header-count {
            font-size: 7px;
          }

          .cart-item {
            grid-template-columns: 90px minmax(0, 1fr);
          }

          .product-name {
            font-size: 15px;
          }

          .quantity-control {
            height: 34px;
          }

          .quantity-control button {
            width: 32px;
          }

          .quantity-control span {
            min-width: 25px;
          }

          .item-actions {
            gap: 10px;
          }

          .item-actions button {
            font-size: 6px;
          }
        }
      `}</style>
    </main>
  );
}