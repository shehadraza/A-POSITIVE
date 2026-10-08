"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  ArrowRight,
  ChevronRight,
  Heart,
  ShoppingBag,
  X,
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
   FALLBACK BRAND
========================================================= */

const fallbackBrand: Brand = {
  id: "fallback-blue-dream",
  slug: "blue-dream",
  name: "BLUE DREAM",
  tagline: "EVERYDAY. ELEVATED.",
  image_url:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=90",
  accent_color: "#D9E6F5",
  dark_color: "#071A38",
  active: true,
  sort_order: 1,
};

/* =========================================================
   FALLBACK PRODUCTS
========================================================= */

const fallbackProducts: Product[] = [
  {
    id: "fallback-bd-shirt",
    name: "Essential Oxford Shirt",
    brand: "BLUE DREAM",
    category: "SHIRT",
    price: 1490,
    old_price: 1890,
    image_url:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1000&q=90",
    stock: 25,
    featured: true,
    sizes: [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],
  },

  {
    id: "fallback-bd-tee",
    name: "Signature Oversized Tee",
    brand: "BLUE DREAM",
    category: "T-SHIRT",
    price: 990,
    old_price: 1290,
    image_url:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=90",
    stock: 18,
    featured: true,
    sizes: [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],
  },

  {
    id: "fallback-bd-polo",
    name: "Premium Essential Polo",
    brand: "BLUE DREAM",
    category: "POLO",
    price: 1190,
    old_price: 1490,
    image_url:
      "https://images.unsplash.com/photo-1625910513413-5fc45e9d98b8?auto=format&fit=crop&w=1000&q=90",
    stock: 40,
    featured: true,
    sizes: [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],
  },
];

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  "ALL",
  "SHIRT",
  "POLO",
  "T-SHIRT",
  "PANT",
  "PANJABI",
];

/* =========================================================
   HELPERS
========================================================= */

function money(value: number) {
  return `৳${Number(
    value || 0
  ).toLocaleString("en-BD")}`;
}

function normalizeText(
  value: unknown
) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toNumber(
  value: unknown
) {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  const cleaned = String(
    value ?? ""
  ).replace(/[^\d.-]/g, "");

  const parsed = Number(cleaned);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}

function normalizeSizes(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(
      (item: unknown) =>
        String(item).trim()
    )
    .filter(Boolean);
}

function normalizeProduct(
  value: unknown
): Product {
  const row =
    value !== null &&
    typeof value === "object"
      ? (value as Record<
          string,
          unknown
        >)
      : {};

  return {
    id: String(
      row.id ?? ""
    ),

    name: String(
      row.name ??
        "Untitled Product"
    ),

    brand:
      row.brand === null ||
      row.brand === undefined
        ? null
        : String(row.brand),

    category:
      row.category === null ||
      row.category === undefined
        ? null
        : String(row.category),

    price: toNumber(
      row.price
    ),

    old_price:
      row.old_price !== null &&
      row.old_price !==
        undefined
        ? toNumber(
            row.old_price
          )
        : row.oldPrice !==
            null &&
          row.oldPrice !==
            undefined
        ? toNumber(
            row.oldPrice
          )
        : null,

    image_url:
      row.image_url !==
        null &&
      row.image_url !==
        undefined
        ? String(
            row.image_url
          )
        : row.image !==
              null &&
          row.image !==
              undefined
        ? String(row.image)
        : null,

    stock:
      toNumber(
        row.stock
      ),

    featured:
      Boolean(
        row.featured
      ),

    sizes:
      normalizeSizes(
        row.sizes
      ),
  };
}

/* =========================================================
   STORED CART NORMALIZER
========================================================= */

