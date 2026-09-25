"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  Heart,
  ShoppingBag,
} from "lucide-react";

import { createClient } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Brand = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  image_url: string | null;
  accent_color: string | null;
  dark_color: string | null;
  active: boolean;
  sort_order: number;
};

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

const supabase = createClient();

/* =========================================================
   FALLBACK BRAND
========================================================= */

const fallbackBrand: Brand = {
  id: "fallback-a-positive",
  slug: "a-positive",
  name: "A-POSITIVE",
  tagline: "OWN YOUR PRESENCE.",
  image_url:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=90",
  accent_color: "#E9E1CE",
  dark_color: "#11100E",
  active: true,
  sort_order: 3,
};

/* =========================================================
   FALLBACK PRODUCTS
========================================================= */

const fallbackProducts: Product[] = [
  {
    id: "fallback-ap-trouser",
    name: "Premium Tailored Trouser",
    brand: "A-POSITIVE",
    category: "PANT",
    price: 2190,
    old_price: 2690,
    image_url:
      "https://images.unsplash.com/photo-1506629905607-d9c297d5c7f2?auto=format&fit=crop&w=1000&q=90",
    stock: 20,
    featured: true,
  },
  {
    id: "fallback-ap-shirt",
    name: "A-Positive Signature Shirt",
    brand: "A-POSITIVE",
    category: "SHIRT",
    price: 1790,
    old_price: 2190,
    image_url:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1000&q=90",
    stock: 30,
    featured: false,
  },
];

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  "ALL",
  "PANT",
  "SHIRT",
  "WOMEN",
  "BAG",
  "DRESS",
  "ACCESSORIES",
];

/* =========================================================
   HELPERS
========================================================= */

function money(value: number) {
  return `৳${Number(value || 0).toLocaleString("en-BD")}`;
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toNumber(value: unknown) {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  const cleaned = String(value ?? "")
    .replace(/[^\d.-]/g, "");

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
      row?.old_price !==
        null &&
      row?.old_price !==
        undefined
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

    stock:
      toNumber(
        row?.stock
      ),

    featured:
      Boolean(
        row?.featured
      ),
  };
}

/* =========================================================
   PRODUCT -> CART
========================================================= */

function productToCartItem(
  product: Product
): CartItem {
  return {
    id: String(
      product.id
    ),

    productId: String(
      product.id
    ),

    name:
      product.name,

    brand:
      product.brand ??
      "A-POSITIVE",

    price:
      String(
        product.price
      ),

    image:
      product.image_url ??
      "",

    category:
      product.category ??
      "FASHION",

    stock:
      Number(
        product.stock
      ) || 0,

    quantity: 1,
  };
}

/* =========================================================
   NORMALIZE STORED CART
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

  const nestedProduct =
    item.product &&
    typeof item.product ===
      "object"
      ? item.product
      : null;

  const productId =
    String(
      item.productId ??
        item.id ??
        nestedProduct?.id ??
        ""
    );

  if (!productId) {
    return null;
  }

  const name =
    item.name ??
    nestedProduct?.name ??
    "";

  if (!name) {
    return null;
  }

  const price =
    toNumber(
      item.price ??
        nestedProduct?.price ??
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
          nestedProduct?.brand ??
          "A-POSITIVE"
      ),

    price:
      String(price),

    image:
      String(
        item.image ??
          nestedProduct?.image ??
          nestedProduct?.image_url ??
          ""
      ),

    category:
      String(
        item.category ??
          nestedProduct?.category ??
          "FASHION"
      ),

    stock:
      toNumber(
        item.stock ??
          nestedProduct?.stock ??
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
   PAGE
========================================================= */

