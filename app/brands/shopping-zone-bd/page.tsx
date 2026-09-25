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
  product: Product;
};

const supabase = createClient();

/* =========================================================
   FALLBACK BRAND
========================================================= */

const fallbackBrand: Brand = {
  id: "fallback-shopping-zone-bd",
  slug: "shopping-zone-bd",
  name: "SHOPPING ZONE BD",
  tagline: "STYLE WITHOUT LIMITS.",
  image_url:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=90",
  accent_color: "#F4D9DC",
  dark_color: "#8E101D",
  active: true,
  sort_order: 2,
};

/* =========================================================
   FALLBACK PRODUCTS
========================================================= */

const fallbackProducts: Product[] = [
  {
    id: "fallback-sz-dress",
    name: "Modern Evening Dress",
    brand: "SHOPPING ZONE BD",
    category: "DRESS",
    price: 2490,
    old_price: 3100,
    image_url:
      "https://images.unsplash.com/photo-1566479179817-c0d3c8c5f2e7?auto=format&fit=crop&w=1000&q=90",
    stock: 15,
    featured: true,
  },

  {
    id: "fallback-sz-bag",
    name: "Structured Leather Bag",
    brand: "SHOPPING ZONE BD",
    category: "BAG",
    price: 1850,
    old_price: 2300,
    image_url:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=90",
    stock: 12,
    featured: true,
  },

  {
    id: "fallback-sz-signature-bag",
    name: "Everyday Signature Bag",
    brand: "SHOPPING ZONE BD",
    category: "BAG",
    price: 1590,
    old_price: 1990,
    image_url:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1000&q=90",
    stock: 21,
    featured: false,
  },
];

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  "ALL",
  "DRESS",
  "BAG",
  "ACCESSORIES",
];

/* =========================================================
   HELPERS
========================================================= */

function money(value: number) {
  return `৳${Number(
    value || 0
  ).toLocaleString("en-BD")}`;
}

function normalizeProduct(
  row: any
): Product {
  return {
    id: String(row.id),

    name:
      row.name ??
      "Untitled Product",

    brand:
      row.brand ??
      null,

    category:
      row.category ??
      null,

    price:
      Number(
        row.price ?? 0
      ),

    old_price:
      row.old_price === null ||
      row.old_price === undefined
        ? null
        : Number(
            row.old_price
          ),

    image_url:
      row.image_url ??
      null,

    stock:
      Number(
        row.stock ?? 0
      ),

    featured:
      Boolean(
        row.featured
      ),
  };
}

/* =========================================================
   CART NORMALIZER
   Compatible with main homepage cart
========================================================= */

function normalizeStoredCartItem(
  item: any
): CartItem | null {
  if (!item) {
    return null;
  }

  const nestedProduct =
    item?.product &&
    typeof item.product === "object"
      ? item.product
      : null;

  const productId = String(
    item?.productId ??
      nestedProduct?.id ??
      item?.id ??
      ""
  );

  if (!productId) {
    return null;
  }

  const productSource =
    nestedProduct ??
    item;

  if (
    !productSource?.name
  ) {
    return null;
  }

  const product: Product = {
    id: productId,

    name:
      productSource.name ??
      "Untitled Product",

    brand:
      productSource.brand ??
      "SHOPPING ZONE BD",

    category:
      productSource.category ??
      "FASHION",

    price:
      Number(
        productSource.price
      ) || 0,

    old_price:
      productSource.old_price !==
        undefined &&
      productSource.old_price !==
        null
        ? Number(
            productSource.old_price
          )
        : productSource.oldPrice !==
            undefined
        ? Number(
            productSource.oldPrice
          )
        : null,

    image_url:
      productSource.image_url ??
      productSource.image ??
      "",

    stock:
      Number(
        productSource.stock
      ) || 0,

    featured:
      Boolean(
        productSource.featured
      ),
  };

  return {
    id:
      product.id,

    productId:
      product.id,

    name:
      product.name,

    brand:
      product.brand ??
      "SHOPPING ZONE BD",

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
          item?.quantity ?? 1
        )
      ),

    product,
  };
}

