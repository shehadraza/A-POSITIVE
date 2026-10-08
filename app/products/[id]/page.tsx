"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import { createClient } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  stock: number;
  featured: boolean;
  sizes: string[];
};

type CartItem = {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  category: string;
  stock: number;
  quantity: number;
  size: string;
  product: Product;
};

const supabase = createClient();

const CART_KEY = "a_positive_cart";
const WISHLIST_KEY = "a_positive_wishlist";

/* =========================================================
   HELPERS
========================================================= */

function money(value: number) {
  return `৳${Number(value || 0).toLocaleString("en-BD")}`;
}

function normalizeSizes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function normalizeProduct(row: any): Product {
  return {
    id: String(row?.id ?? ""),
    name: String(
      row?.name ?? "Untitled Product"
    ),
    brand:
      row?.brand === null ||
      row?.brand === undefined
        ? null
        : String(row.brand),
    category:
      row?.category === null ||
      row?.category === undefined
        ? null
        : String(row.category),
    price: Number(row?.price ?? 0),
    old_price:
      row?.old_price === null ||
      row?.old_price === undefined
        ? null
        : Number(row.old_price),
    image_url:
      row?.image_url ?? null,
    stock: Number(row?.stock ?? 0),
    featured: Boolean(row?.featured),
    sizes: normalizeSizes(row?.sizes),
  };
}

/* =========================================================
   NORMALIZE CART
========================================================= */

function normalizeStoredCartItem(
  item: any
): CartItem | null {
  if (
    !item ||
    typeof item !== "object"
  ) {
    return null;
  }

  const nestedProduct =
    item.product &&
    typeof item.product === "object"
      ? item.product
      : null;

  const productId = String(
    item.productId ??
      nestedProduct?.id ??
      item.id ??
      ""
  );

  if (!productId) {
    return null;
  }

  const productSource =
    nestedProduct ?? item;

  if (!productSource?.name) {
    return null;
  }

  const product: Product = {
    id: productId,
    name: String(
      productSource.name
    ),
    brand:
      productSource.brand ??
      "A-POSITIVE",
    category:
      productSource.category ??
      "FASHION",
    price: Number(
      productSource.price ?? 0
    ),
    old_price:
      productSource.old_price !==
        undefined &&
      productSource.old_price !==
        null
        ? Number(
            productSource.old_price
          )
        : null,
    image_url:
      productSource.image_url ??
      productSource.image ??
      "",
    stock: Number(
      productSource.stock ?? 0
    ),
    featured: Boolean(
      productSource.featured
    ),
    sizes: normalizeSizes(
      productSource.sizes
    ),
  };

  return {
    id: String(
      item.id ??
        `${product.id}-${item.size ?? ""}`
    ),

    productId:
      product.id,

    name:
      product.name,

    brand:
      product.brand ??
      "A-POSITIVE",

    price:
      String(product.price),

    image:
      product.image_url ?? "",

    category:
      product.category ??
      "FASHION",

    stock:
      product.stock,

    quantity: Math.max(
      1,
      Number(
        item.quantity ?? 1
      )
    ),

    size:
      item.size
        ? String(item.size)
        : "",

    product,
  };
}

/* =========================================================
   CART ITEM CREATOR
========================================================= */