export default function APositiveBrandPage() {
  const [brand, setBrand] =
    useState<Brand>(
      fallbackBrand
    );

  const [products, setProducts] =
    useState<Product[]>(
      []
    );

  const [
    usingFallbackProducts,
    setUsingFallbackProducts,
  ] = useState(false);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState(
    "ALL"
  );

  const [
    cartItems,
    setCartItems,
  ] = useState<CartItem[]>(
    []
  );

  const [
    wishlistIds,
    setWishlistIds,
  ] = useState<string[]>(
    []
  );

  const [
    cartNotice,
    setCartNotice,
  ] = useState<
    string | null
  >(null);

  /* =======================================================
     LOAD CART + WISHLIST
  ======================================================= */

  useEffect(() => {
    function readCart() {
      const savedCart =
        localStorage.getItem(
          "a_positive_cart"
        );

      if (!savedCart) {
        setCartItems([]);
        return;
      }

      try {
        const parsed =
          JSON.parse(
            savedCart
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
      } catch (error) {
        console.error(
          "CART LOAD ERROR:",
          error
        );

        setCartItems([]);
      }
    }

    function readWishlist() {
      const savedWishlist =
        localStorage.getItem(
          "a_positive_wishlist"
        );

      if (!savedWishlist) {
        setWishlistIds([]);
        return;
      }

      try {
        const parsed =
          JSON.parse(
            savedWishlist
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
     LOAD BRAND + REAL PRODUCTS
     
     IMPORTANT:
     Product filtering supports:
     - A-POSITIVE
     - a-positive
     - A Positive
     - brand slug
     - brand id
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadBrandAndProducts() {
      try {
        /* -----------------------------------------------
           FIRST: LOAD BRAND
        ------------------------------------------------ */

        const {
          data: brandData,
          error: brandError,
        } = await supabase
          .from("brands")
          .select(
            "id,slug,name,tagline,image_url,accent_color,dark_color,active,sort_order"
          )
          .eq(
            "slug",
            "a-positive"
          )
          .eq(
            "active",
            true
          )
          .maybeSingle();

        if (
          cancelled
        ) {
          return;
        }

        const currentBrand =
          !brandError &&
          brandData
            ? (brandData as Brand)
            : fallbackBrand;

        setBrand(
          currentBrand
        );

        /* -----------------------------------------------
           SECOND: LOAD ALL PRODUCTS

           Do NOT use:
           .ilike("brand", "A-POSITIVE")

           because Admin may store:
           A-POSITIVE
           A Positive
           a-positive
           brand UUID
           etc.
        ------------------------------------------------ */

        const {
          data: productRows,
          error: productError,
        } = await supabase
          .from("products")
          .select(
            "id,name,brand,category,price,old_price,image_url,stock,featured,created_at"
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
          );

        if (
          productError
        ) {
          console.error(
            "A-POSITIVE PRODUCTS DATABASE ERROR:",
            productError
          );

          if (
            !cancelled
          ) {
            setProducts(
              fallbackProducts
            );

            setUsingFallbackProducts(
              true
            );
          }

          return;
        }

        const allProducts =
          (
            productRows ??
            []
          ).map(
            normalizeProduct
          );

        console.log(
          "ALL SUPABASE PRODUCTS:",
          allProducts
        );

        /* -----------------------------------------------
           ALL POSSIBLE BRAND VALUES
        ------------------------------------------------ */

        const possibleBrandValues =
          [
            "A-POSITIVE",

            "A Positive",

            "a-positive",

            currentBrand.name,

            currentBrand.slug,

            currentBrand.id,
          ]
            .filter(Boolean)
            .map(
              normalizeText
            );

        console.log(
          "A-POSITIVE BRAND MATCH VALUES:",
          possibleBrandValues
        );

        /* -----------------------------------------------
           FILTER ACTUAL A-POSITIVE PRODUCTS
        ------------------------------------------------ */

        const aPositiveProducts =
          allProducts.filter(
            (
              product
            ) => {
              const productBrand =
                normalizeText(
                  product.brand
                );

              return possibleBrandValues.includes(
                productBrand
              );
            }
          );

        console.log(
          "A-POSITIVE PRODUCTS FOUND:",
          aPositiveProducts
        );

        /* -----------------------------------------------
           REAL PRODUCTS FOUND
        ------------------------------------------------ */

        if (
          aPositiveProducts.length >
          0
        ) {
          setProducts(
            aPositiveProducts
          );

          setUsingFallbackProducts(
            false
          );

          return;
        }

        /* -----------------------------------------------
           TRY NAME BASED MATCH AS EXTRA SAFETY
        ------------------------------------------------ */

        const nameBasedProducts =
          allProducts.filter(
            (
              product
            ) =>
              normalizeText(
                product.brand
              ).includes(
                "apositive"
              )
          );

        console.log(
          "A-POSITIVE NAME MATCH:",
          nameBasedProducts
        );

        if (
          nameBasedProducts.length >
          0
        ) {
          setProducts(
            nameBasedProducts
          );

          setUsingFallbackProducts(
            false
          );

          return;
        }

        /* -----------------------------------------------
           NOTHING FOUND
        ------------------------------------------------ */

        console.warn(
          "No A-POSITIVE products found in Supabase."
        );

        setProducts(
          fallbackProducts
        );

        setUsingFallbackProducts(
          true
        );
      } catch (error) {
        console.error(
          "A-POSITIVE PAGE LOAD ERROR:",
          error
        );

        if (
          !cancelled
        ) {
          setProducts(
            fallbackProducts
          );

          setUsingFallbackProducts(
            true
          );
        }
      }
    }

    loadBrandAndProducts();

    /* ===================================================
       BRAND REALTIME
    =================================================== */

    const brandChannel =
      supabase
        .channel(
          "a-positive-brand-page"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema:
              "public",
            table:
              "brands",
            filter:
              "slug=eq.a-positive",
          },
          () => {
            loadBrandAndProducts();
          }
        )
        .subscribe();

    /* ===================================================
       PRODUCT REALTIME
    =================================================== */

    const productsChannel =
      supabase
        .channel(
          "a-positive-products-page"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema:
              "public",
            table:
              "products",
          },
          () => {
            loadBrandAndProducts();
          }
        )
        .subscribe();

    return () => {
      cancelled = true;

      supabase.removeChannel(
        brandChannel
      );

      supabase.removeChannel(
        productsChannel
      );
    };
  }, []);

  /* =======================================================
     NOTICE AUTO CLOSE
  ======================================================= */

  useEffect(() => {
    if (!cartNotice) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setCartNotice(
            null
          );
        },
        3000
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    cartNotice,
  ]);

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const visibleProducts =
    useMemo(() => {
      if (
        activeCategory ===
        "ALL"
      ) {
        return products;
      }

      return products.filter(
        (
          product
        ) =>
          normalizeText(
            product.category
          ) ===
          normalizeText(
            activeCategory
          )
      );
    }, [
      products,
      activeCategory,
    ]);

  /* =======================================================
     CART COUNT
  ======================================================= */

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

  /* =======================================================
     CART SUBTOTAL
  ======================================================= */

  const cartSubtotal =
    useMemo(
      () =>
        cartItems.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.price
            ) *
              Number(
                item.quantity
              ),
          0
        ),
      [cartItems]
    );

  /* =======================================================
     WISHLIST
  ======================================================= */

  function toggleWishlist(
    productId: string
  ) {
    const id =
      String(
        productId
      );

    const next =
      wishlistIds.includes(
        id
      )
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
     ADD TO CART
  ======================================================= */
function addToCart(product: Product) {
  /*
   * ONLY block actual fallback/demo products.
   * Do NOT use usingFallbackProducts here.
   */
  if (
    product.id.startsWith("fallback-")
  ) {
    setCartNotice(
      "This is a preview product. Please add the real product from Admin first."
    );

    return;
  }

  if (product.stock <= 0) {
    setCartNotice(
      "This product is currently sold out."
    );

    return;
  }

  setCartItems((current) => {
    const existing = current.find(
      (item) =>
        item.productId === product.id
    );

    let next: CartItem[];

    if (existing) {
      const nextQuantity = Math.min(
        Number(existing.quantity) + 1,
        Math.max(
          Number(product.stock),
          1
        )
      );

      next = current.map((item) => {
        if (
          item.productId !==
          product.id
        ) {
          return item;
        }

        return {
          ...item,

          id: String(product.id),

          productId:
            String(product.id),

          name: product.name,

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
            nextQuantity,
        };
      });
    } else {
      next = [
        ...current,
        {
          id: String(product.id),

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

          quantity: 1,
        },
      ];
    }

    localStorage.setItem(
      "a_positive_cart",
      JSON.stringify(next)
    );

    window.dispatchEvent(
      new Event(
        "a_positive_cart_updated"
      )
    );

    return next;
  });

  setCartNotice(
    `${product.name} added to your bag.`
  );
}
  

  /* =======================================================
     COLORS
  ======================================================= */

  const heroImage =
    brand.image_url ||
    fallbackBrand.image_url ||
    "";

  const darkColor =
    brand.dark_color ||
    "#11100E";

  const accentColor =
    brand.accent_color ||
    "#E9E1CE";

  /* =======================================================
     RENDER
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
            maxWidth: 1440,
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
              fontSize: 25,
              letterSpacing:
                "-0.07em",
            }}
          >
            A-POSITIVE
          </Link>

          <nav
            className="brand-page-nav"
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 26,
            }}
          >
            <Link
              href="/"
            >
              HOME
            </Link>

            <a
              href="#collection"
            >
              SHOP
            </a>

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

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 8,
            }}
          >
            <Link
              href="/wishlist"
              style={{
                position:
                  "relative",
                width: 38,
                height: 38,
                borderRadius:
                  999,
                border:
                  "1px solid rgba(17,16,14,0.09)",
                display:
                  "grid",
                placeItems:
                  "center",
                color:
                  "#11100e",
              }}
            >
              <Heart
                size={17}
              />

              {wishlistIds.length >
                0 && (
                <span
                  style={{
                    position:
                      "absolute",
                    top: -3,
                    right: -2,
                    minWidth: 15,
                    height: 15,
                    padding:
                      "0 3px",
                    borderRadius:
                      "50%",
                    background:
                      "#11100e",
                    color:
                      "#fff",
                    display:
                      "grid",
                    placeItems:
                      "center",
                    fontSize: 8,
                  }}
                >
                  {
                    wishlistIds.length
                  }
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              style={{
                position:
                  "relative",
                width: 38,
                height: 38,
                borderRadius:
                  999,
                border:
                  "1px solid rgba(17,16,14,0.09)",
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
                    minWidth: 15,
                    height: 15,
                    padding:
                      "0 3px",
                    borderRadius:
                      "50%",
                    background:
                      "#11100e",
                    color:
                      "#fff",
                    display:
                      "grid",
                    placeItems:
                      "center",
                    fontSize: 8,
                  }}
                >
                  {
                    cartCount
                  }
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================
          HERO
      =================================================== */}

      <section
        style={{
          maxWidth: 1440,
          margin:
            "0 auto",
          padding:
            "18px 24px 0",
        }}
      >
        <div
          style={{
            position:
              "relative",
            minHeight: 680,
            overflow:
              "hidden",
            background:
              darkColor,
          }}
        >
          <img
            src={heroImage}
            alt={
              brand.name
            }
            style={{
              position:
                "absolute",
              inset: 0,
              width:
                "100%",
              height:
                "100%",
              objectFit:
                "cover",
              opacity:
                0.8,
            }}
          />

          <div
            style={{
              position:
                "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.3) 55%, rgba(0,0,0,.08) 100%)",
            }}
          />

          <div
            style={{
              position:
                "relative",
              minHeight: 680,
              display:
                "flex",
              flexDirection:
                "column",
              justifyContent:
                "flex-end",
              padding:
                "clamp(32px,7vw,100px)",
              color:
                "#fff",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing:
                  "0.34em",
                textTransform:
                  "uppercase",
                opacity:
                  0.72,
                marginBottom:
                  18,
              }}
            >
              A-POSITIVE COLLECTION
            </div>

            <h1
              style={{
                maxWidth: 800,
                margin: 0,
                fontFamily:
                  "Georgia, serif",
                fontStyle:
                  "italic",
                fontWeight:
                  400,
                fontSize:
                  "clamp(58px,9vw,125px)",
                lineHeight:
                  0.88,
                letterSpacing:
                  "-0.055em",
              }}
            >
              {
                brand.name
              }
            </h1>

            <div
              style={{
                marginTop: 22,
                fontSize: 14,
                letterSpacing:
                  "0.17em",
                textTransform:
                  "uppercase",
                opacity:
                  0.88,
              }}
            >
              {brand.tagline ||
                "OWN YOUR PRESENCE."}
            </div>

            <div
              style={{
                marginTop: 28,
                display:
                  "flex",
                gap: 10,
                flexWrap:
                  "wrap",
              }}
            >
              <a
                href="#collection"
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: 9,
                  padding:
                    "15px 22px",
                  background:
                    "#fff",
                  color:
                    "#11100e",
                  textDecoration:
                    "none",
                  fontSize: 10,
                  letterSpacing:
                    "0.17em",
                }}
              >
                EXPLORE COLLECTION
                <ArrowRight
                  size={14}
                />
              </a>

              <Link
                href="/cart"
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: 9,
                  padding:
                    "15px 22px",
                  background:
                    "rgba(255,255,255,.08)",
                  color:
                    "#fff",
                  border:
                    "1px solid rgba(255,255,255,.32)",
                  textDecoration:
                    "none",
                  fontSize: 10,
                  letterSpacing:
                    "0.17em",
                }}
              >
                VIEW BAG
                <ShoppingBag
                  size={14}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          INTRO
      =================================================== */}

      <section
        style={{
          maxWidth: 1120,
          margin:
            "0 auto",
          padding:
            "95px 24px 72px",
          textAlign:
            "center",
        }}
      >
        <div
          style={{
            width: 46,
            height: 1,
            background:
              darkColor,
            margin:
              "0 auto 23px",
          }}
        />

        <div
          style={{
            fontSize: 10,
            letterSpacing:
              "0.25em",
            textTransform:
              "uppercase",
            opacity:
              0.45,
          }}
        >
          THE A-POSITIVE WORLD
        </div>

        <h2
          style={{
            margin:
              "18px 0 0",
            fontFamily:
              "Georgia, serif",
            fontStyle:
              "italic",
            fontWeight:
              400,
            fontSize:
              "clamp(38px,5.5vw,72px)",
            lineHeight:
              0.98,
            letterSpacing:
              "-0.04em",
          }}
        >
          Designed around
          <br />
          confidence and detail.
        </h2>

        <p
          style={{
            maxWidth: 680,
            margin:
              "26px auto 0",
            fontSize: 14,
            lineHeight:
              1.9,
            opacity:
              0.58,
          }}
        >
          A-POSITIVE is built for people who want
          their clothing to feel intentional.
          Refined silhouettes, everyday essentials
          and carefully considered details come
          together in one modern collection.
        </p>
      </section>

      {/* ===================================================
          CATEGORY FILTER
      =================================================== */}

      <section
        id="collection"
        style={{
          borderTop:
            "1px solid rgba(17,16,14,0.08)",
          borderBottom:
            "1px solid rgba(17,16,14,0.08)",
          background:
            accentColor,
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin:
              "0 auto",
            padding:
              "18px 24px",
            display:
              "flex",
            gap: 9,
            overflowX:
              "auto",
          }}
        >
          {categories.map(
            (
              category
            ) => {
              const active =
                activeCategory ===
                category;

              return (
                <button
                  key={
                    category
                  }
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      category
                    )
                  }
                  style={{
                    flexShrink:
                      0,
                    padding:
                      "10px 15px",
                    border:
                      active
                        ? `1px solid ${darkColor}`
                        : "1px solid rgba(17,16,14,.15)",
                    background:
                      active
                        ? darkColor
                        : "transparent",
                    color:
                      active
                        ? "#fff"
                        : "#11100e",
                    cursor:
                      "pointer",
                    fontSize: 9,
                    letterSpacing:
                      "0.17em",
                  }}
                >
                  {
                    category
                  }
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* ===================================================
          PRODUCTS
      =================================================== */}

      <section
        style={{
          maxWidth: 1440,
          margin:
            "0 auto",
          padding:
            "90px 24px",
        }}
      >
        <div
          style={{
            display:
              "flex",
            alignItems:
              "flex-end",
            justifyContent:
              "space-between",
            gap: 20,
            marginBottom:
              30,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
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
              A-POSITIVE
            </div>

            <h2
              style={{
                margin: 0,
                fontFamily:
                  "Georgia, serif",
                fontStyle:
                  "italic",
                fontWeight:
                  400,
                fontSize:
                  "clamp(42px,5vw,68px)",
                lineHeight:
                  0.95,
              }}
            >
              The collection.
            </h2>
          </div>

          <div
            style={{
              fontSize: 10,
              letterSpacing:
                "0.15em",
              textTransform:
                "uppercase",
              opacity:
                0.45,
            }}
          >
            {
              visibleProducts.length
            }{" "}
            ITEMS
          </div>
        </div>

        {/* DATABASE STATUS */}

        {usingFallbackProducts && (
          <div
            style={{
              marginBottom:
                22,
              padding:
                "14px 16px",
              border:
                "1px solid rgba(17,16,14,.10)",
              background:
                "#fff",
              fontSize: 10,
              lineHeight:
                1.6,
              opacity:
                0.75,
              letterSpacing:
                "0.04em",
            }}
          >
            No A-POSITIVE product was found in the
            Supabase products table. Preview products
            are being shown.
          </div>
        )}

        {/* REAL PRODUCTS */}

        {visibleProducts.length >
        0 ? (
          <div
            className="a-positive-product-grid"
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0,1fr))",
              gap: 18,
            }}
          >
            {visibleProducts.map(
              (
                product
              ) => {
                const liked =
                  wishlistIds.includes(
                    product.id
                  );

                const isFallback =
                  product.id.startsWith(
                    "fallback-"
                  );

                return (
                  <article
                    key={
                      product.id
                    }
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
                      {isFallback ? (
                        <div
                          style={{
                            aspectRatio:
                              "0.8",
                          }}
                        >
                          <img
                            src={
                              product.image_url ||
                              ""
                            }
                            alt={
                              product.name
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
                        </div>
                      ) : (
                        <Link
                          href={`/products/${product.id}`}
                          style={{
                            display:
                              "block",
                            aspectRatio:
                              "0.8",
                          }}
                        >
                          <img
                            src={
                              product.image_url ||
                              ""
                            }
                            alt={
                              product.name
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
                      )}

                      {/* WISHLIST */}

                      <button
                        type="button"
                        disabled={
  isFallback ||
  product.stock <= 0
}
                        onClick={() => {
                          if (
                            !isFallback
                          ) {
                            toggleWishlist(
                              product.id
                            );
                          }
                        }}
                        style={{
                          position:
                            "absolute",
                          top: 11,
                          right: 11,
                          width: 35,
                          height: 35,
                          borderRadius:
                            "50%",
                          border: 0,
                          background:
                            "#fff",
                          display:
                            "grid",
                          placeItems:
                            "center",
                          cursor:
                            isFallback
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            isFallback
                              ? 0.55
                              : 1,
                        }}
                      >
                        <Heart
                          size={15}
                          fill={
                            liked
                              ? darkColor
                              : "transparent"
                          }
                        />
                      </button>

                      {/* PREVIEW */}

                      {isFallback && (
                        <span
                          style={{
                            position:
                              "absolute",
                            top: 12,
                            left: 12,
                            padding:
                              "7px 9px",
                            background:
                              "#fff",
                            color:
                              "#11100e",
                            fontSize: 8,
                            letterSpacing:
                              "0.14em",
                          }}
                        >
                          PREVIEW
                        </span>
                      )}

                      {/* LOW STOCK */}

                      {!isFallback &&
                        product.stock >
                          0 &&
                        product.stock <=
                          3 && (
                          <span
                            style={{
                              position:
                                "absolute",
                              top: 12,
                              left: 12,
                              padding:
                                "7px 9px",
                              background:
                                "#fff",
                              fontSize: 8,
                              letterSpacing:
                                "0.14em",
                            }}
                          >
                            LOW STOCK
                          </span>
                        )}

                      {/* SOLD OUT */}

                      {!isFallback &&
                        product.stock <=
                          0 && (
                          <span
                            style={{
                              position:
                                "absolute",
                              top: 12,
                              left: 12,
                              padding:
                                "7px 9px",
                              background:
                                "#11100e",
                              color:
                                "#fff",
                              fontSize: 8,
                              letterSpacing:
                                "0.14em",
                            }}
                          >
                            SOLD OUT
                          </span>
                        )}

                      {/* QUICK ADD */}

                      <button
                        type="button"
                        disabled={
                          isFallback ||
                          product.stock <=
                            0
                        }
                        onClick={() =>
                          addToCart(
                            product
                          )
                        }
                        style={{
                          position:
                            "absolute",
                          left: 10,
                          right: 10,
                          bottom: 10,
                          padding:
                            "13px 10px",
                          border: 0,
                          background:
                            !isFallback &&
                            product.stock >
                              0
                              ? darkColor
                              : "rgba(17,16,14,.45)",
                          color:
                            "#fff",
                          cursor:
                            !isFallback &&
                            product.stock >
                              0
                              ? "pointer"
                              : "not-allowed",
                          fontSize: 9,
                          letterSpacing:
                            "0.16em",
                        }}
                      >
                        {isFallback
                          ? "PREVIEW ONLY"
                          : product.stock >
                            0
                          ? "QUICK ADD"
                          : "SOLD OUT"}
                      </button>
                    </div>

                    {/* PRODUCT INFO */}

                    <div
                      style={{
                        paddingTop:
                          15,
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap: 10,
                          alignItems:
                            "flex-start",
                        }}
                      >
                        <div
                          style={{
                            minWidth:
                              0,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 9,
                              letterSpacing:
                                "0.18em",
                              textTransform:
                                "uppercase",
                              opacity:
                                0.42,
                              marginBottom:
                                6,
                            }}
                          >
                            {
                              product.category
                            }
                          </div>

                          {isFallback ? (
                            <span
                              style={{
                                color:
                                  "#11100e",
                                fontSize:
                                  14,
                                lineHeight:
                                  1.4,
                              }}
                            >
                              {
                                product.name
                              }
                            </span>
                          ) : (
                            <Link
                              href={`/products/${product.id}`}
                              style={{
                                color:
                                  "#11100e",
                                textDecoration:
                                  "none",
                                fontSize:
                                  14,
                                lineHeight:
                                  1.4,
                              }}
                            >
                              {
                                product.name
                              }
                            </Link>
                          )}
                        </div>

                        <div
                          style={{
                            textAlign:
                              "right",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                14,
                              fontWeight:
                                600,
                            }}
                          >
                            {money(
                              product.price
                            )}
                          </div>

                          {product.old_price !==
                            null &&
                            product.old_price >
                              product.price && (
                              <div
                                style={{
                                  marginTop:
                                    3,
                                  fontSize:
                                    10,
                                  opacity:
                                    0.42,
                                  textDecoration:
                                    "line-through",
                                }}
                              >
                                {money(
                                  product.old_price
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        ) : (
          <div
            style={{
              padding:
                "90px 20px",
              textAlign:
                "center",
              border:
                "1px dashed rgba(17,16,14,.16)",
            }}
          >
            <div
              style={{
                fontFamily:
                  "Georgia, serif",
                fontStyle:
                  "italic",
                fontSize:
                  34,
              }}
            >
              No products in this category.
            </div>

            <div
              style={{
                marginTop:
                  10,
                fontSize:
                  13,
                opacity:
                  0.52,
              }}
            >
              Try another category.
            </div>
          </div>
        )}
      </section>

      {/* ===================================================
          BRAND STORY
      =================================================== */}

      <section
        style={{
          background:
            darkColor,
          color:
            "#fff",
        }}
      >
        <div
          className="a-positive-brand-story"
          style={{
            maxWidth:
              1440,
            margin:
              "0 auto",
            padding:
              "100px 24px",
            display:
              "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 70,
            alignItems:
              "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing:
                  "0.25em",
                opacity:
                  0.48,
                marginBottom:
                  18,
              }}
            >
              THE A-POSITIVE STANDARD
            </div>

            <h2
              style={{
                margin: 0,
                fontFamily:
                  "Georgia, serif",
                fontStyle:
                  "italic",
                fontWeight:
                  400,
                fontSize:
                  "clamp(44px,6vw,80px)",
                lineHeight:
                  0.94,
                letterSpacing:
                  "-0.045em",
              }}
            >
              Less noise.
              <br />
              More presence.
            </h2>

            <p
              style={{
                maxWidth:
                  500,
                fontSize:
                  14,
                lineHeight:
                  1.9,
                opacity:
                  0.62,
                marginTop:
                  24,
              }}
            >
              A-POSITIVE focuses on strong
              silhouettes, considered details and
              pieces that feel relevant beyond one
              season.
            </p>

            <a
              href="#collection"
              style={{
                marginTop:
                  24,
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: 8,
                color:
                  "#fff",
                textDecoration:
                  "none",
                fontSize:
                  10,
                letterSpacing:
                  "0.16em",
              }}
            >
              EXPLORE EVERYTHING
              <ArrowRight
                size={14}
              />
            </a>
          </div>

          <div
            style={{
              aspectRatio:
                "0.95",
              overflow:
                "hidden",
            }}
          >
            <img
              src={heroImage}
              alt={
                brand.name
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
          </div>
        </div>
      </section>

      {/* ===================================================
          CART SUMMARY
      =================================================== */}

      {cartItems.length >
        0 && (
        <section
          style={{
            maxWidth:
              900,
            margin:
              "0 auto",
            padding:
              "70px 24px 20px",
          }}
        >
          <div
            style={{
              border:
                "1px solid rgba(17,16,14,.10)",
              background:
                "#fff",
              padding:
                24,
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: 15,
                flexWrap:
                  "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      9,
                    letterSpacing:
                      "0.18em",
                    textTransform:
                      "uppercase",
                    opacity:
                      0.45,
                  }}
                >
                  YOUR BAG
                </div>

                <h3
                  style={{
                    margin:
                      "8px 0 0",
                    fontFamily:
                      "Georgia, serif",
                    fontStyle:
                      "italic",
                    fontWeight:
                      400,
                    fontSize:
                      32,
                  }}
                >
                  {
                    cartCount
                  }{" "}
                  items ·{" "}
                  {money(
                    cartSubtotal
                  )}
                </h3>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  gap: 9,
                  flexWrap:
                    "wrap",
                }}
              >
                <Link
                  href="/cart"
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: 8,
                    padding:
                      "13px 18px",
                    border:
                      `1px solid ${darkColor}`,
                    background:
                      "transparent",
                    color:
                      darkColor,
                    textDecoration:
                      "none",
                    fontSize:
                      9,
                    letterSpacing:
                      "0.15em",
                  }}
                >
                  VIEW CART
                  <ShoppingBag
                    size={14}
                  />
                </Link>

                <Link
                  href="/checkout"
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: 8,
                    padding:
                      "13px 18px",
                    background:
                      darkColor,
                    color:
                      "#fff",
                    textDecoration:
                      "none",
                    fontSize:
                      9,
                    letterSpacing:
                      "0.15em",
                  }}
                >
                  CHECKOUT
                  <ArrowRight
                    size={14}
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================
          FINAL CTA
      =================================================== */}

      <section
        style={{
          maxWidth:
            1200,
          margin:
            "0 auto",
          padding:
            "100px 24px 110px",
          textAlign:
            "center",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing:
              "0.28em",
            textTransform:
              "uppercase",
            opacity:
              0.45,
          }}
        >
          A-POSITIVE
        </div>

        <h2
          style={{
            margin:
              "18px 0 0",
            fontFamily:
              "Georgia, serif",
            fontStyle:
              "italic",
            fontWeight:
              400,
            fontSize:
              "clamp(45px,7vw,90px)",
            lineHeight:
              0.9,
            letterSpacing:
              "-0.05em",
          }}
        >
          Own your presence.
        </h2>

        <Link
          href="/cart"
          style={{
            marginTop:
              30,
            display:
              "inline-flex",
            alignItems:
              "center",
            gap: 9,
            padding:
              "15px 22px",
            background:
              darkColor,
            color:
              "#fff",
            textDecoration:
              "none",
            fontSize: 10,
            letterSpacing:
              "0.17em",
          }}
        >
          GO TO BAG
          <ShoppingBag
            size={14}
          />
        </Link>
      </section>

      {/* ===================================================
          CART NOTICE
      =================================================== */}

      {cartNotice && (
        <div
          style={{
            position:
              "fixed",
            right: 18,
            top: 80,
            zIndex:
              1000,
            width:
              "min(390px, calc(100vw - 36px))",
            padding:
              "16px 18px",
            background:
              "#11100e",
            color:
              "#fff",
            boxShadow:
              "0 20px 50px rgba(0,0,0,.22)",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "flex-start",
              justifyContent:
                "space-between",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize:
                    8,
                  letterSpacing:
                    "0.17em",
                  marginBottom:
                    5,
                  fontWeight:
                    800,
                }}
              >
                BAG UPDATE
              </div>

              <div
                style={{
                  fontSize:
                    13,
                  lineHeight:
                    1.5,
                  opacity:
                    0.78,
                }}
              >
                {
                  cartNotice
                }
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setCartNotice(
                  null
                )
              }
              style={{
                border: 0,
                background:
                  "transparent",
                color:
                  "#fff",
                cursor:
                  "pointer",
                fontSize:
                  18,
                lineHeight:
                  1,
              }}
            >
              ×
            </button>
          </div>

          {!usingFallbackProducts &&
            cartCount >
              0 && (
              <div
                style={{
                  display:
                    "flex",
                  gap: 8,
                  marginTop:
                    13,
                }}
              >
                <Link
                  href="/cart"
                  onClick={() =>
                    setCartNotice(
                      null
                    )
                  }
                  style={{
                    flex: 1,
                    textAlign:
                      "center",
                    padding:
                      "10px 8px",
                    background:
                      "#fff",
                    color:
                      "#11100e",
                    textDecoration:
                      "none",
                    fontSize:
                      8,
                    fontWeight:
                      800,
                    letterSpacing:
                      "0.12em",
                  }}
                >
                  VIEW CART
                </Link>

                <Link
                  href="/checkout"
                  onClick={() =>
                    setCartNotice(
                      null
                    )
                  }
                  style={{
                    flex: 1,
                    textAlign:
                      "center",
                    padding:
                      "10px 8px",
                    background:
                      accentColor,
                    color:
                      "#11100e",
                    textDecoration:
                      "none",
                    fontSize:
                      8,
                    fontWeight:
                      800,
                    letterSpacing:
                      "0.12em",
                  }}
                >
                  CHECKOUT
                </Link>
              </div>
            )}
        </div>
      )}

      {/* ===================================================
          RESPONSIVE
      =================================================== */}

      <style jsx global>{`
        .brand-page-nav a {
          color: #11100e;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.15em;
          opacity: 0.62;
        }

        .brand-page-nav a:hover {
          opacity: 1;
        }

        @media (max-width: 900px) {
          .brand-page-nav {
            display: none !important;
          }

          .a-positive-product-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
          }

          .a-positive-brand-story {
            grid-template-columns:
              1fr !important;
          }
        }

        @media (max-width: 560px) {
          .a-positive-product-grid {
            gap: 11px !important;
          }

          .brand-page-nav {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}