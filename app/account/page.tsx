"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  LogIn,
  LogOut,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AccountUser = {
  email: string;
  name: string;
  phone: string;
};

const supabase = createClient();

const CART_KEY = "a_positive_cart";
const WISHLIST_KEY = "a_positive_wishlist";

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<AccountUser | null>(null);

  const [cartCount, setCartCount] =
    useState(0);

  const [wishlistCount, setWishlistCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      try {
        setError("");

        /* =================================================
           GET CURRENT SESSION
        ================================================= */

        const {
          data: sessionData,
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "ACCOUNT SESSION ERROR:",
            sessionError
          );

          if (mounted) {
            setError(
              "Unable to check your login session."
            );
          }

          return;
        }

        const currentUser =
          sessionData.session?.user;

        /* =================================================
           LOGIN REQUIRED
        ================================================= */

        if (!currentUser) {
          router.replace(
            "/login?next=/account"
          );

          return;
        }

        if (!mounted) {
          return;
        }

        /* =================================================
           USER DATA
        ================================================= */

        const metadata =
          currentUser.user_metadata ?? {};

        setUser({
          email:
            currentUser.email ?? "",

          name:
            String(
              metadata.full_name ??
                metadata.name ??
                ""
            ),

          phone:
            String(
              metadata.phone ??
                ""
            ),
        });

        loadLocalCounts();
      } catch (err) {
        console.error(
          "ACCOUNT LOAD ERROR:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your account."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    function loadLocalCounts() {
      try {
        /* ===============================================
           CART COUNT
        =============================================== */

        const savedCart =
          localStorage.getItem(
            CART_KEY
          );

        if (savedCart) {
          const parsed =
            JSON.parse(
              savedCart
            );

          if (Array.isArray(parsed)) {
            const count =
              parsed.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  Math.max(
                    1,
                    Number(
                      item?.quantity
                    ) || 1
                  ),
                0
              );

            setCartCount(count);
          } else {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }

        /* ===============================================
           WISHLIST COUNT
        =============================================== */

        const savedWishlist =
          localStorage.getItem(
            WISHLIST_KEY
          );

        if (savedWishlist) {
          const parsed =
            JSON.parse(
              savedWishlist
            );

          if (Array.isArray(parsed)) {
            setWishlistCount(
              parsed.length
            );
          } else {
            setWishlistCount(0);
          }
        } else {
          setWishlistCount(0);
        }
      } catch (err) {
        console.error(
          "ACCOUNT LOCAL DATA ERROR:",
          err
        );

        setCartCount(0);
        setWishlistCount(0);
      }
    }

    function handleStorageUpdate() {
      loadLocalCounts();
    }

    loadAccount();

    window.addEventListener(
      "storage",
      handleStorageUpdate
    );

    window.addEventListener(
      "a_positive_cart_updated",
      handleStorageUpdate
    );

    window.addEventListener(
      "a_positive_wishlist_updated",
      handleStorageUpdate
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "storage",
        handleStorageUpdate
      );

      window.removeEventListener(
        "a_positive_cart_updated",
        handleStorageUpdate
      );

      window.removeEventListener(
        "a_positive_wishlist_updated",
        handleStorageUpdate
      );
    };
  }, [router]);

  /* =====================================================
     LOGOUT
  ====================================================== */

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    setError("");

    try {
      const {
        error: logoutError,
      } =
        await supabase.auth.signOut();

      if (logoutError) {
        throw new Error(
          logoutError.message
        );
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error(
        "LOGOUT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to log out."
      );

      setLoggingOut(false);
    }
  }

  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <main className="account-page">
        <div className="account-loading">
          LOADING ACCOUNT...
        </div>

        <style jsx>{`
          .account-page {
            min-height: 100vh;
            background: #f7f6f2;
          }

          .account-loading {
            min-height: 70vh;
            display: grid;
            place-items: center;
            color: #999;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 2px;
          }
        `}</style>
      </main>
    );
  }

  /* =====================================================
     PAGE
  ====================================================== */

  return (
    <main className="account-page">
      <div className="account-container">

        {/* BACK */}

        <Link
          href="/"
          className="account-back"
        >
          <ArrowLeft size={15} />
          BACK TO A-POSITIVE
        </Link>

        {/* HEADER */}

        <header className="account-header">
          <span>
            A-POSITIVE / MY ACCOUNT
          </span>

          <h1>
            MY
            <br />
            <em>ACCOUNT.</em>
          </h1>

          <p>
            Manage your A-POSITIVE shopping
            activity from one place.
          </p>
        </header>

        {/* ERROR */}

        {error && (
          <div
            className="account-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* PROFILE */}

        <section className="account-profile">
          <div className="account-avatar">
            <UserRound size={25} />
          </div>

          <div className="account-profile-info">
            <span>
              SIGNED IN AS
            </span>

            <h2>
              {user?.name ||
                "A-POSITIVE CUSTOMER"}
            </h2>

            <p>
              {user?.email}
            </p>
          </div>
        </section>

        {/* =================================================
            SHOPPING LOGIN NOTICE
        ================================================= */}

        <section className="account-shopping-notice">
          <div className="shopping-notice-icon">
            <LogIn size={18} />
          </div>

          <div className="shopping-notice-content">
            <span>
              SHOPPING ACCESS
            </span>

            <h2>
              LOGIN REQUIRED FOR SHOPPING.
            </h2>

            <p>
              You must be signed in to your
              A-POSITIVE account to add products
              to your bag, continue to checkout,
              and place an order.
            </p>
          </div>

          <div className="shopping-notice-status">
            <span>ACCOUNT STATUS</span>

            <strong>
              SIGNED IN
            </strong>
          </div>
        </section>

        {/* DETAILS */}

        <section className="account-card">
          <div className="account-card-heading">
            <div>
              <span>
                PROFILE
              </span>

              <h2>
                YOUR
                <br />
                <em>DETAILS.</em>
              </h2>
            </div>

            <UserRound size={19} />
          </div>

          <div className="account-detail-grid">
            <div>
              <span>
                EMAIL
              </span>

              <strong>
                {user?.email || "—"}
              </strong>
            </div>

            <div>
              <span>
                NAME
              </span>

              <strong>
                {user?.name ||
                  "Not added"}
              </strong>
            </div>

            <div>
              <span>
                PHONE
              </span>

              <strong>
                {user?.phone ||
                  "Not added"}
              </strong>
            </div>
          </div>
        </section>

        {/* QUICK LINKS */}

        <section className="account-actions">

          <Link
            href="/orders"
            className="account-action"
          >
            <div className="account-action-icon">
              <ShoppingBag size={19} />
            </div>

            <div>
              <span>
                SHOPPING
              </span>

              <strong>
                MY ORDERS
              </strong>

              <small>
                View your order history
              </small>
            </div>

            <div className="account-action-right">
              <ArrowRight size={15} />
            </div>
          </Link>

          <Link
            href="/wishlist"
            className="account-action"
          >
            <div className="account-action-icon">
              <Heart size={19} />
            </div>

            <div>
              <span>
                SAVED ITEMS
              </span>

              <strong>
                WISHLIST
                {wishlistCount > 0
                  ? ` (${wishlistCount})`
                  : ""}
              </strong>

              <small>
                Your saved pieces
              </small>
            </div>

            <div className="account-action-right">
              <ArrowRight size={15} />
            </div>
          </Link>

          <Link
            href="/cart"
            className="account-action"
          >
            <div className="account-action-icon">
              <ShoppingBag size={19} />
            </div>

            <div>
              <span>
                SHOPPING BAG
              </span>

              <strong>
                MY CART
                {cartCount > 0
                  ? ` (${cartCount})`
                  : ""}
              </strong>

              <small>
                Items ready for checkout
              </small>
            </div>

            <div className="account-action-right">
              <ArrowRight size={15} />
            </div>
          </Link>

        </section>

        {/* SHOPPING CTA */}

        <section className="account-shopping-cta">
          <div>
            <span>
              READY TO SHOP?
            </span>

            <h2>
              EXPLORE THE
              <br />
              <em>COLLECTION.</em>
            </h2>
          </div>

          <Link
            href="/#product-explorer"
            className="account-shopping-button"
          >
            START SHOPPING
            <ArrowRight size={15} />
          </Link>
        </section>

        {/* LOGOUT */}

        <button
          type="button"
          className="account-logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut size={14} />

          {loggingOut
            ? "LOGGING OUT..."
            : "LOG OUT"}
        </button>

      </div>

      <style jsx>{`
        .account-page {
          min-height: 100vh;
          padding: 55px 5% 100px;
          background: #f7f6f2;
          color: #111;
        }

        .account-container {
          width: min(1050px, 100%);
          margin: 0 auto;
        }

        .account-back {
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

        .account-back:hover {
          opacity: 0.5;
        }

        .account-header {
          margin-top: 55px;
        }

        .account-header > span {
          display: block;
          margin-bottom: 15px;
          color: #999;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .account-header h1 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(
            52px,
            8vw,
            90px
          );
          line-height: 0.87;
          font-weight: 400;
          letter-spacing: -4px;
        }

        .account-header h1 em {
          font-style: italic;
        }

        .account-header p {
          max-width: 450px;
          margin-top: 20px;
          color: #777;
          font-size: 10px;
          line-height: 1.8;
        }

        .account-error {
          margin-top: 25px;
          padding: 13px 15px;
          background: #f8eaea;
          border: 1px solid #ead3d3;
          color: #963434;
          font-size: 8px;
        }

        .account-profile {
          margin-top: 35px;
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 17px;
          border: 1px solid #e4e0d8;
          background: #fff;
        }

        .account-avatar {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid #ddd9d0;
          border-radius: 50%;
          color: #777;
          background: #f7f5f0;
        }

        .account-profile-info > span {
          display: block;
          margin-bottom: 5px;
          color: #999;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .account-profile-info h2 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 22px;
          font-weight: 400;
        }

        .account-profile-info p {
          margin: 5px 0 0;
          color: #777;
          font-size: 9px;
        }

        /* ================================================
           SHOPPING NOTICE
        ================================================ */

        .account-shopping-notice {
          margin-top: 18px;
          padding: 22px 24px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 18px;
          border: 1px solid #d9d0bc;
          background:
            linear-gradient(
              135deg,
              #fffdf8 0%,
              #f8f3e7 100%
            );
        }

        .shopping-notice-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border: 1px solid #d8c6a1;
          background: #fff;
          color: #9a7b3d;
        }

        .shopping-notice-content > span {
          display: block;
          margin-bottom: 6px;
          color: #a0844d;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1.6px;
        }

        .shopping-notice-content h2 {
          margin: 0;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .shopping-notice-content p {
          max-width: 650px;
          margin: 7px 0 0;
          color: #777;
          font-size: 8px;
          line-height: 1.7;
        }

        .shopping-notice-status {
          min-width: 110px;
          padding-left: 18px;
          border-left: 1px solid #e0d6c3;
        }

        .shopping-notice-status span {
          display: block;
          margin-bottom: 6px;
          color: #999;
          font-size: 5.5px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .shopping-notice-status strong {
          color: #286344;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .account-card {
          margin-top: 18px;
          padding: 25px;
          border: 1px solid #e4e0d8;
          background: #fff;
        }

        .account-card-heading {
          margin-bottom: 23px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .account-card-heading div > span {
          display: block;
          margin-bottom: 8px;
          color: #999;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1.6px;
        }

        .account-card-heading h2 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 27px;
          line-height: 0.9;
          font-weight: 400;
          letter-spacing: -1px;
        }

        .account-card-heading h2 em {
          font-style: italic;
        }

        .account-detail-grid {
          display: grid;
          grid-template-columns: repeat(
            3,
            1fr
          );
          gap: 10px;
        }

        .account-detail-grid > div {
          min-height: 75px;
          padding: 14px;
          border: 1px solid #ece8e1;
          background: #faf9f7;
        }

        .account-detail-grid span {
          display: block;
          margin-bottom: 7px;
          color: #999;
          font-size: 5.5px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .account-detail-grid strong {
          display: block;
          color: #333;
          font-size: 9px;
          line-height: 1.5;
          word-break: break-word;
        }

        .account-actions {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(
            3,
            1fr
          );
          gap: 12px;
        }

        .account-action {
          min-height: 155px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid #e4e0d8;
          background: #fff;
          color: #111;
          text-decoration: none;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .account-action:hover {
          transform: translateY(-3px);
          box-shadow:
            0 16px 35px
            rgba(17, 17, 17, 0.07);
        }

        .account-action-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border: 1px solid #ddd9d0;
          color: #555;
        }

        .account-action > div:nth-child(2) span {
          display: block;
          margin-bottom: 5px;
          color: #999;
          font-size: 5.5px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .account-action > div:nth-child(2) strong {
          display: block;
          font-family: Georgia, serif;
          font-size: 18px;
          font-weight: 400;
        }

        .account-action > div:nth-child(2) small {
          display: block;
          margin-top: 5px;
          color: #888;
          font-size: 7px;
        }

        .account-action-right {
          align-self: flex-end;
          color: #777;
        }

        /* ================================================
           SHOPPING CTA
        ================================================ */

        .account-shopping-cta {
          margin-top: 18px;
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          border: 1px solid #111;
          background: #111;
          color: #fff;
        }

        .account-shopping-cta span {
          display: block;
          margin-bottom: 8px;
          color: #c8a45d;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }

        .account-shopping-cta h2 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 27px;
          line-height: 0.92;
          font-weight: 400;
        }

        .account-shopping-cta h2 em {
          font-style: italic;
        }

        .account-shopping-button {
          min-height: 44px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #c8a45d;
          background: #c8a45d;
          color: #111;
          text-decoration: none;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.2px;
          white-space: nowrap;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .account-shopping-button:hover {
          background: transparent;
          color: #fff;
        }

        .account-logout {
          width: 100%;
          min-height: 46px;
          margin-top: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #111;
          background: #111;
          color: #fff;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.5px;
          transition:
            background 0.25s ease,
            color 0.25s ease;
          cursor: pointer;
        }

        .account-logout:hover:not(:disabled) {
          background: transparent;
          color: #111;
        }

        .account-logout:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 850px) {
          .account-shopping-notice {
            grid-template-columns:
              auto minmax(0, 1fr);
          }

          .shopping-notice-status {
            grid-column: 2;
            padding-left: 0;
            padding-top: 12px;
            border-left: 0;
            border-top: 1px solid #e0d6c3;
          }
        }

        @media (max-width: 750px) {
          .account-actions {
            grid-template-columns: 1fr;
          }

          .account-action {
            min-height: 125px;
          }

          .account-shopping-cta {
            align-items: flex-start;
            flex-direction: column;
          }

          .account-shopping-button {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .account-page {
            padding: 35px 4% 70px;
          }

          .account-header {
            margin-top: 42px;
          }

          .account-header h1 {
            letter-spacing: -3px;
          }

          .account-profile {
            padding: 18px;
          }

          .account-detail-grid {
            grid-template-columns: 1fr;
          }

          .account-card {
            padding: 20px;
          }

          .account-shopping-notice {
            padding: 18px;
            grid-template-columns: 1fr;
          }

          .shopping-notice-status {
            grid-column: auto;
          }

          .account-shopping-cta {
            padding: 22px;
          }

          .account-shopping-cta h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </main>
  );
}