function normalizeStoredCartItem(
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

  const nestedProduct =
    item.product !== null &&
    typeof item.product === "object"
      ? (item.product as Record<
          string,
          unknown
        >)
      : null;

  const productId =
    String(
      item.productId ??
        nestedProduct?.id ??
        item.id ??
        ""
    );

  if (!productId) {
    return null;
  }

  const productSource =
    nestedProduct ??
    item;

  if (
    !productSource.name
  ) {
    return null;
  }

  const product: Product = {
    id: productId,

    name: String(
      productSource.name
    ),

    brand:
      productSource.brand !==
        null &&
      productSource.brand !==
        undefined
        ? String(
            productSource.brand
          )
        : "BLUE DREAM",

    category:
      productSource.category !==
        null &&
      productSource.category !==
        undefined
        ? String(
            productSource.category
          )
        : "FASHION",

    price:
      toNumber(
        productSource.price
      ),

    old_price:
      productSource.old_price !==
        null &&
      productSource.old_price !==
        undefined
        ? toNumber(
            productSource.old_price
          )
        : null,

    image_url:
      productSource.image_url !==
        null &&
      productSource.image_url !==
        undefined
        ? String(
            productSource.image_url
          )
        : productSource.image !==
            null &&
          productSource.image !==
            undefined
        ? String(
            productSource.image
          )
        : "",

    stock:
      toNumber(
        productSource.stock
      ),

    featured:
      Boolean(
        productSource.featured
      ),

    sizes:
      normalizeSizes(
        productSource.sizes
      ),
  };

  const size =
    item.size !== null &&
    item.size !== undefined
      ? String(item.size)
      : "";

  return {
    id: String(
      item.id ??
        `${product.id}-${size || "default"}`
    ),

    productId:
      product.id,

    name:
      product.name,

    brand:
      product.brand ??
      "BLUE DREAM",

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

    quantity:
      Math.max(
        1,
        Number(
          item.quantity ?? 1
        )
      ),

    size,

    product,
  };
}

/* =========================================================
   CART SERIALIZER
========================================================= */