function serializeCartItem(
  product: Product,
  quantity: number
): CartItem {
  return {
    id:
      product.id,

    productId:
      product.id,

    name:
      product.name,

    brand:
      product.brand ??
      "SHOPPING ZONE BD",

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

    product,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function ShoppingZoneBDPage() {
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
    fallbackProducts
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
  ] = useState<Product | null>(
    null
  );

  /* =======================================================
     LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    const savedCart =
      localStorage.getItem(
        "a_positive_cart"
      );

    const savedWishlist =
      localStorage.getItem(
        "a_positive_wishlist"
      );

    if (savedCart) {
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
          const normalized =
            parsed
              .map(
                normalizeStoredCartItem
              )
              .filter(
                Boolean
              ) as CartItem[];

          setCartItems(
            normalized
          );
        }
      } catch {
        setCartItems([]);
      }
    }

    if (savedWishlist) {
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

    const cartListener =
      () => {
        const value =
          localStorage.getItem(
            "a_positive_cart"
          );

        if (!value) {
          setCartItems([]);
          return;
        }

        try {
          const parsed =
            JSON.parse(
              value
            );

          if (
            Array.isArray(
              parsed
            )
          ) {
            const normalized =
              parsed
                .map(
                  normalizeStoredCartItem
                )
                .filter(
                  Boolean
                ) as CartItem[];

            setCartItems(
              normalized
            );
          }
        } catch {
          setCartItems([]);
        }
      };

    const wishlistListener =
      () => {
        const value =
          localStorage.getItem(
            "a_positive_wishlist"
          );

        if (!value) {
          setWishlistIds([]);
          return;
        }

        try {
          const parsed =
            JSON.parse(
              value
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
    const loadBrandAndProducts =
      async () => {
        const [
          brandResult,
          productsResult,
        ] =
          await Promise.all([
            supabase
              .from("brands")
              .select(
                "id,slug,name,tagline,image_url,accent_color,dark_color,active,sort_order"
              )
              .eq(
                "slug",
                "shopping-zone-bd"
              )
              .eq(
                "active",
                true
              )
              .maybeSingle(),

            supabase
              .from("products")
              .select(
                "id,name,brand,category,price,old_price,image_url,stock,featured"
              )
              .ilike(
                "brand",
                "SHOPPING ZONE BD"
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

        if (
          !brandResult.error &&
          brandResult.data
        ) {
          setBrand(
            brandResult.data
          );
        }

        if (
          !productsResult.error &&
          productsResult.data &&
          productsResult.data.length >
            0
        ) {
          setProducts(
            productsResult.data.map(
              normalizeProduct
            )
          );
        } else {
          setProducts(
            fallbackProducts
          );
        }
      };

    loadBrandAndProducts();

    const brandChannel =
      supabase
        .channel(
          "shopping-zone-brand-page"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "brands",
            filter:
              "slug=eq.shopping-zone-bd",
          },
          () => {
            loadBrandAndProducts();
          }
        )
        .subscribe();

    const productsChannel =
      supabase
        .channel(
          "shopping-zone-products-page"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "products",
          },
          () => {
            loadBrandAndProducts();
          }
        )
        .subscribe();

    return () => {
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
          setCartNotice(null);
        },
        3500
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [cartNotice]);

  /* =======================================================
     FILTER
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
        (product) =>
          product.category?.toUpperCase() ===
          activeCategory
      );
    }, [
      products,
      activeCategory,
    ]);

  /* =======================================================
     COUNTS
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

  const wishlistCount =
    wishlistIds.length;

  /* =======================================================
     WISHLIST
  ======================================================= */

  const toggleWishlist =
    (
      productId: string
    ) => {
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
    };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const addToCart =
    (
      product: Product
    ) => {
      if (
        product.stock <= 0
      ) {
        return;
      }

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
            existing.quantity +
              1,
            Math.max(
              product.stock,
              1
            )
          );

        next =
          cartItems.map(
            (
              item
            ) =>
              item.productId ===
              product.id
                ? serializeCartItem(
                    product,
                    nextQuantity
                  )
                : item
          );
      } else {
        next = [
          ...cartItems,
          serializeCartItem(
            product,
            1
          ),
        ];
      }

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

      setCartNotice(
        product
      );
    };

  /* =======================================================
     THEME
  ======================================================= */

  const heroImage =
    brand.image_url ||
    fallbackBrand.image_url ||
    "";

  const darkColor =
    brand.dark_color ||
    "#8E101D";

  const accentColor =
    brand.accent_color ||
    "#F4D9DC";

  /* =======================================================
     RETURN
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
              x: -18,
            }}
            animate={{
              opacity: 1,
              x: 0,
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
                  24,
                letterSpacing:
                  "-0.07em",
              }}
            >
              A-POSITIVE
            </Link>
          </motion.div>

          <nav
            className="sz-nav"
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 26,
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

            <Link href="/brands/blue-dream">
              BLUE DREAM
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
              className="round-nav-button"
              aria-label="Wishlist"
            >
              <Heart
                size={17}
              />

              {wishlistCount >
                0 && (
                <span
                  className="wishlist-count"
                  style={{
                    background:
                      darkColor,
                  }}
                >
                  {
                    wishlistCount
                  }
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="round-nav-button"
              aria-label="Cart"
            >
              <ShoppingBag
                size={17}
              />

              {cartCount >
                0 && (
                <span
                  className="cart-count"
                  style={{
                    background:
                      darkColor,
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

      {/* =================================================
          HERO
      ================================================= */}

      <section
        style={{
          maxWidth:
            1440,
          margin:
            "0 auto",
          padding:
            "18px 24px 0",
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale:
              0.985,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration:
              0.85,
          }}
          style={{
            position:
              "relative",
            minHeight:
              680,
            overflow:
              "hidden",
            background:
              darkColor,
          }}
        >
          <motion.img
            src={heroImage}
            alt={brand.name}
            initial={{
              scale:
                1.08,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              duration:
                1.35,
              ease:
                [0.22, 1, 0.36, 1],
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
                0.74,
            }}
          />

          <div
            style={{
              position:
                "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(142,16,29,.88) 0%, rgba(142,16,29,.43) 48%, rgba(142,16,29,.08) 100%)",
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
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration:
                  0.6,
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
                  0.74,
                marginBottom:
                  18,
              }}
            >
              SHOPPING ZONE BD
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
                  950,
                margin: 0,
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
                fontStyle:
                  "italic",
                fontWeight:
                  400,
                fontSize:
                  "clamp(50px,8vw,110px)",
                lineHeight:
                  0.87,
                letterSpacing:
                  "-0.055em",
              }}
            >
              {brand.name}
            </motion.h1>

            <motion.div
              initial={{
                opacity: 0,
                y: 14,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration:
                  0.65,
                delay:
                  0.34,
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
                  0.88,
              }}
            >
              {brand.tagline ||
                "STYLE WITHOUT LIMITS."}
            </motion.div>

            <motion.p
              initial={{
                opacity: 0,
                y: 14,
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
                  570,
                marginTop:
                  22,
                fontSize:
                  14,
                lineHeight:
                  1.88,
                opacity:
                  0.75,
              }}
            >
              Contemporary fashion,
              bags and accessories
              made for your world.
              Discover expressive
              pieces that bring
              personality into your
              everyday style.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 14,
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
                EXPLORE COLLECTION
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
            "95px 24px 72px",
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
            width: 46,
            height: 1,
            background:
              darkColor,
            margin:
              "0 auto 23px",
          }}
        />

        <div
          className="micro-heading"
        >
          THE SHOPPING ZONE WORLD
        </div>

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
          }}
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
          Style without
          <br />
          limits.
        </motion.h2>

        <p
          style={{
            maxWidth:
              680,
            margin:
              "26px auto 0",
            fontSize:
              14,
            lineHeight:
              1.9,
            opacity:
              0.58,
          }}
        >
          From statement dresses to
          everyday bags and accessories,
          Shopping Zone BD brings
          together modern pieces for
          different moods, occasions
          and personalities.
        </p>
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
              category
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
              className="micro-heading"
              style={{
                marginBottom:
                  10,
              }}
            >
              SHOPPING ZONE BD
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
        </div>

        <AnimatePresence
          mode="popLayout"
        >
          {visibleProducts.length >
          0 ? (
            <motion.div
              className="shopping-zone-product-grid"
              layout
            >
              {visibleProducts.map(
                (
                  product,
                  index
                ) => {
                  const liked =
                    wishlistIds.includes(
                      product.id
                    );

                  return (
                    <motion.article
                      key={
                        product.id
                      }
                      layout
                      initial={{
                        opacity: 0,
                        y: 28,
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
                          0.5,
                        delay:
                          index *
                          0.04,
                      }}
                    >
                      <div className="sz-product-media">
                        <Link
                          href={`/products/${product.id}`}
                          className="sz-product-image"
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

                        <button
                          type="button"
                          onClick={() =>
                            toggleWishlist(
                              product.id
                            )
                          }
                          className={`sz-wishlist ${
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

                        {product.stock <=
                          3 &&
                          product.stock >
                            0 && (
                            <span className="sz-stock-badge">
                              LOW STOCK
                            </span>
                          )}

                        {product.stock <=
                          0 && (
                          <span className="sz-sold-badge">
                            SOLD OUT
                          </span>
                        )}

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
                          className="sz-quick-add"
                          style={{
                            background:
                              product.stock >
                              0
                                ? darkColor
                                : "rgba(142,16,29,.45)",
                          }}
                        >
                          {product.stock >
                          0
                            ? "ADD TO BAG"
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

                      <div className="sz-product-info">
                        <div className="sz-product-top">
                          <div>
                            <div className="sz-category-label">
                              {
                                product.category
                              }
                            </div>

                            <Link
                              href={`/products/${product.id}`}
                              className="sz-product-name"
                            >
                              {
                                product.name
                              }
                            </Link>
                          </div>

                          <div className="sz-price-box">
                            <strong>
                              {money(
                                product.price
                              )}
                            </strong>

                            {product.old_price &&
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
                No products in
                this category.
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
          STORY
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
          className="shopping-zone-story"
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
          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration:
                0.8,
            }}
          >
            <div
              className="story-label"
            >
              SHOPPING ZONE BD
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
                  "clamp(44px,6vw,80px)",
                lineHeight:
                  0.94,
                letterSpacing:
                  "-0.045em",
              }}
            >
              Style.
              <br />
              Your way.
            </h2>

            <p
              style={{
                maxWidth:
                  500,
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
              Shopping Zone BD is for
              fashion that does not need
              to fit into one category.
              Dresses, bags and
              accessories come together
              for a more expressive
              wardrobe.
            </p>

            <Link
              href="/#product-explorer"
              className="story-link"
            >
              SHOP THE COLLECTION
              <ArrowRight
                size={14}
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 30,
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
            "100px 24px 110px",
          textAlign:
            "center",
        }}
      >
        <div className="micro-heading">
          SHOPPING ZONE BD
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
          Style without
          limits.
        </h2>

        <Link
          href="/#product-explorer"
          className="final-button"
          style={{
            background:
              darkColor,
          }}
        >
          SHOP SHOPPING ZONE BD
          <ArrowRight
            size={14}
          />
        </Link>
      </section>

      {/* =================================================
          CART SUCCESS NOTICE
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
            className="sz-cart-notice"
          >
            <div className="sz-cart-notice-main">
              <div
                className="sz-cart-check"
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
                  ADDED TO BAG
                </strong>

                <span>
                  {
                    cartNotice.name
                  }
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

            <div className="sz-cart-actions">
              <Link
                href="/cart"
                onClick={() =>
                  setCartNotice(
                    null
                  )
                }
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
                  background:
                    darkColor,
                  color:
                    "#fff",
                }}
              >
                CHECKOUT
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          STYLES
      ================================================= */}

      <style jsx global>{`
        .sz-nav a {
          color: #11100e;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.15em;
          opacity: 0.62;
          transition: opacity 0.2s ease;
        }

        .sz-nav a:hover {
          opacity: 1;
        }

        .round-nav-button {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(17,16,14,0.09);
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
          background: rgba(17,16,14,0.04);
        }

        .wishlist-count,
        .cart-count {
          position: absolute;
          top: -4px;
          right: -3px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 8px;
        }

        .hero-light-button,
        .hero-outline-button,
        .story-link,
        .final-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.17em;
          transition:
            transform 0.25s ease,
            opacity 0.25s ease;
        }

        .hero-light-button {
          padding: 15px 22px;
          background: #fff;
          color: #8e101d;
        }

        .hero-light-button:hover,
        .hero-outline-button:hover,
        .final-button:hover {
          transform: translateY(-3px);
        }

        .hero-outline-button {
          padding: 15px 22px;
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .micro-heading,
        .collection-count,
        .story-label {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .micro-heading,
        .collection-count {
          opacity: 0.45;
        }

        .story-label {
          opacity: 0.48;
        }

        .shopping-zone-product-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0,1fr)
          );
          gap: 20px;
        }

        .sz-product-media {
          position: relative;
          overflow: hidden;
          background: #f1e8e9;
        }

        .sz-product-image {
          display: block;
          aspect-ratio: 0.8;
          overflow: hidden;
        }

        .sz-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .sz-wishlist {
          position: absolute;
          top: 11px;
          right: 11px;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.96);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .sz-wishlist:hover {
          transform: scale(1.08);
          box-shadow:
            0 10px 30px rgba(0,0,0,0.08);
        }

        .sz-stock-badge,
        .sz-sold-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 7px 9px;
          font-size: 8px;
          letter-spacing: 0.14em;
        }

        .sz-stock-badge {
          background: #fff;
          color: #11100e;
        }

        .sz-sold-badge {
          background: #8e101d;
          color: #fff;
        }

        .sz-quick-add {
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
          transition: filter 0.2s ease;
        }

        .sz-quick-add:hover {
          filter: brightness(1.08);
        }

        .sz-product-info {
          padding-top: 15px;
        }

        .sz-product-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: flex-start;
        }

        .sz-category-label {
          margin-bottom: 7px;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.42;
        }

        .sz-product-name {
          color: #11100e;
          text-decoration: none;
          font-size: 14px;
          line-height: 1.45;
        }

        .sz-product-name:hover {
          opacity: 0.58;
        }

        .sz-price-box {
          text-align: right;
          white-space: nowrap;
        }

        .sz-price-box strong {
          display: block;
          font-size: 14px;
          font-weight: 600;
        }

        .sz-price-box del {
          display: block;
          margin-top: 3px;
          font-size: 10px;
          opacity: 0.42;
        }

        .story-link {
          margin-top: 25px;
          color: #fff;
          opacity: 0.85;
        }

        .story-link:hover {
          opacity: 1;
          transform: translateX(4px);
        }

        .final-button {
          margin-top: 30px;
          padding: 15px 22px;
          color: #fff;
        }

        .sz-cart-notice {
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
          border: 1px solid rgba(17,16,14,0.08);
          box-shadow:
            0 24px 70px rgba(0,0,0,0.16);
        }

        .sz-cart-notice-main {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .sz-cart-check {
          width: 40px;
          height: 40px;
          min-width: 40px;
          display: grid;
          place-items: center;
          color: #fff;
        }

        .sz-cart-notice-main > div:nth-child(2) {
          flex: 1;
          min-width: 0;
        }

        .sz-cart-notice-main strong {
          display: block;
          font-size: 11px;
          letter-spacing: 0.13em;
        }

        .sz-cart-notice-main span {
          display: block;
          margin-top: 5px;
          font-size: 13px;
          line-height: 1.45;
          opacity: 0.55;
        }

        .sz-cart-notice-main button {
          border: 0;
          padding: 3px;
          background: transparent;
          cursor: pointer;
          opacity: 0.55;
        }

        .sz-cart-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 15px;
        }

        .sz-cart-actions a {
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
          .shopping-zone-product-grid {
            grid-template-columns: repeat(
              3,
              minmax(0,1fr)
            );
          }
        }

        @media (max-width: 900px) {
          .sz-nav {
            display: none !important;
          }

          .shopping-zone-product-grid {
            grid-template-columns: repeat(
              2,
              minmax(0,1fr)
            );
          }

          .shopping-zone-story {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 620px) {
          .shopping-zone-product-grid {
            gap: 13px;
          }

          .sz-product-top {
            flex-direction: column;
            gap: 9px;
          }

          .sz-price-box {
            text-align: left;
          }

          .sz-cart-notice {
            top: 72px;
            right: 15px;
            width: calc(100vw - 30px);
          }
        }

        @media (max-width: 430px) {
          .shopping-zone-product-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}