function productToCartItem(
  product: Product,
  quantity: number,
  size: string
): CartItem {
  return {
    id:
      `${product.id}-${size || "default"}`,

    productId:
      product.id,

    name:
      product.name,

    brand:
      product.brand ??
      "A-POSITIVE",

    price:
      String(product.price),

    image:
      product.image_url ??
      "",

    category:
      product.category ??
      "FASHION",

    stock:
      Number(product.stock) || 0,

    quantity,

    size,

    product,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const productId = String(
    params?.id ?? ""
  );

  const [product, setProduct] =
    useState<Product | null>(null);

  const [relatedProducts, setRelatedProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedSize, setSelectedSize] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [liked, setLiked] =
    useState(false);

  const [notice, setNotice] =
    useState("");

  const [adding, setAdding] =
    useState(false);

  /* =======================================================
     LOAD PRODUCT
  ======================================================= */

  useEffect(() => {
    if (!productId) {
      return;
    }

    let cancelled = false;

    async function loadProduct() {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select(
          "id,name,brand,category,price,old_price,image_url,stock,featured,sizes"
        )
        .eq(
          "id",
          productId
        )
        .maybeSingle();

      if (
        cancelled
      ) {
        return;
      }

      if (
        error ||
        !data
      ) {
        console.error(
          "PRODUCT LOAD ERROR:",
          error
        );

        setProduct(null);
        setLoading(false);

        return;
      }

      const normalized =
        normalizeProduct(
          data
        );

      setProduct(
        normalized
      );

      if (
        normalized.sizes.length >
          0
      ) {
        setSelectedSize(
          normalized.sizes[0]
        );
      } else {
        setSelectedSize("");
      }

      setQuantity(1);

      setLoading(false);

      /* -----------------------------------------------
         RELATED PRODUCTS
      ------------------------------------------------ */

      if (normalized.brand) {
        const {
          data: relatedData,
        } = await supabase
          .from("products")
          .select(
            "id,name,brand,category,price,old_price,image_url,stock,featured,sizes"
          )
          .eq(
            "brand",
            normalized.brand
          )
          .neq(
            "id",
            normalized.id
          )
          .order(
            "featured",
            {
              ascending: false,
            }
          )
          .limit(4);

        if (
          !cancelled
        ) {
          setRelatedProducts(
            (relatedData ??
              []).map(
              normalizeProduct
            )
          );
        }
      }
    }

    loadProduct();

    const channel =
      supabase
        .channel(
          `product-page-${productId}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "products",
            filter: `id=eq.${productId}`,
          },
          () => {
            loadProduct();
          }
        )
        .subscribe();

    return () => {
      cancelled = true;

      supabase.removeChannel(
        channel
      );
    };
  }, [productId]);

  /* =======================================================
     LOAD WISHLIST
  ======================================================= */

  useEffect(() => {
    const saved =
      localStorage.getItem(
        WISHLIST_KEY
      );

    if (!saved) {
      return;
    }

    try {
      const parsed =
        JSON.parse(saved);

      if (
        Array.isArray(parsed)
      ) {
        setLiked(
          parsed
            .map(String)
            .includes(
              productId
            )
        );
      }
    } catch {
      setLiked(false);
    }
  }, [productId]);

  /* =======================================================
     NOTICE
  ======================================================= */

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setNotice("");
      }, 3200);

    return () =>
      window.clearTimeout(
        timer
      );
  }, [notice]);

  /* =======================================================
     CART
  ======================================================= */

  const addToCart = async (
    goToCheckout = false
  ) => {
    if (!product) {
      return;
    }

    if (
      product.stock <= 0
    ) {
      setNotice(
        "This product is currently sold out."
      );

      return;
    }

    /* -----------------------------------------------
       LOGIN REQUIRED
    ------------------------------------------------ */

   

    /* -----------------------------------------------
       SIZE REQUIRED
    ------------------------------------------------ */

    if (
      product.sizes.length >
        0 &&
      !selectedSize
    ) {
      setNotice(
        "Please select a size first."
      );

      return;
    }

    setAdding(true);

    try {
      const saved =
        localStorage.getItem(
          CART_KEY
        );

      let cart: CartItem[] =
        [];

      if (saved) {
        try {
          cart =
            JSON.parse(saved)
              .map(
                normalizeStoredCartItem
              )
              .filter(
                (
                  item: any
                ): item is CartItem =>
                  Boolean(item)
              );
        } catch {
          cart = [];
        }
      }

      const size =
        selectedSize || "";

      const existingIndex =
        cart.findIndex(
          (item) =>
            item.productId ===
              product.id &&
            item.size === size
        );

      let nextCart: CartItem[];

      if (
        existingIndex >=
        0
      ) {
        nextCart =
          cart.map(
            (
              item,
              index
            ) => {
              if (
                index !==
                existingIndex
              ) {
                return item;
              }

              return productToCartItem(
                product,
                Math.min(
                  Number(
                    item.quantity
                  ) +
                    quantity,
                  Math.max(
                    product.stock,
                    1
                  )
                ),
                size
              );
            }
          );
      } else {
        nextCart = [
          ...cart,
          productToCartItem(
            product,
            Math.min(
              quantity,
              Math.max(
                product.stock,
                1
              )
            ),
            size
          ),
        ];
      }

      localStorage.setItem(
        CART_KEY,
        JSON.stringify(
          nextCart
        )
      );

      window.dispatchEvent(
        new Event(
          "a_positive_cart_updated"
        )
      );

      setNotice(
        product.sizes.length >
          0
          ? `${product.name} (${size}) added to your bag.`
          : `${product.name} added to your bag.`
      );

      if (
        goToCheckout
      ) {
        router.push(
          "/checkout"
        );
      }
    } finally {
      setAdding(false);
    }
  };

  /* =======================================================
     WISHLIST
  ======================================================= */

  function toggleWishlist() {
    if (!product) {
      return;
    }

    const saved =
      localStorage.getItem(
        WISHLIST_KEY
      );

    let ids: string[] =
      [];

    if (saved) {
      try {
        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(parsed)
        ) {
          ids =
            parsed.map(
              String
            );
        }
      } catch {
        ids = [];
      }
    }

    const next =
      ids.includes(
        product.id
      )
        ? ids.filter(
            (id) =>
              id !==
              product.id
          )
        : [
            ...ids,
            product.id,
          ];

    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(
        next
      )
    );

    window.dispatchEvent(
      new Event(
        "a_positive_wishlist_updated"
      )
    );

    setLiked(
      next.includes(
        product.id
      )
    );
  }

  /* =======================================================
     BRAND ROUTE
  ======================================================= */

  const brandRoute =
    useMemo(() => {
      const brand =
        String(
          product?.brand ??
            ""
        )
          .toLowerCase()
          .replace(
            /\s+/g,
            "-"
          );

      if (
        brand.includes(
          "blue-dream"
        ) ||
        brand ===
          "blue-dream"
      ) {
        return "/brands/blue-dream";
      }

      if (
        brand.includes(
          "shopping-zone"
        )
      ) {
        return "/brands/shopping-zone-bd";
      }

      if (
        brand.includes(
          "a-positive"
        ) ||
        brand ===
          "a-positive"
      ) {
        return "/brands/a-positive";
      }

      return "/";
    }, [product]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="product-page">
        <div className="loading-screen">
          <div className="loading-brand">
            A-POSITIVE
          </div>

          <div className="loading-text">
            LOADING PRODUCT
          </div>
        </div>

        <style jsx global>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          .product-page {
            min-height: 100vh;
            background: #f8f7f3;
            color: #11100e;
          }

          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .loading-brand {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.07em;
          }

          .loading-text {
            margin-top: 10px;
            font-size: 9px;
            letter-spacing: 0.2em;
            opacity: 0.45;
          }
        `}</style>
      </main>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!product) {
    return (
      <main className="product-page">
        <div className="not-found">
          <div className="not-found-small">
            PRODUCT
          </div>

          <h1>
            Product not found.
          </h1>

          <Link href="/">
            <ArrowLeft size={15} />
            BACK TO SHOP
          </Link>
        </div>

        <style jsx global>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          .product-page {
            min-height: 100vh;
            background: #f8f7f3;
            color: #11100e;
          }

          .not-found {
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 30px;
          }

          .not-found-small {
            font-size: 9px;
            letter-spacing: 0.22em;
            opacity: 0.45;
          }

          .not-found h1 {
            margin: 15px 0 22px;
            font-family:
              Georgia,
              serif;
            font-size: 52px;
            font-style: italic;
            font-weight: 400;
          }

          .not-found a {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #11100e;
            text-decoration: none;
            font-size: 9px;
            letter-spacing: 0.15em;
          }
        `}</style>
      </main>
    );
  }

  const soldOut =
    product.stock <= 0;

  return (
    <main className="product-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="product-nav">
        <div className="nav-inner">

          <Link
            href="/"
            className="brand-logo"
          >
            A-POSITIVE
          </Link>

          <div className="nav-links">
            <Link href="/">
              HOME
            </Link>

            <Link href="/#product-explorer">
              SHOP
            </Link>

            <Link
              href={brandRoute}
            >
              {product.brand ??
                "COLLECTION"}
            </Link>
          </div>

          <div className="nav-actions">

            <Link
              href="/wishlist"
              className="nav-circle"
              aria-label="Wishlist"
            >
              <Heart
                size={17}
                fill={
                  liked
                    ? "#11100e"
                    : "transparent"
                }
              />
            </Link>

            <Link
              href="/cart"
              className="nav-circle"
              aria-label="Cart"
            >
              <ShoppingBag
                size={17}
              />
            </Link>

          </div>
        </div>
      </header>

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="breadcrumb-shell">
        <Link href="/">
          HOME
        </Link>

        <span>/</span>

        <Link href={brandRoute}>
          {product.brand ??
            "COLLECTION"}
        </Link>

        <span>/</span>

        <span>
          {product.name}
        </span>
      </div>

      {/* =================================================
          PRODUCT
      ================================================= */}

      <section className="product-section">

        <div className="product-image-column">

          <div className="main-image">
            {product.image_url ? (
              <img
                src={
                  product.image_url
                }
                alt={
                  product.name
                }
              />
            ) : (
              <div className="image-placeholder">
                NO IMAGE
              </div>
            )}

            {soldOut && (
              <span className="sold-out-badge">
                SOLD OUT
              </span>
            )}

            {!soldOut &&
              product.stock <=
                3 && (
                <span className="low-stock-badge">
                  LOW STOCK
                </span>
              )}

            {product.featured &&
              !soldOut && (
                <span className="featured-badge">
                  FEATURED
                </span>
              )}
          </div>

        </div>

        <div className="product-info-column">

          <div className="product-brand">
            {product.brand ??
              "A-POSITIVE"}
          </div>

          <div className="product-category">
            {product.category ??
              "FASHION"}
          </div>

          <h1>
            {product.name}
          </h1>

          <div className="price-row">

            <strong>
              {money(
                product.price
              )}
            </strong>

            {product.old_price !==
              null &&
              product.old_price >
                product.price && (
                <del>
                  {money(
                    product.old_price
                  )}
                </del>
              )}

          </div>

          <div className="divider" />

          {/* =================================================
              SIZE SELECTOR
          ================================================= */}

          {product.sizes.length >
            0 && (
            <div className="size-section">

              <div className="section-label">
                SELECT SIZE
              </div>

              <div className="size-grid">
                {product.sizes.map(
                  (size) => (
                    <button
                      type="button"
                      key={
                        size
                      }
                      className={
                        selectedSize ===
                        size
                          ? "size-button active"
                          : "size-button"
                      }
                      onClick={() =>
                        setSelectedSize(
                          size
                        )
                      }
                    >
                      {size}
                    </button>
                  )
                )}
              </div>

              <div className="size-help">
                Select your preferred size
                before adding the product
                to your bag.
              </div>

            </div>
          )}

          {/* =================================================
              QUANTITY
          ================================================= */}

          <div className="quantity-section">

            <div className="section-label">
              QUANTITY
            </div>

            <div className="quantity-control">

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.max(
                      1,
                      quantity -
                        1
                    )
                  )
                }
                disabled={
                  soldOut ||
                  quantity <=
                    1
                }
              >
                <Minus size={14} />
              </button>

              <span>
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.min(
                      Math.max(
                        product.stock,
                        1
                      ),
                      quantity +
                        1
                    )
                  )
                }
                disabled={
                  soldOut ||
                  quantity >=
                    Math.max(
                      product.stock,
                      1
                    )
                }
              >
                <Plus size={14} />
              </button>

            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="action-buttons">

            <button
              type="button"
              className="add-button"
              disabled={
                soldOut ||
                adding
              }
              onClick={() =>
                addToCart(false)
              }
            >
              <ShoppingBag
                size={16}
              />

              {adding
                ? "ADDING..."
                : soldOut
                ? "SOLD OUT"
                : product.sizes.length >
                  0 &&
                  !selectedSize
                ? "SELECT SIZE"
                : "ADD TO BAG"}
            </button>

            <button
              type="button"
              className="buy-button"
              disabled={
                soldOut ||
                adding
              }
              onClick={() =>
                addToCart(true)
              }
            >
              BUY NOW
              <ArrowRight
                size={15}
              />
            </button>

          </div>

          {/* =================================================
              WISHLIST
          ================================================= */}

          <button
            type="button"
            className={
              liked
                ? "wishlist-button liked"
                : "wishlist-button"
            }
            onClick={
              toggleWishlist
            }
          >
            <Heart
              size={15}
              fill={
                liked
                  ? "#11100e"
                  : "transparent"
              }
            />

            {liked
              ? "REMOVE FROM WISHLIST"
              : "ADD TO WISHLIST"}
          </button>

          {/* =================================================
              INFO
          ================================================= */}

          <div className="info-box">

            <div className="info-row">
              <div>
                DELIVERY
              </div>

              <span>
                Delivery available
                across Bangladesh.
              </span>
            </div>

            <div className="info-row">
              <div>
                PAYMENT
              </div>

              <span>
                Cash on delivery
                available.
              </span>
            </div>

            <div className="info-row">
              <div>
                STOCK
              </div>

              <span>
                {soldOut
                  ? "Currently unavailable"
                  : `${product.stock} available`}
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          RELATED PRODUCTS
      ================================================= */}

      {relatedProducts.length >
        0 && (
        <section className="related-section">

          <div className="related-header">
            <div>
              <div className="related-small">
                MORE FROM{" "}
                {product.brand ??
                  "THIS COLLECTION"}
              </div>

              <h2>
                You may also like.
              </h2>
            </div>

            <Link
              href={brandRoute}
            >
              VIEW COLLECTION
              <ArrowRight
                size={14}
              />
            </Link>
          </div>

          <div className="related-grid">

            {relatedProducts.map(
              (
                item
              ) => (
                <Link
                  href={`/products/${item.id}`}
                  key={
                    item.id
                  }
                  className="related-card"
                >
                  <div className="related-image">
                    <img
                      src={
                        item.image_url ??
                        ""
                      }
                      alt={
                        item.name
                      }
                    />

                    {item.stock <=
                      0 && (
                      <span>
                        SOLD OUT
                      </span>
                    )}
                  </div>

                  <div className="related-info">
                    <div className="related-category">
                      {
                        item.category
                      }
                    </div>

                    <div className="related-name">
                      {
                        item.name
                      }
                    </div>

                    <div className="related-price">
                      {money(
                        item.price
                      )}
                    </div>
                  </div>
                </Link>
              )
            )}

          </div>

        </section>
      )}

      {/* =================================================
          NOTICE
      ================================================= */}

      {notice && (
        <div className="product-notice">
          <div className="notice-title">
            BAG UPDATE
          </div>

          <div>
            {notice}
          </div>
        </div>
      )}

      {/* =================================================
          STYLES
      ================================================= */}

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

        .product-page {
          min-height: 100vh;
          background: #f8f7f3;
          color: #11100e;
        }

        .product-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(
            248,
            247,
            243,
            0.94
          );
          backdrop-filter: blur(18px);
          border-bottom: 1px solid
            rgba(17, 16, 14, 0.08);
        }

        .nav-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 17px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand-logo {
          color: #11100e;
          text-decoration: none;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.07em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .nav-links a {
          color: #11100e;
          text-decoration: none;
          font-size: 9px;
          letter-spacing: 0.15em;
          opacity: 0.56;
        }

        .nav-links a:hover {
          opacity: 1;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid
            rgba(17, 16, 14, 0.09);
          display: grid;
          place-items: center;
          color: #11100e;
          text-decoration: none;
        }

        .breadcrumb-shell {
          max-width: 1440px;
          margin: 0 auto;
          padding: 25px 24px 0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.45;
        }

        .breadcrumb-shell a {
          color: #11100e;
          text-decoration: none;
        }

        .product-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 42px 24px 100px;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(
              420px,
              0.8fr
            );
          gap: 80px;
          align-items: start;
        }

        .main-image {
          position: relative;
          overflow: hidden;
          background: #ebe9e2;
          aspect-ratio: 0.82;
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          font-size: 9px;
          letter-spacing: 0.15em;
          opacity: 0.4;
        }

        .sold-out-badge,
        .low-stock-badge,
        .featured-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          padding: 8px 10px;
          font-size: 8px;
          letter-spacing: 0.14em;
        }

        .sold-out-badge {
          background: #11100e;
          color: #fff;
        }

        .low-stock-badge,
        .featured-badge {
          background: #fff;
          color: #11100e;
        }

        .product-brand {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          opacity: 0.42;
        }

        .product-category {
          margin-top: 7px;
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.42;
        }

        .product-info-column h1 {
          max-width: 650px;
          margin: 18px 0 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(
            46px,
            6vw,
            78px
          );
          line-height: 0.93;
          font-style: italic;
          font-weight: 400;
          letter-spacing: -0.05em;
        }

        .price-row {
          margin-top: 24px;
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .price-row strong {
          font-size: 20px;
          font-weight: 600;
        }

        .price-row del {
          font-size: 12px;
          opacity: 0.4;
        }

        .divider {
          width: 100%;
          height: 1px;
          margin: 30px 0;
          background: rgba(
            17,
            16,
            14,
            0.1
          );
        }

        .section-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          opacity: 0.48;
        }

        .size-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .size-button {
          min-width: 54px;
          min-height: 42px;
          padding: 0 12px;
          border: 1px solid
            rgba(17, 16, 14, 0.14);
          background: #fff;
          color: #11100e;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .size-button:hover {
          transform: translateY(-1px);
        }

        .size-button.active {
          background: #11100e;
          color: #fff;
          border-color: #11100e;
        }

        .size-help {
          margin-top: 10px;
          font-size: 10px;
          line-height: 1.6;
          opacity: 0.45;
        }

        .quantity-section {
          margin-top: 26px;
        }

        .quantity-control {
          width: 132px;
          min-height: 43px;
          margin-top: 11px;
          display: grid;
          grid-template-columns: 40px 1fr 40px;
          border: 1px solid
            rgba(17, 16, 14, 0.12);
          background: #fff;
        }

        .quantity-control button {
          border: 0;
          background: transparent;
          color: #11100e;
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .quantity-control button:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .quantity-control span {
          display: grid;
          place-items: center;
          font-size: 12px;
          border-left: 1px solid
            rgba(17, 16, 14, 0.08);
          border-right: 1px solid
            rgba(17, 16, 14, 0.08);
        }

        .action-buttons {
          margin-top: 26px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .add-button,
        .buy-button {
          min-height: 52px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          border: 0;
          cursor: pointer;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.13em;
        }

        .add-button {
          background: #11100e;
          color: #fff;
        }

        .buy-button {
          border: 1px solid #11100e;
          background: transparent;
          color: #11100e;
        }

        .add-button:disabled,
        .buy-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .wishlist-button {
          width: 100%;
          min-height: 46px;
          margin-top: 10px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          border: 1px solid
            rgba(17, 16, 14, 0.12);
          background: #fff;
          color: #11100e;
          cursor: pointer;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .wishlist-button.liked {
          background: #ebe9e2;
        }

        .info-box {
          margin-top: 27px;
          border-top: 1px solid
            rgba(17, 16, 14, 0.1);
        }

        .info-row {
          padding: 15px 0;
          display: grid;
          grid-template-columns: 105px 1fr;
          gap: 15px;
          border-bottom: 1px solid
            rgba(17, 16, 14, 0.08);
        }

        .info-row div {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.12em;
          opacity: 0.45;
        }

        .info-row span {
          font-size: 11px;
          line-height: 1.6;
          opacity: 0.58;
        }

        .related-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px 110px;
        }

        .related-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .related-small {
          font-size: 9px;
          letter-spacing: 0.18em;
          opacity: 0.42;
        }

        .related-header h2 {
          margin: 9px 0 0;
          font-family:
            Georgia,
            serif;
          font-size: 48px;
          line-height: 0.95;
          font-style: italic;
          font-weight: 400;
          letter-spacing: -0.04em;
        }

        .related-header a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #11100e;
          text-decoration: none;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 18px;
        }

        .related-card {
          color: #11100e;
          text-decoration: none;
        }

        .related-image {
          position: relative;
          aspect-ratio: 0.8;
          overflow: hidden;
          background: #ebe9e2;
        }

        .related-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s ease;
        }

        .related-card:hover
          .related-image
          img {
          transform: scale(1.04);
        }

        .related-image span {
          position: absolute;
          left: 10px;
          top: 10px;
          padding: 7px 9px;
          background: #11100e;
          color: #fff;
          font-size: 8px;
          letter-spacing: 0.12em;
        }

        .related-info {
          padding-top: 13px;
        }

        .related-category {
          font-size: 8px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.42;
        }

        .related-name {
          margin-top: 6px;
          font-size: 13px;
          line-height: 1.45;
        }

        .related-price {
          margin-top: 7px;
          font-size: 13px;
          font-weight: 600;
        }

        .product-notice {
          position: fixed;
          top: 82px;
          right: 20px;
          z-index: 9999;
          width: min(
            390px,
            calc(100vw - 30px)
          );
          padding: 16px 18px;
          background: #11100e;
          color: #fff;
          box-shadow:
            0 22px 60px
              rgba(0, 0, 0, 0.2);
          font-size: 12px;
          line-height: 1.5;
        }

        .notice-title {
          margin-bottom: 5px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.16em;
          opacity: 0.7;
        }

        @media (max-width: 1050px) {
          .product-section {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .product-image-column {
            max-width: 700px;
          }

          .related-grid {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }
        }

        @media (max-width: 800px) {
          .nav-links {
            display: none;
          }

          .related-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .related-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 560px) {
          .nav-inner {
            padding: 15px 16px;
          }

          .brand-logo {
            font-size: 21px;
          }

          .breadcrumb-shell {
            padding-left: 16px;
            padding-right: 16px;
          }

          .product-section {
            padding: 25px 16px 70px;
          }

          .product-info-column h1 {
            font-size: 48px;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }

          .related-section {
            padding-left: 16px;
            padding-right: 16px;
          }

          .related-header h2 {
            font-size: 40px;
          }

          .related-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .info-row {
            grid-template-columns: 90px 1fr;
          }

          .product-notice {
            right: 15px;
            top: 72px;
            width: calc(100vw - 30px);
          }
        }
      `}</style>
    </main>
  );
}