function serializeCartItem(
  product: Product,
  quantity: number,
  size: string
): CartItem {
  return {
    id: `${product.id}-${size || "default"}`,

    productId:
      product.id,

    name:
      product.name,

    brand:
      product.brand ??
      "BLUE DREAM",

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

    quantity,

    size,

    product,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function BlueDreamPage() {
  const [
    brand,
    setBrand,
  ] = useState<Brand>(
    fallbackBrand
  );

  const [
    products,
    setProducts,
  ] = useState<Product[]>(
    []
  );

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("ALL");

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
    Product | null
  >(null);

  /* =======================================================
     LOCAL CART + WISHLIST
  ======================================================= */

  useEffect(() => {
    function readCart() {
      const savedCart =
        localStorage.getItem(
          CART_KEY
        );

      if (!savedCart) {
        setCartItems([]);
        return;
      }

      try {
        const parsed: unknown =
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
                item: unknown
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
          "BLUE DREAM CART LOAD ERROR:",
          error
        );

        setCartItems([]);
      }
    }

    function readWishlist() {
      const savedWishlist =
        localStorage.getItem(
          WISHLIST_KEY
        );

      if (!savedWishlist) {
        setWishlistIds([]);
        return;
      }

      try {
        const parsed: unknown =
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
              (
                id: unknown
              ) =>
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
     CMS DATA
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadBrandAndProducts() {
      try {
        const [
          brandResult,
          productsResult,
        ] = await Promise.all([
          supabase
            .from("brands")
            .select(
              "id,slug,name,tagline,image_url,accent_color,dark_color,active,sort_order"
            )
            .eq(
              "slug",
              "blue-dream"
            )
            .eq(
              "active",
              true
            )
            .maybeSingle(),

          supabase
            .from("products")
            .select(
              "id,name,brand,category,price,old_price,image_url,stock,featured,sizes,created_at"
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
            ),
        ]);

        if (cancelled) {
          return;
        }

        if (
          !brandResult.error &&
          brandResult.data
        ) {
          setBrand(
            brandResult.data as Brand
          );
        }

        if (
          productsResult.error
        ) {
          console.error(
            "BLUE DREAM PRODUCTS DATABASE ERROR:",
            productsResult.error
          );

          setProducts(
            fallbackProducts
          );

          return;
        }

        const allProducts =
          (
            productsResult.data ??
            []
          ).map(
            (row: unknown) =>
              normalizeProduct(
                row
              )
          );

        const currentBrand =
          !brandResult.error &&
          brandResult.data
            ? (brandResult.data as Brand)
            : fallbackBrand;

        const possibleBrandValues =
          [
            "BLUE DREAM",
            "Blue Dream",
            "blue-dream",
            currentBrand.name,
            currentBrand.slug,
            currentBrand.id,
          ]
            .filter(Boolean)
            .map(
              normalizeText
            );

        const blueDreamProducts =
          allProducts.filter(
            (
              product: Product
            ) =>
              possibleBrandValues.includes(
                normalizeText(
                  product.brand
                )
              )
          );

        if (
          blueDreamProducts.length >
          0
        ) {
          setProducts(
            blueDreamProducts
          );
        } else {
          console.warn(
            "No BLUE DREAM products found in Supabase."
          );

          setProducts(
            fallbackProducts
          );
        }
      } catch (error) {
        console.error(
          "BLUE DREAM PAGE LOAD ERROR:",
          error
        );

        if (!cancelled) {
          setProducts(
            fallbackProducts
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
          "blue-dream-brand-page"
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
              "slug=eq.blue-dream",
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
          "blue-dream-products-page"
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
     CART NOTICE AUTO CLOSE
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
        3500
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [cartNotice]);

  /* =======================================================
     FILTERED PRODUCTS
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
          product: Product
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
            total: number,
            item: CartItem
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
      wishlistIds.includes(id)
        ? wishlistIds.filter(
            (
              item: string
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
  }

  /* =======================================================
     ADD TO CART
  ======================================================= */

  async function addToCart(
    product: Product
  ) {
    if (
      product.stock <= 0
    ) {
      return;
    }

    if (
      product.id.startsWith(
        "fallback-"
      )
    ) {
      setCartNotice(
        product
      );

      return;
    }

    /* -----------------------------------------------
       LOGIN REQUIRED
    ------------------------------------------------ */

    
    

    /* -----------------------------------------------
       SIZE PRODUCTS
       Send customer to product details
    ------------------------------------------------ */

    if (
      product.sizes.length >
      0
    ) {
      window.location.href =
        `/products/${product.id}`;

      return;
    }

    /* -----------------------------------------------
       NORMAL PRODUCT
    ------------------------------------------------ */

    const existing =
      cartItems.find(
        (
          item: CartItem
        ) =>
          item.productId ===
            product.id &&
          item.size === ""
      );

    let next: CartItem[];

    if (existing) {
      const nextQuantity =
        Math.min(
          Number(
            existing.quantity
          ) + 1,
          Math.max(
            product.stock,
            1
          )
        );

      next =
        cartItems.map(
          (
            item: CartItem
          ) =>
            item.productId ===
              product.id &&
            item.size === ""
              ? serializeCartItem(
                  product,
                  nextQuantity,
                  ""
                )
              : item
        );
    } else {
      next = [
        ...cartItems,
        serializeCartItem(
          product,
          1,
          ""
        ),
      ];
    }

    setCartItems(
      next
    );

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(
        next
      )
    );

    window.dispatchEvent(
      new Event(
        "a_positive_cart_updated"
      )
    );

    setCartNotice(
      product
    );
  }

  /* =======================================================
     COLORS / HERO
  ======================================================= */

  const heroImage =
    brand.image_url ??
    fallbackBrand.image_url ??
    "";

  const darkColor =
    brand.dark_color ||
    "#071A38";

  const accentColor =
    brand.accent_color ||
    "#D9E6F5";

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
      {/* =================================================
          NAVBAR
      ================================================= */}

      <header
        style={{
          position:
            "sticky",
          top: 0,
          zIndex: 50,
          background:
            "rgba(248,247,243,0.92)",
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
              "16px 24px",
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: 20,
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration:
                0.6,
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
                fontSize: 24,
                letterSpacing:
                  "-0.07em",
              }}
            >
              A-POSITIVE
            </Link>
          </motion.div>

          <nav
            className="brand-page-nav"
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 25,
            }}
          >
            <Link href="/">
              HOME
            </Link>

            <Link href="/#product-explorer">
              SHOP
            </Link>

            <Link href="/brands/a-positive">
              A-POSITIVE
            </Link>

            <Link href="/brands/shopping-zone-bd">
              SHOPPING ZONE BD
            </Link>
          </nav>

          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration:
                0.6,
              delay:
                0.1,
            }}
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
              className="round-nav-button"
              aria-label="Wishlist"
            >
              <Heart
                size={17}
              />
            </Link>

            <Link
              href="/cart"
              className="round-nav-button cart-nav-button"
              aria-label="Cart"
            >
              <ShoppingBag
                size={17}
              />

              {cartCount >
                0 && (
                <span>
                  {
                    cartCount
                  }
                </span>
              )}
            </Link>
          </motion.div>
        </div>
      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section
        style={{
          maxWidth: 1440,
          margin:
            "0 auto",
          padding:
            "18px 24px 0",
        }}
      >
        <motion.div
          className="blue-dream-hero"
          initial={{
            opacity: 0,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.9,
          }}
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
          <motion.img
            src={heroImage}
            alt={
              brand.name
            }
            initial={{
              scale: 1.08,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              duration: 1.4,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
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
                0.72,
            }}
          />

          <div
            style={{
              position:
                "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(7,26,56,.90) 0%, rgba(7,26,56,.48) 48%, rgba(7,26,56,.08) 100%)",
            }}
          />

          <div
            style={{
              position:
                "absolute",
              right:
                "6%",
              top:
                "10%",
              width:
                180,
              height:
                180,
              border:
                "1px solid rgba(255,255,255,.12)",
              borderRadius:
                "50%",
            }}
          />

          <div
            style={{
              position:
                "relative",
              minHeight:
                680,
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
            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration:
                  0.65,
                delay:
                  0.15,
              }}
              style={{
                fontSize:
                  10,
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
              BLUE DREAM
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration:
                  0.8,
                delay:
                  0.22,
              }}
              style={{
                maxWidth:
                  900,
                margin: 0,
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
                fontStyle:
                  "italic",
                fontWeight:
                  400,
                fontSize:
                  "clamp(58px,9vw,125px)",
                lineHeight:
                  0.87,
                letterSpacing:
                  "-0.055em",
              }}
            >
              {
                brand.name
              }
            </motion.h1>

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration:
                  0.65,
                delay:
                  0.35,
              }}
              style={{
                marginTop:
                  22,
                fontSize:
                  14,
                letterSpacing:
                  "0.17em",
                textTransform:
                  "uppercase",
                opacity:
                  0.86,
              }}
            >
              {brand.tagline ||
                "EVERYDAY. ELEVATED."}
            </motion.div>

            <motion.p
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration:
                  0.65,
                delay:
                  0.42,
              }}
              style={{
                maxWidth:
                  560,
                marginTop:
                  22,
                fontSize:
                  14,
                lineHeight:
                  1.9,
                opacity:
                  0.7,
              }}
            >
              Modern essentials designed
              for effortless everyday
              confidence. Clean silhouettes,
              versatile pieces and elevated
              basics for every day.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration:
                  0.65,
                delay:
                  0.5,
              }}
              style={{
                marginTop:
                  28,
                display:
                  "flex",
                gap: 10,
                flexWrap:
                  "wrap",
              }}
            >
              <a
                href="#collection"
                className="hero-light-button"
              >
                EXPLORE BLUE DREAM

                <ArrowRight
                  size={14}
                />
              </a>

              <Link
                href="/#product-explorer"
                className="hero-outline-button"
              >
                SHOP ALL

                <ChevronRight
                  size={14}
                />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* =================================================
          INTRO
      ================================================= */}

      <section
        style={{
          maxWidth:
            1100,
          margin:
            "0 auto",
          padding:
            "100px 24px 78px",
          textAlign:
            "center",
        }}
      >
        <motion.div
          initial={{
            scaleX: 0,
            opacity: 0,
          }}
          whileInView={{
            scaleX: 1,
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration:
              0.7,
          }}
          style={{
            width: 48,
            height: 1,
            background:
              darkColor,
            margin:
              "0 auto 24px",
          }}
        />

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration:
              0.6,
          }}
          className="micro-heading"
        >
          BLUE DREAM STANDARD
        </motion.div>

        <motion.h2
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration:
              0.75,
            delay:
              0.08,
          }}
          style={{
            margin:
              "18px 0 0",
            fontFamily:
              "Georgia, 'Times New Roman', serif",
            fontStyle:
              "italic",
            fontWeight:
              400,
            fontSize:
              "clamp(40px,5.5vw,72px)",
            lineHeight:
              0.98,
            letterSpacing:
              "-0.04em",
          }}
        >
          Everyday pieces.
          <br />
          Elevated details.
        </motion.h2>

        <motion.p
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration:
              0.7,
            delay:
              0.15,
          }}
          style={{
            maxWidth:
              680,
            margin:
              "26px auto 0",
            fontSize:
              14,
            lineHeight:
              1.95,
            opacity:
              0.56,
          }}
        >
          Blue Dream brings together refined basics
          for modern everyday wear. Easy to style,
          easy to wear and designed to stay relevant.
        </motion.p>
      </section>

      {/* =================================================
          FILTER
      ================================================= */}

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
            maxWidth:
              1440,
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
              category: string
            ) => (
              <motion.button
                key={
                  category
                }
                type="button"
                onClick={() =>
                  setActiveCategory(
                    category
                  )
                }
                whileTap={{
                  scale:
                    0.96,
                }}
                whileHover={{
                  y:
                    -2,
                }}
                style={{
                  flexShrink:
                    0,
                  padding:
                    "10px 16px",
                  border:
                    activeCategory ===
                    category
                      ? `1px solid ${darkColor}`
                      : "1px solid rgba(17,16,14,.15)",
                  background:
                    activeCategory ===
                    category
                      ? darkColor
                      : "transparent",
                  color:
                    activeCategory ===
                    category
                      ? "#fff"
                      : "#11100e",
                  cursor:
                    "pointer",
                  fontSize:
                    9,
                  letterSpacing:
                    "0.17em",
                  transition:
                    "all .25s ease",
                }}
              >
                {
                  category
                }
              </motion.button>
            )
          )}
        </div>
      </section>

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <section
        style={{
          maxWidth:
            1440,
          margin:
            "0 auto",
          padding:
            "92px 24px",
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          style={{
            display:
              "flex",
            alignItems:
              "flex-end",
            justifyContent:
              "space-between",
            gap: 20,
            marginBottom:
              32,
          }}
        >
          <div>
            <div className="micro-heading">
              BLUE DREAM
            </div>

            <h2
              style={{
                margin:
                  "10px 0 0",
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
                fontStyle:
                  "italic",
                fontWeight:
                  400,
                fontSize:
                  "clamp(42px,5vw,68px)",
                lineHeight:
                  0.95,
                letterSpacing:
                  "-0.04em",
              }}
            >
              The collection.
            </h2>
          </div>

          <div className="collection-count">
            {
              visibleProducts.length
            }{" "}
            ITEMS
          </div>
        </motion.div>

        <AnimatePresence
          mode="popLayout"
        >
          {visibleProducts.length >
          0 ? (
            <motion.div
              className="blue-dream-product-grid"
              layout
            >
              {visibleProducts.map(
                (
                  product: Product,
                  index: number
                ) => {
                  const liked =
                    wishlistIds.includes(
                      product.id
                    );

                  const hasSizes =
                    product.sizes
                      .length >
                    0;

                  return (
                    <motion.article
                      key={
                        product.id
                      }
                      layout
                      initial={{
                        opacity: 0,
                        y: 30,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale:
                          0.96,
                      }}
                      transition={{
                        duration:
                          0.55,
                        delay:
                          index *
                          0.04,
                      }}
                    >
                      <div className="bd-product-media">

                        <Link
                          href={`/products/${product.id}`}
                          className="bd-product-image-link"
                        >
                          <motion.img
                            src={
                              product.image_url ||
                              fallbackProducts[0]
                                .image_url ||
                              ""
                            }
                            alt={
                              product.name
                            }
                            whileHover={{
                              scale:
                                1.045,
                            }}
                            transition={{
                              duration:
                                0.55,
                            }}
                          />
                        </Link>

                        {/* WISHLIST */}

                        <button
                          type="button"
                          disabled={
                            product.stock <=
                            0
                          }
                          onClick={() =>
                            toggleWishlist(
                              product.id
                            )
                          }
                          className={`bd-wishlist ${
                            liked
                              ? "liked"
                              : ""
                          }`}
                        >
                          <Heart
                            size={
                              15
                            }
                            fill={
                              liked
                                ? darkColor
                                : "transparent"
                            }
                          />
                        </button>

                        {/* SIZE BADGE */}

                        {hasSizes &&
                          product.stock >
                            0 && (
                            <span className="bd-size-badge">
                              SIZES AVAILABLE
                            </span>
                          )}

                        {/* LOW STOCK */}

                        {product.stock <=
                          3 &&
                          product.stock >
                            0 && (
                          <span
                            className={
                              hasSizes
                                ? "bd-stock-badge bd-stock-badge-with-size"
                                : "bd-stock-badge"
                            }
                          >
                            LOW STOCK
                          </span>
                        )}

                        {/* SOLD OUT */}

                        {product.stock <=
                          0 && (
                          <span className="bd-sold-badge">
                            SOLD OUT
                          </span>
                        )}

                        {/* QUICK ADD */}

                        <motion.button
                          type="button"
                          disabled={
                            product.stock <=
                            0
                          }
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                          whileHover={
                            product.stock >
                            0
                              ? {
                                  y:
                                    -3,
                                }
                              : undefined
                          }
                          whileTap={
                            product.stock >
                            0
                              ? {
                                  scale:
                                    0.97,
                                }
                              : undefined
                          }
                          className="bd-quick-add"
                          style={{
                            background:
                              product.stock >
                              0
                                ? darkColor
                                : "rgba(7,26,56,.45)",
                            cursor:
                              product.stock >
                              0
                                ? "pointer"
                                : "not-allowed",
                          }}
                        >
                          {product.stock >
                          0
                            ? hasSizes
                              ? "SELECT SIZE"
                              : "ADD TO BAG"
                            : "SOLD OUT"}

                          {product.stock >
                            0 && (
                            <ArrowRight
                              size={
                                14
                              }
                            />
                          )}
                        </motion.button>
                      </div>

                      <div className="bd-product-info">
                        <div className="bd-product-top">

                          <div>
                            <div className="bd-product-category">
                              {
                                product.category
                              }
                            </div>

                            <Link
                              href={`/products/${product.id}`}
                              className="bd-product-name"
                            >
                              {
                                product.name
                              }
                            </Link>

                            {hasSizes && (
                              <div className="bd-size-list">
                                {product.sizes.map(
                                  (
                                    size: string
                                  ) => (
                                    <span
                                      key={
                                        size
                                      }
                                    >
                                      {
                                        size
                                      }
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                          </div>

                          <div className="bd-price-box">
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

                        </div>
                      </div>
                    </motion.article>
                  );
                }
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              style={{
                padding:
                  "100px 20px",
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
                No products in this
                category.
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
                Try another
                category.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* =================================================
          BRAND STORY
      ================================================= */}

      <section
        style={{
          background:
            darkColor,
          color:
            "#fff",
          overflow:
            "hidden",
        }}
      >
        <div
          className="blue-dream-story"
          style={{
            maxWidth:
              1440,
            margin:
              "0 auto",
            padding:
              "105px 24px",
            display:
              "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 70,
            alignItems:
              "center",
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              x: -35,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount:
                0.25,
            }}
            transition={{
              duration:
                0.8,
            }}
          >
            <div className="bd-light-micro">
              BLUE DREAM PHILOSOPHY
            </div>

            <h2
              style={{
                margin:
                  "18px 0 0",
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
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
              Everyday.
              <br />
              Elevated.
            </h2>

            <p
              style={{
                maxWidth:
                  520,
                fontSize:
                  14,
                lineHeight:
                  1.95,
                opacity:
                  0.62,
                marginTop:
                  24,
              }}
            >
              From the weekday morning to the late
              evening, Blue Dream is designed to
              keep your everyday wardrobe simple,
              sharp and comfortable.
            </p>

            <Link
              href="/#product-explorer"
              className="bd-story-link"
            >
              SHOP THE FULL COLLECTION

              <ArrowRight
                size={14}
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 35,
              scale:
                0.97,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount:
                0.25,
            }}
            transition={{
              duration:
                0.9,
            }}
            style={{
              aspectRatio:
                "0.95",
              overflow:
                "hidden",
            }}
          >
            <motion.img
              src={heroImage}
              alt={
                brand.name
              }
              whileHover={{
                scale:
                  1.04,
              }}
              transition={{
                duration:
                  0.65,
              }}
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
          </motion.div>
        </div>
      </section>

      {/* =================================================
          FINAL CTA
      ================================================= */}

      <section
        style={{
          maxWidth:
            1200,
          margin:
            "0 auto",
          padding:
            "105px 24px 115px",
          textAlign:
            "center",
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="micro-heading"
        >
          BLUE DREAM
        </motion.div>

        <motion.h2
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration:
              0.7,
            delay:
              0.08,
          }}
          style={{
            margin:
              "18px 0 0",
            fontFamily:
              "Georgia, 'Times New Roman', serif",
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
          Make everyday
          elevated.
        </motion.h2>

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration:
              0.65,
            delay:
              0.18,
          }}
        >
          <Link
            href="/#product-explorer"
            className="bd-final-button"
          >
            SHOP BLUE DREAM

            <ArrowRight
              size={14}
            />
          </Link>
        </motion.div>
      </section>

      {/* =================================================
          ADD TO CART NOTICE
      ================================================= */}

      <AnimatePresence>
        {cartNotice && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              scale:
                0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale:
                0.96,
            }}
            transition={{
              duration:
                0.32,
            }}
            className="bd-cart-notice"
          >
            <div className="bd-cart-notice-main">

              <div
                className="bd-cart-check"
                style={{
                  background:
                    darkColor,
                }}
              >
                <ShoppingBag
                  size={17}
                />
              </div>

              <div>
                <strong>
                  {cartNotice.sizes.length >
                  0
                    ? "SELECT SIZE"
                    : "ADDED TO BAG"}
                </strong>

                <span>
                  {cartNotice.sizes.length >
                  0
                    ? "Choose your preferred size to continue."
                    : cartNotice.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCartNotice(
                    null
                  )
                }
              >
                <X size={16} />
              </button>

            </div>

            <div className="bd-cart-actions">

              <Link
                href={`/products/${cartNotice.id}`}
                onClick={() =>
                  setCartNotice(
                    null
                  )
                }
              >
                VIEW PRODUCT
              </Link>

              <Link
                href="/cart"
                onClick={() =>
                  setCartNotice(
                    null
                  )
                }
                style={{
                  background:
                    darkColor,
                  color:
                    "#fff",
                }}
              >
                VIEW CART
              </Link>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

        .brand-page-nav a {
          color: #11100e;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.15em;
          opacity: 0.6;
          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }

        .brand-page-nav a:hover {
          opacity: 1;
        }

        .round-nav-button {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(17, 16, 14, 0.09);
          display: grid;
          place-items: center;
          color: #11100e;
          text-decoration: none;
          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .round-nav-button:hover {
          transform: translateY(-2px);
          background: rgba(17, 16, 14, 0.04);
        }

        .cart-nav-button span {
          position: absolute;
          top: -4px;
          right: -3px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #071a38;
          color: #fff;
          font-size: 8px;
        }

        .hero-light-button,
        .hero-outline-button,
        .bd-story-link,
        .bd-final-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.17em;
          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .hero-light-button {
          padding: 15px 22px;
          background: #fff;
          color: #071a38;
        }

        .hero-light-button:hover,
        .hero-outline-button:hover,
        .bd-final-button:hover {
          transform: translateY(-3px);
        }

        .hero-outline-button {
          padding: 15px 22px;
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .micro-heading,
        .collection-count,
        .bd-light-micro {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .micro-heading,
        .collection-count {
          opacity: 0.45;
        }

        .bd-light-micro {
          opacity: 0.48;
        }

        .blue-dream-product-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 20px;
        }

        .bd-product-media {
          position: relative;
          overflow: hidden;
          background: #e9eef5;
        }

        .bd-product-image-link {
          display: block;
          aspect-ratio: 0.8;
          overflow: hidden;
        }

        .bd-product-image-link img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .bd-wishlist {
          position: absolute;
          top: 11px;
          right: 11px;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.96);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
          z-index: 5;
        }

        .bd-wishlist:hover {
          transform: scale(1.08);
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .bd-size-badge,
        .bd-stock-badge,
        .bd-sold-badge {
          position: absolute;
          left: 12px;
          padding: 7px 9px;
          font-size: 8px;
          letter-spacing: 0.14em;
        }

        .bd-size-badge {
          top: 12px;
          background: #071a38;
          color: #fff;
        }

        .bd-stock-badge {
          top: 42px;
          background: #fff;
          color: #11100e;
        }

        .bd-stock-badge-with-size {
          top: 43px;
        }

        .bd-sold-badge {
          top: 12px;
          background: #071a38;
          color: #fff;
        }

        .bd-quick-add {
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 13px 10px;
          border: 0;
          color: #fff;
          font-size: 9px;
          letter-spacing: 0.16em;
          transition:
            filter 0.2s ease,
            transform 0.2s ease;
          z-index: 5;
        }

        .bd-quick-add:hover {
          filter: brightness(1.08);
        }

        .bd-product-info {
          padding-top: 15px;
        }

        .bd-product-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: flex-start;
        }

        .bd-product-category {
          margin-bottom: 7px;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.42;
        }

        .bd-product-name {
          color: #11100e;
          text-decoration: none;
          font-size: 14px;
          line-height: 1.45;
          transition: opacity 0.2s ease;
        }

        .bd-product-name:hover {
          opacity: 0.6;
        }

        .bd-size-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 8px;
        }

        .bd-size-list span {
          padding: 4px 6px;
          border: 1px solid
            rgba(17, 16, 14, 0.12);
          background: rgba(
            17,
            16,
            14,
            0.02
          );
          font-size: 8px;
          opacity: 0.58;
        }

        .bd-price-box {
          text-align: right;
          white-space: nowrap;
        }

        .bd-price-box strong {
          display: block;
          font-size: 14px;
          font-weight: 600;
        }

        .bd-price-box del {
          display: block;
          margin-top: 3px;
          font-size: 10px;
          opacity: 0.42;
        }

        .bd-story-link {
          margin-top: 25px;
          color: #fff;
          opacity: 0.85;
        }

        .bd-story-link:hover {
          opacity: 1;
          transform: translateX(4px);
        }

        .bd-final-button {
          margin-top: 30px;
          padding: 15px 22px;
          background: #071a38;
          color: #fff;
        }

        .bd-cart-notice {
          position: fixed;
          top: 82px;
          right: 20px;
          z-index: 10000;
          width: min(
            400px,
            calc(100vw - 30px)
          );
          padding: 17px;
          background: #fff;
          color: #11100e;
          border: 1px solid
            rgba(17, 16, 14, 0.08);
          box-shadow:
            0 24px 70px
              rgba(0, 0, 0, 0.16);
        }

        .bd-cart-notice-main {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .bd-cart-check {
          width: 40px;
          height: 40px;
          min-width: 40px;
          display: grid;
          place-items: center;
          color: #fff;
        }

        .bd-cart-notice-main
          > div:nth-child(2) {
          flex: 1;
          min-width: 0;
        }

        .bd-cart-notice-main strong {
          display: block;
          font-size: 11px;
          letter-spacing: 0.13em;
        }

        .bd-cart-notice-main span {
          display: block;
          margin-top: 5px;
          font-size: 13px;
          line-height: 1.45;
          opacity: 0.55;
        }

        .bd-cart-notice-main button {
          border: 0;
          padding: 3px;
          background: transparent;
          cursor: pointer;
          opacity: 0.55;
        }

        .bd-cart-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 15px;
        }

        .bd-cart-actions a {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          text-decoration: none;
          background: #f1f1ee;
          color: #11100e;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.09em;
        }

        @media (max-width: 1050px) {
          .blue-dream-product-grid {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }
        }

        @media (max-width: 900px) {
          .brand-page-nav {
            display: none !important;
          }

          .blue-dream-product-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .blue-dream-story {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 620px) {
          .blue-dream-hero {
            min-height: 590px !important;
          }

          .blue-dream-hero
            > div:last-child {
            min-height: 590px !important;
          }

          .blue-dream-product-grid {
            grid-template-columns: 1fr 1fr;
            gap: 13px;
          }

          .bd-product-top {
            flex-direction: column;
            gap: 9px;
          }

          .bd-price-box {
            text-align: left;
          }

          .bd-cart-notice {
            top: 72px;
            right: 15px;
            width: calc(100vw - 30px);
          }
        }

        @media (max-width: 430px) {
          .blue-dream-product-grid {
            grid-template-columns: 1fr;
          }

          .blue-dream-hero {
            min-height: 540px !important;
          }

          .blue-dream-hero
            > div:last-child {
            min-height: 540px !important;
          }
        }
      `}</style>
    </main>
  );
}