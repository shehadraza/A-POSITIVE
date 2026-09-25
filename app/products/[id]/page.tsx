"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
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
};

type RelatedProduct = Product;

const supabase = createClient();

/* =========================================================
   HELPERS
========================================================= */

function money(value: number) {
  return `৳${Number(
    value || 0
  ).toLocaleString("en-BD")}`;
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function toNumber(value: unknown) {
  const cleaned = String(
    value ?? ""
  ).replace(/[^\d.-]/g, "");

  const parsed = Number(cleaned);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function normalizeProduct(
  row: any
): Product {
  return {
    id: String(
      row?.id ?? ""
    ),

    name: String(
      row?.name ??
        "Untitled Product"
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

    price: toNumber(
      row?.price
    ),

    old_price:
      row?.old_price !== null &&
      row?.old_price !== undefined
        ? toNumber(
            row.old_price
          )
        : row?.oldPrice !==
            null &&
          row?.oldPrice !==
            undefined
        ? toNumber(
            row.oldPrice
          )
        : null,

    image_url:
      row?.image_url ??
      row?.image ??
      row?.imageUrl ??
      null,

    stock: toNumber(
      row?.stock
    ),

    featured:
      Boolean(
        row?.featured
      ),
  };
}

/* =========================================================
   PRODUCT -> FULL CART ITEM
========================================================= */

function productToCartItem(
  product: Product,
  quantity: number
): CartItem {
  return {
    id:
      String(product.id),

    productId:
      String(product.id),

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
      Number(product.stock) ||
      0,

    quantity:
      Math.max(
        1,
        Number(quantity) || 1
      ),
  };
}

/* =========================================================
   NORMALIZE STORED CART ITEM

   Supports old:
   { productId, quantity }

   and new:
   {
     id,
     productId,
     name,
     brand,
     price,
     image,
     category,
     stock,
     quantity
   }

   and nested:
   { product: {...}, quantity }
========================================================= */

function normalizeStoredCartItem(
  item: any
): CartItem | null {
  if (
    !item ||
    typeof item !==
      "object"
  ) {
    return null;
  }

  const nested =
    item.product &&
    typeof item.product ===
      "object"
      ? item.product
      : null;

  const productId =
    String(
      item.productId ??
        item.id ??
        nested?.id ??
        ""
    );

  if (!productId) {
    return null;
  }

  const name =
    item.name ??
    nested?.name ??
    "";

  /*
   * Old compact cart may only have:
   * productId + quantity
   *
   * In that case we cannot construct a checkout-safe
   * cart item without the product details.
   */
  if (!name) {
    return null;
  }

  const price =
    toNumber(
      item.price ??
        nested?.price ??
        0
    );

  return {
    id:
      productId,

    productId:
      productId,

    name:
      String(name),

    brand:
      String(
        item.brand ??
          nested?.brand ??
          "A-POSITIVE"
      ),

    price:
      String(price),

    image:
      String(
        item.image ??
          nested?.image ??
          nested?.image_url ??
          ""
      ),

    category:
      String(
        item.category ??
          nested?.category ??
          "FASHION"
      ),

    stock:
      toNumber(
        item.stock ??
          nested?.stock ??
          0
      ),

    quantity:
      Math.max(
        1,
        Number(
          item.quantity ??
            1
        )
      ),
  };
}

/* =========================================================
   BRAND ROUTE
========================================================= */

function getBrandRoute(
  brand: string | null
) {
  const normalized =
    normalizeText(
      brand
    );

  const compact =
    normalized.replace(
      /[^a-z0-9]/g,
      ""
    );

  if (
    normalized ===
      "a-positive" ||
    normalized ===
      "a positive" ||
    compact ===
      "apositive"
  ) {
    return "/brands/a-positive";
  }

  if (
    normalized ===
      "blue dream"
  ) {
    return "/brands/blue-dream";
  }

  if (
    normalized ===
      "shopping zone bd"
  ) {
    return "/brands/shopping-zone-bd";
  }

  return "/";
}

/* =========================================================
   BRAND COLOR
========================================================= */

function getBrandColor(
  brand: string | null
) {
  const normalized =
    normalizeText(
      brand
    );

  if (
    normalized ===
    "blue dream"
  ) {
    return "#071A38";
  }

  if (
    normalized ===
    "shopping zone bd"
  ) {
    return "#8E101D";
  }

  return "#11100E";
}

/* =========================================================
   PAGE
========================================================= */

export default function ProductDetailPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const productId =
    params?.id;

  const [
    product,
    setProduct,
  ] =
    useState<Product | null>(
      null
    );

  const [
    relatedProducts,
    setRelatedProducts,
  ] =
    useState<
      RelatedProduct[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    quantity,
    setQuantity,
  ] =
    useState(1);

  const [
    wishlistIds,
    setWishlistIds,
  ] =
    useState<string[]>(
      []
    );

  const [
    cartItems,
    setCartItems,
  ] =
    useState<CartItem[]>(
      []
    );

  const [
    added,
    setAdded,
  ] =
    useState(false);

  const [
    buying,
    setBuying,
  ] =
    useState(false);

  const [
    actionMessage,
    setActionMessage,
  ] =
    useState<string | null>(
      null
    );

  /* =======================================================
     LOAD PRODUCT
  ======================================================= */

  useEffect(() => {
    if (!productId) {
      return;
    }

    let cancelled =
      false;

    async function loadProduct() {
      setLoading(true);
      setError(null);

      const {
        data,
        error:
          productError,
      } = await supabase
        .from("products")
        .select(
          "id,name,brand,category,price,old_price,image_url,stock,featured"
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
        productError
      ) {
        console.error(
          "PRODUCT LOAD ERROR:",
          productError
        );

        setError(
          productError.message ||
            "Unable to load this product."
        );

        setLoading(false);

        return;
      }

      if (!data) {
        setProduct(null);

        setError(
          "Product not found."
        );

        setLoading(false);

        return;
      }

      const currentProduct =
        normalizeProduct(
          data
        );

      setProduct(
        currentProduct
      );

      if (
        currentProduct.stock >
        0
      ) {
        setQuantity(
          (
            current
          ) =>
            Math.min(
              Math.max(
                current,
                1
              ),
              currentProduct.stock
            )
        );
      } else {
        setQuantity(1);
      }

      /* =================================================
         RELATED PRODUCTS
      ================================================= */

      let relatedQuery =
        supabase
          .from("products")
          .select(
            "id,name,brand,category,price,old_price,image_url,stock,featured"
          )
          .neq(
            "id",
            currentProduct.id
          )
          .order(
            "featured",
            {
              ascending:
                false,
            }
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          )
          .limit(8);

      if (
        currentProduct.brand
      ) {
        relatedQuery =
          relatedQuery.eq(
            "brand",
            currentProduct.brand
          );
      }

      const {
        data:
          relatedData,
      } =
        await relatedQuery;

      if (
        !cancelled &&
        relatedData
      ) {
        setRelatedProducts(
          relatedData
            .map(
              normalizeProduct
            )
            .slice(0, 4)
        );
      }

      setLoading(false);
    }

    loadProduct();

    /* ===================================================
       PRODUCT REALTIME
    =================================================== */

    const productChannel =
      supabase
        .channel(
          `product-detail-${productId}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema:
              "public",
            table:
              "products",
            filter:
              `id=eq.${productId}`,
          },
          () => {
            loadProduct();
          }
        )
        .subscribe();

    return () => {
      cancelled = true;

      supabase.removeChannel(
        productChannel
      );
    };
  }, [
    productId,
  ]);

  /* =======================================================
     AUTO CLOSE MESSAGE
  ======================================================= */

  useEffect(() => {
    if (!actionMessage) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setActionMessage(
            null
          );
        },
        2500
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    actionMessage,
  ]);

  /* =======================================================
     LOAD CART + WISHLIST
  ======================================================= */

  useEffect(() => {
    function readCart() {
      const saved =
        localStorage.getItem(
          "a_positive_cart"
        );

      if (!saved) {
        setCartItems([]);
        return;
      }

      try {
        const parsed =
          JSON.parse(
            saved
          );

        if (
          !Array.isArray(
            parsed
          )
        ) {
          setCartItems([]);
          return;
        }

        const normalized =
          parsed
            .map(
              (
                item
              ) =>
                normalizeStoredCartItem(
                  item
                )
            )
            .filter(
              (
                item
              ): item is CartItem =>
                Boolean(item)
            );

        setCartItems(
          normalized
        );

        /*
         * Clean old invalid compact cart data.
         * This prevents checkout from receiving:
         * { productId, quantity }
         */
        if (
          normalized.length !==
          parsed.length
        ) {
          localStorage.setItem(
            "a_positive_cart",
            JSON.stringify(
              normalized
            )
          );
        }
      } catch (err) {
        console.error(
          "CART READ ERROR:",
          err
        );

        setCartItems([]);
      }
    }

    function readWishlist() {
      const saved =
        localStorage.getItem(
          "a_positive_wishlist"
        );

      if (!saved) {
        setWishlistIds([]);
        return;
      }

      try {
        const parsed =
          JSON.parse(
            saved
          );

        if (
          Array.isArray(
            parsed
          )
        ) {
          setWishlistIds(
            parsed.map(
              (id) =>
                String(id)
            )
          );
        }
      } catch {
        setWishlistIds([]);
      }
    }

    readCart();
    readWishlist();

    const cartListener =
      () => {
        readCart();
      };

    const wishlistListener =
      () => {
        readWishlist();
      };

    window.addEventListener(
      "a_positive_cart_updated",
      cartListener
    );

    window.addEventListener(
      "a_positive_wishlist_updated",
      wishlistListener
    );

    return () => {
      window.removeEventListener(
        "a_positive_cart_updated",
        cartListener
      );

      window.removeEventListener(
        "a_positive_wishlist_updated",
        wishlistListener
      );
    };
  }, []);

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const isWishlisted =
    useMemo(() => {
      if (!product) {
        return false;
      }

      return wishlistIds.includes(
        product.id
      );
    }, [
      wishlistIds,
      product,
    ]);

  const cartCount =
    useMemo(
      () =>
        cartItems.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.quantity
            ),
          0
        ),
      [cartItems]
    );

  const brandColor =
    getBrandColor(
      product?.brand ??
        null
    );

  const safeImage =
    product?.image_url ||
    "";

  const maxQuantity =
    product &&
    product.stock >
      0
      ? product.stock
      : 0;

  /* =======================================================
     WISHLIST
  ======================================================= */

  function toggleWishlist() {
    if (!product) {
      return;
    }

    const id =
      product.id;

    const next =
      isWishlisted
        ? wishlistIds.filter(
            (
              item
            ) =>
              item !== id
          )
        : [
            ...wishlistIds,
            id,
          ];

    setWishlistIds(
      next
    );

    localStorage.setItem(
      "a_positive_wishlist",
      JSON.stringify(
        next
      )
    );

    window.dispatchEvent(
      new Event(
        "a_positive_wishlist_updated"
      )
    );
  }

  /* =======================================================
     SAVE FULL CART
  ======================================================= */

  function saveCart(
    next: CartItem[]
  ) {
    setCartItems(
      next
    );

    localStorage.setItem(
      "a_positive_cart",
      JSON.stringify(
        next
      )
    );

    window.dispatchEvent(
      new Event(
        "a_positive_cart_updated"
      )
    );
  }

  /* =======================================================
     ADD TO CART
  ======================================================= */

  function addToCart() {
    if (
      !product ||
      product.stock <= 0
    ) {
      setActionMessage(
        "This product is currently sold out."
      );

      return;
    }

    const safeQuantity =
      Math.min(
        Math.max(
          quantity,
          1
        ),
        product.stock
      );

    const existing =
      cartItems.find(
        (
          item
        ) =>
          item.productId ===
          product.id
      );

    let next: CartItem[];

    if (existing) {
      const nextQuantity =
        Math.min(
          Number(
            existing.quantity
          ) +
            safeQuantity,
          product.stock
        );

      next =
        cartItems.map(
          (
            item
          ) => {
            if (
              item.productId !==
              product.id
            ) {
              return item;
            }

            return productToCartItem(
              product,
              nextQuantity
            );
          }
        );
    } else {
      next = [
        ...cartItems,
        productToCartItem(
          product,
          safeQuantity
        ),
      ];
    }

    saveCart(
      next
    );

    setAdded(
      true
    );

    setActionMessage(
      `${product.name} added to your bag.`
    );

    window.setTimeout(
      () => {
        setAdded(
          false
        );
      },
      2200
    );
  }

  /* =======================================================
     BUY NOW
     
     IMPORTANT:
     Buy Now replaces the selected product quantity
     with the quantity chosen on this page, then goes
     directly to checkout.
  ======================================================= */

  function buyNow() {
    if (
      !product ||
      product.stock <= 0
    ) {
      setActionMessage(
        "This product is currently sold out."
      );

      return;
    }

    const safeQuantity =
      Math.min(
        Math.max(
          quantity,
          1
        ),
        product.stock
      );

    const existing =
      cartItems.find(
        (
          item
        ) =>
          item.productId ===
          product.id
      );

    let next: CartItem[];

    if (existing) {
      next =
        cartItems.map(
          (
            item
          ) =>
            item.productId ===
            product.id
              ? productToCartItem(
                  product,
                  safeQuantity
                )
              : item
        );
    } else {
      next = [
        ...cartItems,
        productToCartItem(
          product,
          safeQuantity
        ),
      ];
    }

    saveCart(
      next
    );

    setBuying(
      true
    );

    /*
     * Give localStorage/state event a moment,
     * then navigate.
     */
    window.setTimeout(
      () => {
        router.push(
          "/checkout"
        );
      },
      100
    );
  }

  /* =======================================================
     QUANTITY
  ======================================================= */

  function increaseQuantity() {
    if (
      !product ||
      product.stock <= 0
    ) {
      return;
    }

    setQuantity(
      (
        current
      ) =>
        Math.min(
          current + 1,
          product.stock
        )
    );
  }

  function decreaseQuantity() {
    setQuantity(
      (
        current
      ) =>
        Math.max(
          current - 1,
          1
        )
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main
        style={{
          minHeight:
            "100vh",
          background:
            "#f8f7f3",
          display:
            "grid",
          placeItems:
            "center",
          color:
            "#11100e",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing:
              "0.22em",
            textTransform:
              "uppercase",
            opacity: 0.5,
          }}
        >
          LOADING PRODUCT...
        </div>
      </main>
    );
  }

  /* =======================================================
     PRODUCT NOT FOUND
  ======================================================= */

  if (!product) {
    return (
      <main
        style={{
          minHeight:
            "100vh",
          background:
            "#f8f7f3",
          display:
            "grid",
          placeItems:
            "center",
          padding: 24,
          textAlign:
            "center",
        }}
      >
        <div>
          <div
            style={{
              fontFamily:
                "Georgia, serif",
              fontStyle:
                "italic",
              fontSize:
                "clamp(40px,7vw,72px)",
              lineHeight: 1,
            }}
          >
            Product not found.
          </div>

          <p
            style={{
              marginTop:
                14,
              opacity:
                0.52,
              fontSize:
                13,
            }}
          >
            {error ||
              "This product may no longer be available."}
          </p>

          <Link
            href="/"
            style={{
              marginTop:
                24,
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: 8,
              background:
                "#11100e",
              color:
                "#fff",
              textDecoration:
                "none",
              padding:
                "14px 20px",
              fontSize: 10,
              letterSpacing:
                "0.16em",
            }}
          >
            BACK TO SHOP
            <ArrowRight
              size={14}
            />
          </Link>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main
      style={{
        minHeight:
          "100vh",
        background:
          "#f8f7f3",
        color:
          "#11100e",
      }}
    >
      {/* ===================================================
          NAVBAR
      =================================================== */}

      <header
        style={{
          position:
            "sticky",
          top: 0,
          zIndex: 50,
          background:
            "rgba(248,247,243,0.94)",
          backdropFilter:
            "blur(18px)",
          borderBottom:
            "1px solid rgba(17,16,14,0.08)",
        }}
      >
        <div
          style={{
            maxWidth:
              1440,
            margin:
              "0 auto",
            padding:
              "18px 24px",
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: 20,
          }}
        >
          <Link
            href="/"
            style={{
              color:
                "#11100e",
              textDecoration:
                "none",
              fontWeight:
                800,
              fontSize:
                25,
              letterSpacing:
                "-0.07em",
            }}
          >
            A-POSITIVE
          </Link>

          <nav
            className="product-detail-nav"
            style={{
              display:
                "flex",
              gap: 25,
            }}
          >
            <Link href="/">
              HOME
            </Link>

            <Link
              href="/#product-explorer"
            >
              SHOP
            </Link>

            <Link
              href="/brands/a-positive"
            >
              A-POSITIVE
            </Link>

            <Link
              href="/brands/blue-dream"
            >
              BLUE DREAM
            </Link>

            <Link
              href="/brands/shopping-zone-bd"
            >
              SHOPPING ZONE BD
            </Link>
          </nav>

          <Link
            href="/cart"
            style={{
              position:
                "relative",
              width: 38,
              height: 38,
              borderRadius:
                "50%",
              border:
                "1px solid rgba(17,16,14,.1)",
              display:
                "grid",
              placeItems:
                "center",
              color:
                "#11100e",
            }}
          >
            <ShoppingBag
              size={17}
            />

            {cartCount >
              0 && (
              <span
                style={{
                  position:
                    "absolute",
                  top: -3,
                  right: -2,
                  width: 15,
                  height: 15,
                  borderRadius:
                    "50%",
                  background:
                    brandColor,
                  color:
                    "#fff",
                  display:
                    "grid",
                  placeItems:
                    "center",
                  fontSize:
                    8,
                }}
              >
                {
                  cartCount
                }
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ===================================================
          NOTICE
      =================================================== */}

      {actionMessage && (
        <div
          style={{
            position:
              "fixed",
            top: 82,
            right: 18,
            zIndex:
              1000,
            width:
              "min(380px, calc(100vw - 36px))",
            padding:
              "15px 17px",
            background:
              "#11100e",
            color:
              "#fff",
            boxShadow:
              "0 20px 45px rgba(0,0,0,.18)",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 10,
            }}
          >
            <Check
              size={16}
            />

            <span
              style={{
                fontSize:
                  12,
                lineHeight:
                  1.5,
                opacity:
                  0.86,
              }}
            >
              {
                actionMessage
              }
            </span>
          </div>
        </div>
      )}

      {/* ===================================================
          BREADCRUMB
      =================================================== */}

      <div
        style={{
          maxWidth:
            1440,
          margin:
            "0 auto",
          padding:
            "22px 24px 0",
        }}
      >
        <Link
          href={
            getBrandRoute(
              product.brand
            )
          }
          style={{
            display:
              "inline-flex",
            alignItems:
              "center",
            gap: 8,
            color:
              "#11100e",
            textDecoration:
              "none",
            fontSize: 10,
            letterSpacing:
              "0.14em",
            textTransform:
              "uppercase",
            opacity: 0.52,
          }}
        >
          <ArrowLeft
            size={13}
          />
          BACK TO COLLECTION
        </Link>
      </div>

      {/* ===================================================
          PRODUCT SECTION
      =================================================== */}

      <section
        style={{
          maxWidth:
            1440,
          margin:
            "0 auto",
          padding:
            "35px 24px 100px",
        }}
      >
        <div
          className="product-detail-layout"
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "minmax(0,1.08fr) minmax(360px,.92fr)",
            gap: 65,
            alignItems:
              "start",
          }}
        >
          {/* IMAGE */}

          <div
            style={{
              position:
                "relative",
              background:
                "#ebe9e2",
            }}
          >
            {safeImage ? (
              <img
                src={
                  safeImage
                }
                alt={
                  product.name
                }
                style={{
                  width:
                    "100%",
                  display:
                    "block",
                  aspectRatio:
                    "0.86",
                  objectFit:
                    "cover",
                }}
              />
            ) : (
              <div
                style={{
                  aspectRatio:
                    "0.86",
                  display:
                    "grid",
                  placeItems:
                    "center",
                  background:
                    "#ebe9e2",
                  opacity:
                    0.5,
                  fontSize: 11,
                  letterSpacing:
                    "0.16em",
                }}
              >
                NO IMAGE
              </div>
            )}

            {product.stock <=
              3 &&
              product.stock >
                0 && (
                <span
                  style={{
                    position:
                      "absolute",
                    top: 16,
                    left: 16,
                    background:
                      "#fff",
                    padding:
                      "8px 10px",
                    fontSize: 8,
                    letterSpacing:
                      "0.16em",
                  }}
                >
                  LOW STOCK
                </span>
              )}

            {product.stock <=
              0 && (
              <span
                style={{
                  position:
                    "absolute",
                  top: 16,
                  left: 16,
                  background:
                    brandColor,
                  color:
                    "#fff",
                  padding:
                    "8px 10px",
                  fontSize: 8,
                  letterSpacing:
                    "0.16em",
                }}
              >
                SOLD OUT
              </span>
            )}
          </div>

          {/* INFO */}

          <div
            style={{
              paddingTop: 8,
            }}
          >
            <Link
              href={getBrandRoute(
                product.brand
              )}
              style={{
                fontSize: 9,
                letterSpacing:
                  "0.22em",
                textTransform:
                  "uppercase",
                textDecoration:
                  "none",
                color:
                  brandColor,
              }}
            >
              {product.brand ||
                "A-POSITIVE"}
            </Link>

            <div
              style={{
                marginTop:
                  12,
                fontSize: 9,
                letterSpacing:
                  "0.18em",
                textTransform:
                  "uppercase",
                opacity:
                  0.42,
              }}
            >
              {product.category ||
                "FASHION"}
            </div>

            <h1
              style={{
                margin:
                  "17px 0 0",
                fontFamily:
                  "Georgia, serif",
                fontStyle:
                  "italic",
                fontWeight:
                  400,
                fontSize:
                  "clamp(44px,6vw,76px)",
                lineHeight:
                  0.94,
                letterSpacing:
                  "-0.045em",
              }}
            >
              {
                product.name
              }
            </h1>

            {/* PRICE */}

            <div
              style={{
                marginTop:
                  27,
                display:
                  "flex",
                alignItems:
                  "baseline",
                gap: 12,
              }}
            >
              <strong
                style={{
                  fontSize:
                    22,
                  fontWeight:
                    600,
                }}
              >
                {money(
                  product.price
                )}
              </strong>

              {product.old_price !==
                null &&
                product.old_price >
                  product.price && (
                  <del
                    style={{
                      fontSize:
                        13,
                      opacity:
                        0.4,
                    }}
                  >
                    {money(
                      product.old_price
                    )}
                  </del>
                )}
            </div>

            {/* STOCK */}

            <div
              style={{
                marginTop:
                  23,
                padding:
                  "14px 15px",
                background:
                  product.stock >
                  0
                    ? "rgba(17,16,14,.035)"
                    : "rgba(142,16,29,.07)",
                border:
                  "1px solid rgba(17,16,14,.08)",
                fontSize:
                  11,
                lineHeight:
                  1.6,
              }}
            >
              {product.stock >
              0 ? (
                <span
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: 7,
                  }}
                >
                  <Check
                    size={14}
                  />

                  {product.stock <=
                  3
                    ? `Only ${product.stock} left in stock`
                    : "Available in stock"}
                </span>
              ) : (
                <span>
                  This product is
                  currently out of
                  stock.
                </span>
              )}
            </div>

            {/* ABOUT */}

            <div
              style={{
                marginTop:
                  30,
                paddingTop:
                  24,
                borderTop:
                  "1px solid rgba(17,16,14,.09)",
              }}
            >
              <div
                style={{
                  fontSize:
                    10,
                  letterSpacing:
                    "0.18em",
                  textTransform:
                    "uppercase",
                  opacity:
                    0.44,
                  marginBottom:
                    11,
                }}
              >
                ABOUT THIS PIECE
              </div>

              <p
                style={{
                  maxWidth:
                    560,
                  fontSize:
                    14,
                  lineHeight:
                    1.9,
                  opacity:
                    0.62,
                  margin: 0,
                }}
              >
                {product.name} is
                part of the{" "}
                {product.brand ||
                  "A-POSITIVE"}{" "}
                collection, designed
                with a modern focus on
                everyday style, fit and
                detail.
              </p>
            </div>

            {/* ACTIONS */}

            <div
              style={{
                marginTop:
                  32,
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  gap: 10,
                  flexWrap:
                    "wrap",
                }}
              >
                {/* QUANTITY */}

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    border:
                      "1px solid rgba(17,16,14,.16)",
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      product.stock <=
                        0 ||
                      quantity <=
                        1
                    }
                    style={{
                      width: 43,
                      height: 48,
                      border: 0,
                      background:
                        "transparent",
                      cursor:
                        product.stock >
                          0 &&
                        quantity >
                          1
                          ? "pointer"
                          : "not-allowed",
                      opacity:
                        product.stock >
                          0 &&
                        quantity >
                          1
                          ? 1
                          : 0.35,
                      display:
                        "grid",
                      placeItems:
                        "center",
                    }}
                  >
                    <Minus
                      size={14}
                    />
                  </button>

                  <span
                    style={{
                      minWidth:
                        40,
                      textAlign:
                        "center",
                      fontSize:
                        13,
                    }}
                  >
                    {
                      quantity
                    }
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      product.stock <=
                        0 ||
                      quantity >=
                        maxQuantity
                    }
                    style={{
                      width: 43,
                      height: 48,
                      border: 0,
                      background:
                        "transparent",
                      cursor:
                        product.stock >
                          0 &&
                        quantity <
                          maxQuantity
                          ? "pointer"
                          : "not-allowed",
                      opacity:
                        product.stock >
                          0 &&
                        quantity <
                          maxQuantity
                          ? 1
                          : 0.35,
                      display:
                        "grid",
                      placeItems:
                        "center",
                    }}
                  >
                    <Plus
                      size={14}
                    />
                  </button>
                </div>

                {/* ADD TO CART */}

                <button
                  type="button"
                  onClick={
                    addToCart
                  }
                  disabled={
                    product.stock <=
                    0
                  }
                  style={{
                    flex: 1,
                    minWidth:
                      180,
                    border: 0,
                    background:
                      added
                        ? "#2d5b35"
                        : brandColor,
                    color:
                      "#fff",
                    padding:
                      "0 20px",
                    minHeight:
                      48,
                    cursor:
                      product.stock >
                      0
                        ? "pointer"
                        : "not-allowed",
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: 9,
                    fontSize:
                      10,
                    letterSpacing:
                      "0.16em",
                  }}
                >
                  {added ? (
                    <>
                      <Check
                        size={15}
                      />
                      ADDED TO CART
                    </>
                  ) : (
                    <>
                      <ShoppingBag
                        size={15}
                      />
                      ADD TO CART
                    </>
                  )}
                </button>

                {/* WISHLIST */}

                <button
                  type="button"
                  onClick={
                    toggleWishlist
                  }
                  style={{
                    width: 50,
                    minHeight:
                      48,
                    border:
                      `1px solid ${brandColor}`,
                    background:
                      isWishlisted
                        ? brandColor
                        : "transparent",
                    color:
                      isWishlisted
                        ? "#fff"
                        : brandColor,
                    cursor:
                      "pointer",
                    display:
                      "grid",
                    placeItems:
                      "center",
                  }}
                  aria-label="Wishlist"
                >
                  <Heart
                    size={17}
                    fill={
                      isWishlisted
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              </div>

              {/* BUY NOW */}

              <button
                type="button"
                onClick={
                  buyNow
                }
                disabled={
                  product.stock <=
                    0 ||
                  buying
                }
                style={{
                  width:
                    "100%",
                  marginTop:
                    10,
                  minHeight:
                    52,
                  border: 0,
                  background:
                    "#11100e",
                  color:
                    "#fff",
                  cursor:
                    product.stock >
                      0 &&
                    !buying
                      ? "pointer"
                      : "not-allowed",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: 9,
                  fontSize:
                    10,
                  letterSpacing:
                    "0.18em",
                }}
              >
                <Sparkles
                  size={15}
                />

                {buying
                  ? "OPENING CHECKOUT..."
                  : "BUY NOW"}
              </button>
            </div>

            {/* SHIPPING */}

            <div
              style={{
                marginTop:
                  30,
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(2,minmax(0,1fr))",
                gap: 10,
              }}
            >
              <div
                style={{
                  padding:
                    "16px",
                  border:
                    "1px solid rgba(17,16,14,.09)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      9,
                    letterSpacing:
                      "0.15em",
                    textTransform:
                      "uppercase",
                    opacity:
                      0.43,
                  }}
                >
                  DELIVERY
                </div>

                <div
                  style={{
                    marginTop:
                      8,
                    fontSize:
                      12,
                    lineHeight:
                      1.5,
                  }}
                >
                  Selected orders may
                  qualify for free delivery.
                </div>
              </div>

              <div
                style={{
                  padding:
                    "16px",
                  border:
                    "1px solid rgba(17,16,14,.09)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      9,
                    letterSpacing:
                      "0.15em",
                    textTransform:
                      "uppercase",
                    opacity:
                      0.43,
                  }}
                >
                  PAYMENT
                </div>

                <div
                  style={{
                    marginTop:
                      8,
                    fontSize:
                      12,
                    lineHeight:
                      1.5,
                  }}
                >
                  Cash on delivery
                  and available
                  online payment
                  options.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          RELATED PRODUCTS
      =================================================== */}

      {relatedProducts.length >
        0 && (
        <section
          style={{
            borderTop:
              "1px solid rgba(17,16,14,.08)",
            background:
              "#efede7",
          }}
        >
          <div
            style={{
              maxWidth:
                1440,
              margin:
                "0 auto",
              padding:
                "85px 24px 100px",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-end",
                gap: 20,
                marginBottom:
                  28,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      10,
                    letterSpacing:
                      "0.25em",
                    textTransform:
                      "uppercase",
                    opacity:
                      0.45,
                    marginBottom:
                      10,
                  }}
                >
                  YOU MAY ALSO LIKE
                </div>

                <h2
                  style={{
                    margin:
                      0,
                    fontFamily:
                      "Georgia, serif",
                    fontStyle:
                      "italic",
                    fontWeight:
                      400,
                    fontSize:
                      "clamp(38px,5vw,62px)",
                    lineHeight:
                      0.96,
                  }}
                >
                  More from{" "}
                  {product.brand ||
                    "this collection"}
                  .
                </h2>
              </div>

              <Link
                href={getBrandRoute(
                  product.brand
                )}
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: 7,
                  color:
                    "#11100e",
                  textDecoration:
                    "none",
                  fontSize:
                    10,
                  letterSpacing:
                    "0.14em",
                }}
              >
                VIEW BRAND
                <ArrowRight
                  size={13}
                />
              </Link>
            </div>

            <div
              className="related-grid"
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(4,minmax(0,1fr))",
                gap: 18,
              }}
            >
              {relatedProducts.map(
                (
                  item
                ) => (
                  <article
                    key={
                      item.id
                    }
                  >
                    <Link
                      href={`/products/${item.id}`}
                      style={{
                        display:
                          "block",
                        aspectRatio:
                          "0.8",
                        background:
                          "#e8e5df",
                      }}
                    >
                      <img
                        src={
                          item.image_url ||
                          ""
                        }
                        alt={
                          item.name
                        }
                        style={{
                          width:
                            "100%",
                          height:
                            "100%",
                          objectFit:
                            "cover",
                          display:
                            "block",
                        }}
                      />
                    </Link>

                    <div
                      style={{
                        paddingTop:
                          14,
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            9,
                          letterSpacing:
                            "0.16em",
                          textTransform:
                            "uppercase",
                          opacity:
                            0.42,
                          marginBottom:
                            6,
                        }}
                      >
                        {item.category ||
                          "FASHION"}
                      </div>

                      <Link
                        href={`/products/${item.id}`}
                        style={{
                          textDecoration:
                            "none",
                          color:
                            "#11100e",
                          fontSize:
                            14,
                        }}
                      >
                        {
                          item.name
                        }
                      </Link>

                      <div
                        style={{
                          marginTop:
                            7,
                          fontSize:
                            13,
                        }}
                      >
                        {money(
                          item.price
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===================================================
          RESPONSIVE
      =================================================== */}

      <style jsx global>{`
        .product-detail-nav a {
          color: #11100e;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.14em;
          opacity: 0.62;
        }

        .product-detail-nav a:hover {
          opacity: 1;
        }

        @media (max-width: 950px) {
          .product-detail-nav {
            display: none !important;
          }

          .product-detail-layout {
            grid-template-columns:
              1fr !important;
            gap: 40px !important;
          }

          .related-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 560px) {
          .related-grid {
            gap: 11px;
          }
        }
      `}</style>
    </main>
  );
}