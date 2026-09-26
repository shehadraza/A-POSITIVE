"use client";

import Link from "next/link";

import {
  ChangeEvent,
  CSSProperties,
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
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Upload,
  UserRound,
  WandSparkles,
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
  shortName: string;
  subtitle: string;
  description: string;
  accent: string;
  dark: string;
  image: string;
  active?: boolean;
  sortOrder?: number;
};

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  createdAt: string;
  sales: number;
  views: number;
  cartAdds: number;
  wishlistCount: number;
  stock: number;
  featured?: boolean;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type HeroSlide = {
  id: string;
  brand_slug: string | null;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  mobile_image_url: string | null;
  button_text: string | null;
  button_href: string | null;
  sort_order?: number;
};

type Announcement = {
  id: string;
  text: string;
  link_text: string | null;
  link_href: string | null;
  sort_order?: number;
};

const supabase = createClient();

/* =========================================================
   EXTERNAL LINKS
   Replace "/" with your real links later.
========================================================= */

const SHEHAD_RAZA_URL = "https://www.facebook.com/shihadraja121?mibextid=ZbWKwL";
const NEXORA_TECH_URL = "https://www.facebook.com/share/1GQpFkh8fQ/";

/* =========================================================
   BRAND ROUTES
========================================================= */

const brandRoutes: Record<string, string> = {
  "blue-dream": "/brands/blue-dream",
  "shopping-zone-bd":
    "/brands/shopping-zone-bd",
  "a-positive": "/brands/a-positive",
};

/* =========================================================
   FALLBACK BRANDS
========================================================= */

const fallbackBrands: Brand[] = [
  {
    id: "blue-dream",
    slug: "blue-dream",
    name: "BLUE DREAM",
    shortName: "BD",
    subtitle: "EVERYDAY. ELEVATED.",
    description:
      "Modern essentials designed for effortless everyday confidence.",
    accent: "#d9e6f5",
    dark: "#071a38",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=90",
    sortOrder: 1,
  },

  {
    id: "shopping-zone-bd",
    slug: "shopping-zone-bd",
    name: "SHOPPING ZONE BD",
    shortName: "SZ",
    subtitle: "STYLE WITHOUT LIMITS.",
    description:
      "Contemporary fashion, bags and accessories made for your world.",
    accent: "#f4d9dc",
    dark: "#8e101d",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=90",
    sortOrder: 2,
  },

  {
    id: "a-positive",
    slug: "a-positive",
    name: "A-POSITIVE",
    shortName: "A+",
    subtitle: "OWN YOUR PRESENCE.",
    description:
      "A premium fashion house built around confidence, character and detail.",
    accent: "#e9e1ce",
    dark: "#11100e",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=90",
    sortOrder: 3,
  },
];

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  {
    name: "SHIRTS",
    count: "24 ITEMS",
    filter: "SHIRT",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=90",
  },
  {
    name: "POLOS",
    count: "18 ITEMS",
    filter: "POLO",
    image:
      "https://images.unsplash.com/photo-1625910513413-5fc45e9d98b8?auto=format&fit=crop&w=900&q=90",
  },
  {
    name: "T-SHIRTS",
    count: "31 ITEMS",
    filter: "T-SHIRT",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=90",
  },
  {
    name: "PANTS",
    count: "16 ITEMS",
    filter: "PANT",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=90",
  },
  {
    name: "DRESSES",
    count: "28 ITEMS",
    filter: "DRESS",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=90",
  },
  {
    name: "BAGS",
    count: "22 ITEMS",
    filter: "BAG",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=90",
  },
];

/* =========================================================
   FALLBACK PRODUCTS
========================================================= */

const fallbackProducts: Product[] = [
  {
    id: "bd-oxford-001",
    name: "Essential Oxford Shirt",
    brand: "BLUE DREAM",
    price: 1490,
    oldPrice: 1890,
    category: "SHIRT",
    image:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1000&q=90",
    createdAt: "2026-09-05",
    sales: 86,
    views: 1450,
    cartAdds: 240,
    wishlistCount: 120,
    stock: 25,
    featured: true,
  },

  {
    id: "bd-tee-002",
    name: "Signature Oversized Tee",
    brand: "BLUE DREAM",
    price: 990,
    oldPrice: 1290,
    category: "T-SHIRT",
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=90",
    createdAt: "2026-09-04",
    sales: 142,
    views: 2800,
    cartAdds: 410,
    wishlistCount: 190,
    stock: 18,
    featured: true,
  },

  {
    id: "sz-bag-003",
    name: "Structured Leather Bag",
    brand: "SHOPPING ZONE BD",
    price: 1850,
    oldPrice: 2300,
    category: "BAG",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=90",
    createdAt: "2026-09-03",
    sales: 198,
    views: 3900,
    cartAdds: 530,
    wishlistCount: 260,
    stock: 12,
    featured: true,
  },

  {
    id: "ap-trouser-004",
    name: "Premium Tailored Trouser",
    brand: "A-POSITIVE",
    price: 2190,
    oldPrice: 2690,
    category: "PANT",
    image:
      "https://images.unsplash.com/photo-1506629905607-d9c297d5c7f2?auto=format&fit=crop&w=1000&q=90",
    createdAt: "2026-09-02",
    sales: 165,
    views: 3200,
    cartAdds: 460,
    wishlistCount: 215,
    stock: 20,
    featured: true,
  },

  {
    id: "ap-shirt-005",
    name: "A-Positive Signature Shirt",
    brand: "A-POSITIVE",
    price: 1790,
    oldPrice: 2190,
    category: "SHIRT",
    image:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1000&q=90",
    createdAt: "2026-09-01",
    sales: 112,
    views: 2100,
    cartAdds: 310,
    wishlistCount: 170,
    stock: 30,
  },

  {
    id: "sz-dress-006",
    name: "Modern Evening Dress",
    brand: "SHOPPING ZONE BD",
    price: 2490,
    oldPrice: 3100,
    category: "DRESS",
    image:
      "https://images.unsplash.com/photo-1566479179817-c0d3c8c5f2e7?auto=format&fit=crop&w=1000&q=90",
    createdAt: "2026-08-31",
    sales: 74,
    views: 1850,
    cartAdds: 270,
    wishlistCount: 155,
    stock: 15,
  },

  {
    id: "bd-polo-007",
    name: "Premium Essential Polo",
    brand: "BLUE DREAM",
    price: 1190,
    oldPrice: 1490,
    category: "POLO",
    image:
      "https://images.unsplash.com/photo-1625910513413-5fc45e9d98b8?auto=format&fit=crop&w=1000&q=90",
    createdAt: "2026-08-30",
    sales: 224,
    views: 4200,
    cartAdds: 620,
    wishlistCount: 310,
    stock: 40,
    featured: true,
  },

  {
    id: "sz-bag-008",
    name: "Everyday Signature Bag",
    brand: "SHOPPING ZONE BD",
    price: 1590,
    oldPrice: 1990,
    category: "BAG",
    image:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1000&q=90",
    createdAt: "2026-08-29",
    sales: 188,
    views: 3500,
    cartAdds: 480,
    wishlistCount: 240,
    stock: 21,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(price: number) {
  return `৳${Number(price || 0).toLocaleString(
    "en-BD"
  )}`;
}

function brandSlugFromName(name: string) {
  const value = name.trim().toLowerCase();

  if (value === "blue dream") {
    return "blue-dream";
  }

  if (value === "shopping zone bd") {
    return "shopping-zone-bd";
  }

  if (value === "a-positive") {
    return "a-positive";
  }

  return value
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeProduct(
  product: any,
  fallback?: Product
): Product {
  const fallbackDate =
    fallback?.createdAt ??
    new Date().toISOString().slice(0, 10);

  return {
    id: String(product.id),

    name:
      product.name ??
      fallback?.name ??
      "Untitled Product",

    brand:
      product.brand ??
      fallback?.brand ??
      "A-POSITIVE",

    price:
      Number(product.price) ||
      fallback?.price ||
      0,

    oldPrice:
      product.old_price === null ||
      product.old_price === undefined
        ? fallback?.oldPrice
        : Number(product.old_price),

    category: (
      product.category ??
      fallback?.category ??
      "FASHION"
    ).toUpperCase(),

    image:
      product.image_url ??
      product.image ??
      fallback?.image ??
      fallbackProducts[0].image,

    createdAt:
      product.created_at?.slice(0, 10) ??
      fallbackDate,

    sales:
      Number(product.sales) ||
      fallback?.sales ||
      0,

    views:
      Number(product.views) ||
      fallback?.views ||
      0,

    cartAdds:
      Number(product.cart_adds) ||
      fallback?.cartAdds ||
      0,

    wishlistCount:
      Number(product.wishlist_count) ||
      fallback?.wishlistCount ||
      0,

    stock:
      Number(product.stock) || 0,

    featured: Boolean(
      product.featured ?? fallback?.featured
    ),
  };
}

function normalizeBrand(item: any): Brand {
  const slug =
    item.slug ??
    brandSlugFromName(
      item.name ?? "A-POSITIVE"
    );

  const fallback =
    fallbackBrands.find(
      (brand) => brand.slug === slug
    ) ?? fallbackBrands[0];

  return {
    id: String(item.id),

    slug,

    name:
      item.name ??
      fallback.name,

    shortName:
      fallback.shortName,

    subtitle:
      item.tagline ??
      fallback.subtitle,

    description:
      fallback.description,

    accent:
      item.accent_color ??
      fallback.accent,

    dark:
      item.dark_color ??
      fallback.dark,

    image:
      item.image_url ??
      fallback.image,

    active:
      item.active !== false,

    sortOrder:
      Number(
        item.sort_order ??
          fallback.sortOrder ??
          0
      ),
  };
}

/* =========================================================
   STORED CART HELPERS
========================================================= */

function getStoredCartProduct(
  item: any,
  products: Product[]
): Product | null {
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

  const currentProduct =
    products.find(
      (product) =>
        String(product.id) === productId
    );

  if (currentProduct) {
    return currentProduct;
  }

  const fallbackProduct =
    nestedProduct ?? item;

  if (
    !fallbackProduct ||
    !fallbackProduct.name
  ) {
    return null;
  }

  return {
    id: productId,

    name:
      fallbackProduct.name ??
      "Untitled Product",

    brand:
      fallbackProduct.brand ??
      "A-POSITIVE",

    price:
      Number(fallbackProduct.price) || 0,

    oldPrice:
      fallbackProduct.oldPrice !== undefined
        ? Number(
            fallbackProduct.oldPrice
          )
        : fallbackProduct.old_price !==
              undefined &&
          fallbackProduct.old_price !==
              null
        ? Number(
            fallbackProduct.old_price
          )
        : undefined,

    category: String(
      fallbackProduct.category ??
        "FASHION"
    ).toUpperCase(),

    image:
      fallbackProduct.image ??
      fallbackProduct.image_url ??
      fallbackProducts[0].image,

    createdAt:
      fallbackProduct.createdAt ??
      fallbackProduct.created_at?.slice(
        0,
        10
      ) ??
      new Date()
        .toISOString()
        .slice(0, 10),

    sales:
      Number(fallbackProduct.sales) || 0,

    views:
      Number(fallbackProduct.views) || 0,

    cartAdds:
      Number(fallbackProduct.cartAdds) ||
      Number(fallbackProduct.cart_adds) ||
      0,

    wishlistCount:
      Number(
        fallbackProduct.wishlistCount
      ) ||
      Number(
        fallbackProduct.wishlist_count
      ) ||
      0,

    stock:
      Number(fallbackProduct.stock) ||
      0,

    featured: Boolean(
      fallbackProduct.featured
    ),
  };
}

function serializeCart(
  cart: CartItem[]
) {
  return cart.map((item) => ({
    id: item.product.id,
    productId: item.product.id,
    name: item.product.name,
    brand: item.product.brand,
    price: String(item.product.price),
    image: item.product.image,
    category: item.product.category,
    stock: Number(item.product.stock) || 0,
    quantity: Number(item.quantity) || 1,
    product: item.product,
  }));
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  liked,
  toggleLike,
  onTryOn,
  onQuickAdd,
}: {
  product: Product;
  liked: boolean;
  toggleLike: () => void;
  onTryOn: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}) {
  return (
    <motion.article
      className="product-card"
      initial={{
        opacity: 0,
        y: 35,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.65,
      }}
    >
      <div className="product-image-wrap">
        <Link
          href={`/products/${product.id}`}
          className="product-image-link"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        </Link>

        <button
          className={`wishlist-button ${
            liked ? "liked" : ""
          }`}
          onClick={toggleLike}
          aria-label="Wishlist"
          type="button"
        >
          <Heart
            size={17}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <div className="product-badge">
          {product.stock < 15
            ? "LIMITED"
            : product.featured
            ? "FEATURED"
            : "NEW"}
        </div>

        <div className="product-hover-actions">
          <button
            onClick={() =>
              onTryOn(product)
            }
            className="try-card-button"
            type="button"
            disabled={product.stock <= 0}
          >
            <WandSparkles size={15} />
            TRY IT ON
          </button>

          <button
            className="quick-add"
            onClick={() =>
              onQuickAdd(product)
            }
            type="button"
            disabled={product.stock <= 0}
          >
            {product.stock <= 0
              ? "OUT OF STOCK"
              : "QUICK ADD"}

            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-brand-line">
          <span>
            {product.brand}
          </span>

          <span>
            {product.category}
          </span>
        </div>

        <h3>
          <Link
            href={`/products/${product.id}`}
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {product.name}
          </Link>
        </h3>

        <div className="price-line">
          <strong>
            {formatPrice(
              product.price
            )}
          </strong>

          {product.oldPrice &&
            product.oldPrice >
              product.price && (
              <del>
                {formatPrice(
                  product.oldPrice
                )}
              </del>
            )}
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const [
    activeBrand,
    setActiveBrand,
  ] = useState(0);

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    liked,
    setLiked,
  ] = useState<string[]>([]);

  const [
    cart,
    setCart,
  ] = useState<CartItem[]>([]);

  const [
    cartReady,
    setCartReady,
  ] = useState(false);

  const [
    cartNotice,
    setCartNotice,
  ] = useState<Product | null>(null);

  const [
    direction,
    setDirection,
  ] = useState(1);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("ALL");

  /* =====================================================
     CMS
  ====================================================== */

  const [
    liveBrands,
    setLiveBrands,
  ] = useState<Brand[]>([]);

  const [
    liveProducts,
    setLiveProducts,
  ] = useState<Product[]>([]);

  const [
    heroSlides,
    setHeroSlides,
  ] = useState<HeroSlide[]>([]);

  const [
    announcements,
    setAnnouncements,
  ] = useState<Announcement[]>([]);

  /* =====================================================
     TRY ON
  ====================================================== */

  const [
    tryOnOpen,
    setTryOnOpen,
  ] = useState(false);

  const [
    tryOnProduct,
    setTryOnProduct,
  ] =
    useState<Product | null>(null);

  const [
    userPhoto,
    setUserPhoto,
  ] = useState<string | null>(
    null
  );

  const [
    userPhotoFile,
    setUserPhotoFile,
  ] = useState<File | null>(
    null
  );

  const [
    tryOnResult,
    setTryOnResult,
  ] = useState<string | null>(
    null
  );

  const [
    tryOnError,
    setTryOnError,
  ] = useState("");

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const [
    tryOnDone,
    setTryOnDone,
  ] = useState(false);

  /* =====================================================
     AI
  ====================================================== */

  const [
    aiOpen,
    setAiOpen,
  ] = useState(false);

  const [
    aiMessage,
    setAiMessage,
  ] = useState("");

  const [
    aiAnswer,
    setAiAnswer,
  ] = useState(
    "Hi! Tell me your budget, preferred style, brand or occasion and I’ll help you find the right look."
  );

  /* =====================================================
     BRANDS
  ====================================================== */

  const brands = useMemo(() => {
    const liveMap =
      new Map(
        liveBrands.map(
          (brand) => [
            brand.slug,
            brand,
          ]
        )
      );

    return fallbackBrands
      .map((fallback) => {
        const live =
          liveMap.get(
            fallback.slug
          );

        return {
          ...fallback,

          id:
            live?.id ??
            fallback.id,

          slug:
            fallback.slug,

          name:
            live?.name ??
            fallback.name,

          shortName:
            live?.shortName ??
            fallback.shortName,

          subtitle:
            live?.subtitle ??
            fallback.subtitle,

          description:
            live?.description ??
            fallback.description,

          accent:
            live?.accent ??
            fallback.accent,

          dark:
            live?.dark ??
            fallback.dark,

          image:
            live?.image ??
            fallback.image,

          active: true,

          sortOrder:
            live?.sortOrder ??
            fallback.sortOrder,
        };
      })
      .sort(
        (a, b) =>
          (a.sortOrder ?? 0) -
          (b.sortOrder ?? 0)
      );
  }, [liveBrands]);

  /* =====================================================
     PRODUCTS
  ====================================================== */

  const products =
    liveProducts.length > 0
      ? liveProducts
      : fallbackProducts;

  const brand =
    brands[
      activeBrand %
        Math.max(
          brands.length,
          1
        )
    ] ??
    fallbackBrands[0];

  /* =====================================================
     HERO
  ====================================================== */

  const activeHeroSlide =
    [...heroSlides]
      .filter(
        (slide) =>
          slide.brand_slug ===
          brand.slug
      )
      .sort(
        (a, b) =>
          (a.sort_order ?? 0) -
          (b.sort_order ?? 0)
      )[0] ??
    [...heroSlides]
      .filter(
        (slide) =>
          !slide.brand_slug
      )
      .sort(
        (a, b) =>
          (a.sort_order ?? 0) -
          (b.sort_order ?? 0)
      )[0] ??
    null;

  const heroProduct =
    products.find(
      (product) =>
        brandSlugFromName(
          product.brand
        ) === brand.slug
    ) ??
    products[
      activeBrand %
        Math.max(
          products.length,
          1
        )
    ] ??
    fallbackProducts[0];

  const heroTitle =
    activeHeroSlide?.title ||
    brand.name;

  const heroSubtitle =
    activeHeroSlide?.subtitle ||
    brand.subtitle;

  const heroButtonText =
    activeHeroSlide?.button_text ||
    "SHOP THE LOOK";

  const heroButtonHref =
    activeHeroSlide?.button_href ||
    brandRoutes[brand.slug] ||
    "#product-explorer";

  const heroDesktopImage =
    activeHeroSlide?.image_url ||
    brand.image ||
    heroProduct.image;

  const heroMobileImage =
    activeHeroSlide?.mobile_image_url ||
    activeHeroSlide?.image_url ||
    brand.image ||
    heroProduct.image;

  /* =====================================================
     LOCAL STORAGE - WISHLIST
  ====================================================== */

  useEffect(() => {
    const savedWishlist =
      localStorage.getItem(
        "a_positive_wishlist"
      );

    if (!savedWishlist) {
      return;
    }

    try {
      const parsed =
        JSON.parse(savedWishlist);

      if (Array.isArray(parsed)) {
        setLiked(
          parsed.map((id) =>
            String(id)
          )
        );
      }
    } catch {
      // ignore invalid wishlist
    }
  }, []);

  /* =====================================================
     RESTORE CART
  ====================================================== */

  useEffect(() => {
    let cancelled = false;

    const restoreCart = () => {
      const savedCart =
        localStorage.getItem(
          "a_positive_cart"
        );

      if (!savedCart) {
        if (!cancelled) {
          setCart([]);
          setCartReady(true);
        }

        return;
      }

      try {
        const parsed =
          JSON.parse(savedCart);

        if (!Array.isArray(parsed)) {
          if (!cancelled) {
            setCart([]);
            setCartReady(true);
          }

          return;
        }

        const restored =
          parsed
            .map((item: any) => {
              const product =
                getStoredCartProduct(
                  item,
                  products
                );

              if (!product) {
                return null;
              }

              const requestedQuantity =
                Math.max(
                  1,
                  Number(
                    item?.quantity ?? 1
                  )
                );

              const safeQuantity =
                product.stock > 0
                  ? Math.min(
                      requestedQuantity,
                      product.stock
                    )
                  : requestedQuantity;

              return {
                product,
                quantity:
                  safeQuantity,
              };
            })
            .filter(Boolean) as CartItem[];

        if (!cancelled) {
          setCart(restored);
          setCartReady(true);
        }
      } catch {
        if (!cancelled) {
          setCart([]);
          setCartReady(true);
        }
      }
    };

    restoreCart();

    return () => {
      cancelled = true;
    };
  }, [products]);

  /* =====================================================
     SAVE WISHLIST
  ====================================================== */

  useEffect(() => {
    localStorage.setItem(
      "a_positive_wishlist",
      JSON.stringify(liked)
    );

    window.dispatchEvent(
      new Event(
        "a_positive_wishlist_updated"
      )
    );
  }, [liked]);

  /* =====================================================
     SAVE CART
  ====================================================== */

  useEffect(() => {
    if (!cartReady) {
      return;
    }

    const storedCart =
      serializeCart(cart);

    localStorage.setItem(
      "a_positive_cart",
      JSON.stringify(
        storedCart
      )
    );

    window.dispatchEvent(
      new Event(
        "a_positive_cart_updated"
      )
    );
  }, [
    cart,
    cartReady,
  ]);

  /* =====================================================
     CART NOTICE AUTO CLOSE
  ====================================================== */

  useEffect(() => {
    if (!cartNotice) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setCartNotice(null);
      }, 3200);

    return () =>
      window.clearTimeout(timer);
  }, [cartNotice]);

  /* =====================================================
     LOAD PRODUCTS
  ====================================================== */

  useEffect(() => {
    const loadProducts =
      async () => {
        const {
          data,
          error,
        } =
          await supabase
            .from("products")
            .select(
              "id,name,brand,category,price,old_price,image_url,stock,featured,created_at,sales,views,cart_adds,wishlist_count"
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
          error ||
          !data
        ) {
          console.error(
            "Products load error:",
            error
          );

          return;
        }

        const normalized =
          data.map(
            (item: any) => {
              const fallback =
                fallbackProducts.find(
                  (product) =>
                    product.name
                      .toLowerCase() ===
                    String(
                      item.name ?? ""
                    ).toLowerCase()
                );

              return normalizeProduct(
                item,
                fallback
              );
            }
          );

        setLiveProducts(
          normalized
        );
      };

    loadProducts();

    const channel =
      supabase
        .channel(
          "homepage-products-original"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "products",
          },
          () => {
            loadProducts();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, []);

  /* =====================================================
     LOAD CMS
  ====================================================== */

  useEffect(() => {
  let mounted = true;

  const loadCms = async () => {
    try {
      const [
        brandsResult,
        heroResult,
        announcementResult,
      ] = await Promise.all([
        supabase
          .from("brands")
          .select(
            "id,slug,name,tagline,image_url,accent_color,dark_color,active,sort_order"
          )
          .order("sort_order", {
            ascending: true,
          }),

        supabase
          .from("hero_slides")
          .select(
            "id,brand_slug,title,subtitle,image_url,mobile_image_url,button_text,button_href,active,sort_order"
          )
          .order("sort_order", {
            ascending: true,
          }),

        supabase
          .from("announcement_bars")
          .select(
            "id,text,link_text,link_href,active,sort_order"
          )
          .order("sort_order", {
            ascending: true,
          }),
      ]);

      if (!mounted) {
        return;
      }

      /* ==========================
         BRANDS
      ========================== */

      if (
        !brandsResult.error &&
        brandsResult.data
      ) {
        const normalized =
          brandsResult.data
            .filter(
              (item) =>
                item.active !== false &&
                item.slug
            )
            .map(normalizeBrand);

        setLiveBrands(normalized);
      }

      /* ==========================
         HERO
      ========================== */

      if (
        !heroResult.error &&
        heroResult.data
      ) {
        setHeroSlides(
          heroResult.data
            .filter(
              (item) =>
                item.active !== false
            )
            .map(
              (item) => ({
                id: String(
                  item.id
                ),

                brand_slug:
                  item.brand_slug ??
                  null,

                title:
                  item.title ??
                  null,

                subtitle:
                  item.subtitle ??
                  null,

                image_url:
                  item.image_url ??
                  null,

                mobile_image_url:
                  item.mobile_image_url ??
                  null,

                button_text:
                  item.button_text ??
                  null,

                button_href:
                  item.button_href ??
                  null,

                sort_order:
                  Number(
                    item.sort_order ??
                      0
                  ),
              })
            )
            .sort(
              (a, b) =>
                (a.sort_order ??
                  0) -
                (b.sort_order ??
                  0)
            )
        );
      }

      /* ==========================
         ANNOUNCEMENTS
      ========================== */

      if (
        !announcementResult.error &&
        announcementResult.data
      ) {
        const announcements =
          announcementResult.data
            .filter(
              (item) =>
                item.active !== false
            )
            .map(
              (item) => ({
                id: String(
                  item.id
                ),

                text:
                  item.text ?? "",

                link_text:
                  item.link_text ??
                  null,

                link_href:
                  item.link_href ??
                  null,

                sort_order:
                  Number(
                    item.sort_order ??
                      0
                  ),
              })
            )
            .sort(
              (a, b) =>
                (a.sort_order ??
                  0) -
                (b.sort_order ??
                  0)
            );

        setAnnouncements(
          announcements
        );
      }
    } catch (error) {
      console.error(
        "CMS LOAD ERROR:",
        error
      );
    }
  };

  /* INITIAL LOAD */
  loadCms();

  /* ==========================
     BRANDS REALTIME
  ========================== */

  const brandsChannel =
    supabase
      .channel(
        "homepage-brands-live"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "brands",
        },
        () => {
          loadCms();
        }
      )
      .subscribe();

  /* ==========================
     HERO REALTIME
  ========================== */

  const heroChannel =
    supabase
      .channel(
        "homepage-hero-live"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hero_slides",
        },
        () => {
          loadCms();
        }
      )
      .subscribe();

  /* ==========================
     ANNOUNCEMENT REALTIME
  ========================== */

  const announcementChannel =
    supabase
      .channel(
        "homepage-announcements-live"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcement_bars",
        },
        () => {
          console.log(
            "ANNOUNCEMENT UPDATED"
          );

          loadCms();
        }
      )
      .subscribe();

  /* ==========================
     BACKUP REFRESH
  ========================== */

  const refreshTimer =
    window.setInterval(() => {
      loadCms();
    }, 5000);

  /* ==========================
     CLEANUP
  ========================== */

  return () => {
    mounted = false;

    window.clearInterval(
      refreshTimer
    );

    supabase.removeChannel(
      brandsChannel
    );

    supabase.removeChannel(
      heroChannel
    );

    supabase.removeChannel(
      announcementChannel
    );
  };
}, []);

  /* =====================================================
     BRAND AUTO ROTATION
  ====================================================== */

  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          setDirection(1);

          setActiveBrand(
            (current) =>
              (current + 1) %
              Math.max(
                brands.length,
                1
              )
          );
        },
        5500
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [brands.length]);

  /* =====================================================
     KEEP ACTIVE BRAND SAFE
  ====================================================== */

  useEffect(() => {
    if (
      activeBrand >=
      brands.length
    ) {
      setActiveBrand(0);
    }
  }, [
    activeBrand,
    brands.length,
  ]);

  /* =====================================================
     CART COUNT
  ====================================================== */

  const cartCount =
    useMemo(
      () =>
        cart.reduce(
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
      [cart]
    );

  /* =====================================================
     CART FINANCIAL SUMMARY
  ====================================================== */

  const cartSubtotal =
    useMemo(
      () =>
        cart.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.product.price
            ) *
              Number(
                item.quantity
              ),
          0
        ),
      [cart]
    );

  const deliveryCharge =
    cartSubtotal > 0
      ? 150
      : 0;

  const cartGrandTotal =
    cartSubtotal +
    deliveryCharge;

  const advancePayment =
    cartSubtotal > 0
      ? 150
      : 0;

  const codBalance =
    Math.max(
      cartGrandTotal -
        advancePayment,
      0
    );

  /* =====================================================
     NEW ARRIVALS
  ====================================================== */

  const newArrivals =
    useMemo(
      () =>
        [...products]
          .filter(
            (product) =>
              product.stock > 0
          )
          .sort(
            (a, b) =>
              b.createdAt.localeCompare(
                a.createdAt
              )
          )
          .slice(0, 4),
      [products]
    );

  /* =====================================================
     TRENDING
  ====================================================== */

  const trending =
    useMemo(
      () =>
        [...products]
          .sort(
            (a, b) => {
              const scoreA =
                a.sales * 5 +
                a.cartAdds * 2 +
                a.wishlistCount *
                  1.5 +
                a.views *
                  0.05;

              const scoreB =
                b.sales * 5 +
                b.cartAdds * 2 +
                b.wishlistCount *
                  1.5 +
                b.views *
                  0.05;

              return (
                scoreB -
                scoreA
              );
            }
          )
          .slice(0, 4),
      [products]
    );

  /* =====================================================
     BEST SELLERS
  ====================================================== */

  const bestSellers =
    useMemo(
      () =>
        [...products]
          .sort(
            (a, b) =>
              b.sales -
              a.sales
          )
          .slice(0, 4),
      [products]
    );

  /* =====================================================
     FILTERED PRODUCTS
  ====================================================== */

  const filteredProducts =
    useMemo(() => {
      let result = [
        ...products,
      ];

      if (
        activeCategory !==
        "ALL"
      ) {
        result =
          result.filter(
            (product) =>
              product.category ===
              activeCategory
          );
      }

      if (
        searchText.trim()
      ) {
        const search =
          searchText
            .toLowerCase()
            .trim();

        result =
          result.filter(
            (product) =>
              product.name
                .toLowerCase()
                .includes(
                  search
                ) ||
              product.brand
                .toLowerCase()
                .includes(
                  search
                ) ||
              product.category
                .toLowerCase()
                .includes(
                  search
                )
          );
      }

      return result;
    }, [
      activeCategory,
      searchText,
      products,
    ]);

  /* =====================================================
     BRAND CONTROLS
  ====================================================== */

  function previousBrand() {
    if (brands.length <= 1) {
      return;
    }

    setDirection(-1);

    setActiveBrand(
      (current) =>
        (current - 1 + brands.length) %
        brands.length
    );
  }

  function nextBrand() {
    if (brands.length <= 1) {
      return;
    }

    setDirection(1);

    setActiveBrand(
      (current) =>
        (current + 1) % brands.length
    );
  }

  /* =====================================================
     WISHLIST
  ====================================================== */

  function toggleLike(
    productId: string
  ) {
    setLiked(
      (current) =>
        current.includes(
          productId
        )
          ? current.filter(
              (id) =>
                id !==
                productId
            )
          : [
              ...current,
              productId,
            ]
    );
  }

  /* =====================================================
     CART
  ====================================================== */

  function addToCart(
    product: Product
  ) {
    if (
      product.stock <= 0
    ) {
      return;
    }

    setCart(
      (current) => {
        const existing =
          current.find(
            (item) =>
              item.product.id ===
              product.id
          );

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

          return current.map(
            (item) =>
              item.product.id ===
              product.id
                ? {
                    ...item,
                    product,
                    quantity:
                      nextQuantity,
                  }
                : item
          );
        }

        return [
          ...current,
          {
            product,
            quantity: 1,
          },
        ];
      }
    );

    setCartNotice(product);
  }

  /* =====================================================
     CATEGORY
  ====================================================== */

  function selectCategory(
    category: string
  ) {
    setActiveCategory(
      category
    );

    setTimeout(
      () => {
        document
          .getElementById(
            "product-explorer"
          )
          ?.scrollIntoView({
            behavior:
              "smooth",
            block:
              "start",
          });
      },
      50
    );
  }

  /* =====================================================
     TRY ON
  ====================================================== */

  function openTryOn(
    product: Product
  ) {
    setTryOnProduct(
      product
    );

    setTryOnOpen(true);
    setTryOnDone(false);
    setProcessing(false);
    setTryOnResult(null);
    setTryOnError("");
  }

  function closeTryOn() {
    setTryOnOpen(
      false
    );

    setProcessing(false);
    setTryOnDone(false);
    setTryOnResult(null);
    setTryOnError("");
  }

  function handlePhoto(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const url =
      URL.createObjectURL(
        file
      );

    setUserPhoto(url);
    setUserPhotoFile(file);

    setTryOnDone(false);
    setTryOnResult(null);
    setTryOnError("");
  }

  function removePhoto() {
    if (userPhoto) {
      URL.revokeObjectURL(
        userPhoto
      );
    }

    setUserPhoto(null);
    setUserPhotoFile(null);
    setTryOnResult(null);
    setTryOnDone(false);
    setTryOnError("");
  }

  async function startTryOn() {
    if (
      !userPhotoFile ||
      !tryOnProduct
    ) {
      return;
    }

    try {
      setProcessing(true);
      setTryOnDone(false);
      setTryOnResult(null);
      setTryOnError("");

      const formData =
        new FormData();

      formData.append(
        "model_image",
        userPhotoFile
      );

      formData.append(
        "product_image",
        tryOnProduct.image
      );

      const category =
        tryOnProduct.category;

      let prompt = "";

      if (
        category ===
          "SHIRT" ||
        category ===
          "POLO" ||
        category ===
          "T-SHIRT"
      ) {
        prompt =
          "Fit the selected top naturally on the person while preserving the person's face, body shape, pose and background.";
      } else if (
        category === "PANT"
      ) {
        prompt =
          "Fit the selected pants naturally on the person while preserving the person's face, body shape, pose and background.";
      } else if (
        category === "DRESS"
      ) {
        prompt =
          "Fit the selected dress naturally on the person while preserving the person's face, body shape, pose and background.";
      } else {
        prompt =
          "Place the selected fashion product naturally on the person while preserving identity, pose and overall appearance.";
      }

      formData.append(
        "prompt",
        prompt
      );

      const response =
        await fetch(
          "/api/virtual-try-on",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Virtual try-on failed."
        );
      }

      if (
        !data?.imageUrl
      ) {
        throw new Error(
          "No generated image was returned."
        );
      }

      setTryOnResult(
        data.imageUrl
      );

      setTryOnDone(true);
    } catch (error) {
      console.error(
        "TRY ON ERROR:",
        error
      );

      setTryOnError(
        error instanceof Error
          ? error.message
          : "Virtual try-on failed."
      );

      setTryOnDone(false);
    } finally {
      setProcessing(false);
    }
  }

  /* =====================================================
     AI ASSISTANT
  ====================================================== */

  async function askAI(
    customMessage?: string
  ) {
    const message =
      (
        customMessage ??
        aiMessage
      ).trim();

    if (!message) {
      setAiAnswer(
        "Tell me your budget, occasion, preferred style or brand."
      );

      return;
    }

    try {
      setAiAnswer(
        "Curating your look..."
      );

      const response =
        await fetch(
          "/api/ai-assistant",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              message,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data?.error ??
            "AI request failed."
        );
      }

      setAiAnswer(
        data?.answer ??
          "I could not generate a response."
      );

      setAiMessage("");
    } catch (error) {
      console.error(
        "AI ASSISTANT ERROR:",
        error
      );

      setAiAnswer(
        "Sorry, the AI assistant is temporarily unavailable."
      );
    }
  }

  /* =====================================================
     ANNOUNCEMENTS
  ====================================================== */

  const tickerItems =
    announcements.length > 0
      ? announcements
      : [
          {
            id: "fallback-1",
            text:
              "NEW SEASON / FREE DELIVERY ON SELECTED ORDERS",
            link_text: null,
            link_href: null,
            sort_order: 1,
          },

          {
            id: "fallback-2",
            text:
              "BLUE DREAM / SHOPPING ZONE BD / A-POSITIVE",
            link_text: null,
            link_href: null,
            sort_order: 2,
          },

          {
            id: "fallback-3",
            text:
              "PREMIUM FASHION / LIMITED DROPS",
            link_text: null,
            link_href: null,
            sort_order: 3,
          },
        ];

  /* =====================================================
     MOBILE MENU LINKS
  ====================================================== */

  const mobileMenuLinks = [
    {
      label: "SHOP",
      href: "#product-explorer",
    },
    {
      label: "BRANDS",
      href: "#brands",
    },
    {
      label: "NEW ARRIVALS",
      href: "#new",
    },
    {
      label: "TRENDING",
      href: "#trending",
    },
    {
      label: "ABOUT",
      href: "#about",
    },
  ];

  /* =====================================================
     RETURN
  ====================================================== */

  return (
    <main
      className="site-shell"
      style={
        {
          "--brand-dark":
            brand.dark,
          "--brand-accent":
            brand.accent,
        } as CSSProperties
      }
    >
      {/* =================================================
          ANNOUNCEMENT TICKER
      ================================================= */}

      <div className="announcement-ticker">
        <div className="announcement-track">
          <div className="announcement-content">
            {[
              ...tickerItems,
              ...tickerItems,
            ].map(
              (
                item,
                index
              ) => (
                <div
                  key={`${item.id}-${index}`}
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: 15,
                  }}
                >
                  {item.link_href ? (
                    <a
                      href={
                        item.link_href
                      }
                    >
                      {
                        item.text
                      }
                    </a>
                  ) : (
                    <span>
                      {
                        item.text
                      }
                    </span>
                  )}

                  <i>
                    ✦
                  </i>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="navbar">
        <div className="nav-inner">
          <a
            href="https://www.facebook.com/share/1SZsueFCmo/"
            className="logo"
            target="_blank"
            rel="noreferrer"
          >
            <span className="logo-a">
              A
            </span>

            <span className="logo-hyphen">
              -
            </span>

            <i className="logo-dash" />

            <strong className="logo-positive">
              POSITIVE
            </strong>
          </a>

          <nav className="desktop-nav">
            <a href="#product-explorer">
              SHOP
            </a>

            <a href="#brands">
              BRANDS
            </a>

            <a href="#new">
              NEW ARRIVALS
            </a>

            <a href="#trending">
              TRENDING
            </a>

            <a href="#about">
              ABOUT
            </a>
          </nav>

          <div className="nav-actions">
            <button
              aria-label="Search"
              type="button"
              onClick={() =>
                setSearchOpen(
                  (value) =>
                    !value
                )
              }
            >
              <Search size={19} />
            </button>

            <button
              aria-label="Account"
              type="button"
              onClick={() =>
                (window.location.href =
                  "/account")
              }
            >
              <UserRound size={19} />
            </button>

            <button
              aria-label="Cart"
              type="button"
              className="cart-button"
              onClick={() =>
                (window.location.href =
                  "/cart")
              }
            >
              <ShoppingBag size={19} />

              {cartCount > 0 && (
                <span>
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="mobile-menu-button"
              type="button"
              onClick={() =>
                setMenuOpen(true)
              }
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* SEARCH */}

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="search-panel"
              initial={{
                opacity: 0,
                y: -15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -15,
              }}
            >
              <Search size={19} />

              <input
                autoFocus
                value={searchText}
                onChange={(
                  event
                ) =>
                  setSearchText(
                    event.target
                      .value
                  )
                }
                placeholder="Search products, brands or categories..."
              />

              <button
                type="button"
                onClick={() => {
                  setSearchOpen(
                    false
                  );

                  document
                    .getElementById(
                      "product-explorer"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    });
                }}
              >
                SEARCH
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchOpen(
                    false
                  );

                  setSearchText(
                    ""
                  );
                }}
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =================================================
          MOBILE MENU
      ================================================= */}

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <button
              className="mobile-menu-close"
              type="button"
              onClick={() =>
                setMenuOpen(
                  false
                )
              }
            >
              <X size={25} />
            </button>

            <div className="mobile-menu-logo">
              <span className="logo-a">
                A
              </span>

              <i className="logo-dash" />

              <span className="logo-positive">
                POSITIVE
              </span>
            </div>

            {mobileMenuLinks.map(
              (item) => (
                <a
                  href={
                    item.href
                  }
                  key={
                    item.label
                  }
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                >
                  {
                    item.label
                  }

                  <ArrowRight size={17} />
                </a>
              )
            )}

            <Link
              href="/login"
              onClick={() =>
                setMenuOpen(
                  false
                )
              }
              className="mobile-extra-link"
            >
              LOGIN
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/register"
              onClick={() =>
                setMenuOpen(
                  false
                )
              }
              className="mobile-extra-link"
            >
              REGISTER
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/wishlist"
              onClick={() =>
                setMenuOpen(
                  false
                )
              }
              className="mobile-extra-link"
            >
              WISHLIST
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/orders"
              onClick={() =>
                setMenuOpen(
                  false
                )
              }
              className="mobile-extra-link"
            >
              MY ORDERS
              <ArrowRight size={17} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          CINEMATIC HERO
      ================================================= */}

      <section className="cinematic-hero">
        <div className="cinematic-noise" />

        <div className="ghost-brands">
          {brands.map(
            (
              item,
              index
            ) => (
              <motion.div
                key={
                  item.id
                }
                className="ghost-brand"
                animate={{
                  opacity:
                    activeBrand ===
                    index
                      ? 0.12
                      : 0.035,

                  x:
                    activeBrand ===
                    index
                      ? 0
                      : index <
                        activeBrand
                      ? -20
                      : 20,
                }}
                transition={{
                  duration:
                    1.2,
                }}
              >
                {
                  item.name
                }
              </motion.div>
            )
          )}
        </div>

        <div className="cinematic-stage">
          <div className="cinematic-copy">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${brand.id}-${heroTitle}`}
                initial={{
                  opacity: 0,
                  x: -60,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: 60,
                }}
                transition={{
                  duration: 0.8,
                }}
              >
                <div className="cinematic-index">
                  <span>
                    0
                    {activeBrand +
                      1}
                  </span>

                  <i />

                  <span>
                    0
                    {
                      brands.length
                    }
                  </span>
                </div>

                <div className="cinematic-brand-label">
                  {
                    brand.shortName
                  }
                </div>

                <h1>
                  {heroTitle ===
                  "A-POSITIVE" ? (
                    <>
                      A
                      <span
                        style={{
                          color:
                            "#C9A227",
                        }}
                      >
                        -
                      </span>
                      POSITIVE
                    </>
                  ) : (
                    heroTitle
                  )}
                </h1>

                <div className="cinematic-subtitle">
                  {
                    heroSubtitle
                  }
                </div>

                <p>
                  {
                    brand.description
                  }
                </p>

                <div className="cinematic-product-meta">
                  <span>
                    {
                      heroProduct.category
                    }
                  </span>

                  <span>
                    {formatPrice(
                      heroProduct.price
                    )}
                  </span>
                </div>

                <a
                  href={
                    heroButtonHref
                  }
                  className="cinematic-button"
                >
                  {
                    heroButtonText
                  }

                  <ArrowRight size={17} />
                </a>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="cinematic-product-area">
            <div className="cinematic-product-glow" />

            <div className="cinematic-product-number">
              0
              {activeBrand +
                1}
            </div>

            <AnimatePresence
              mode="wait"
              custom={
                direction
              }
            >
              <motion.div
                key={`${brand.slug}-${heroProduct.id}-${heroDesktopImage}`}
                className="cinematic-product"
                custom={
                  direction
                }
                initial={{
                  opacity: 0,
                  x:
                    direction *
                    420,
                  scale: 0.78,
                  rotate:
                    direction *
                    5,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  rotate: 0,
                }}
                exit={{
                  opacity: 0,
                  x:
                    direction *
                    -420,
                  scale: 0.82,
                  rotate:
                    direction *
                    -5,
                }}
                transition={{
                  duration: 1.15,
                }}
              >
                <picture>
                  <source
                    media="(max-width: 768px)"
                    srcSet={
                      heroMobileImage
                    }
                  />

                  <img
                    src={
                      heroDesktopImage
                    }
                    alt={
                      heroTitle
                    }
                  />
                </picture>

                <div className="cinematic-image-overlay" />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`product-info-${heroProduct.id}`}
                className="cinematic-product-card"
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                }}
              >
                <span>
                  FEATURED PIECE
                </span>

                <strong>
                  {
                    heroProduct.name
                  }
                </strong>

                <small>
                  {formatPrice(
                    heroProduct.price
                  )}
                </small>
              </motion.div>
            </AnimatePresence>

            <div className="cinematic-vertical">
              A-POSITIVE / FASHION / 26
            </div>
          </div>
        </div>

        <div className="cinematic-bottom">
          <div className="cinematic-progress">
            <motion.div
              animate={{
                width: `${
                  ((activeBrand +
                    1) /
                    Math.max(
                      brands.length,
                      1
                    )) *
                  100
                }%`,
              }}
              transition={{
                duration: 0.4,
              }}
            />
          </div>

          <div className="cinematic-bottom-left">
            <span>
              SCROLL TO EXPLORE
            </span>

            <div className="scroll-line" />
          </div>

          <div className="cinematic-arrows">
            <button
              type="button"
              onClick={
                previousBrand
              }
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={
                nextBrand
              }
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* =================================================
          BRANDS
      ================================================= */}

      <section
        className="brand-world section"
        id="brands"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              01 / OUR WORLD
            </span>

            <h2>
              Three identities.
              <br />
              One destination.
            </h2>
          </div>

          <p>
            Discover three unique
            fashion identities brought
            together under one premium
            destination.
          </p>
        </div>

        <div className="brand-grid">
          {brands.map(
            (
              item,
              index
            ) => {
              const route =
                item.slug ===
                "blue-dream"
                  ? "/brands/blue-dream"
                  : item.slug ===
                    "shopping-zone-bd"
                  ? "/brands/shopping-zone-bd"
                  : item.slug ===
                    "a-positive"
                  ? "/brands/a-positive"
                  : "/";

              return (
                <motion.div
                  key={
                    item.id
                  }
                  whileHover={{
                    y: -8,
                  }}
                >
                  <Link
                    href={
                      route
                    }
                    className={`brand-card ${
                      activeBrand ===
                      index
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveBrand(
                        index
                      )
                    }
                  >
                    <img
                      src={
                        item.image
                      }
                      alt={
                        item.name
                      }
                    />

                    <div className="brand-card-overlay" />

                    <div className="brand-card-content">
                      <span>
                        {
                          item.shortName
                        }
                      </span>

                      <h3>
                        {
                          item.name
                        }
                      </h3>

                      <p>
                        {
                          item.subtitle
                        }
                      </p>

                      <ArrowRight size={18} />
                    </div>
                  </Link>
                </motion.div>
              );
            }
          )}
        </div>
      </section>

      {/* =================================================
          CATEGORY
      ================================================= */}

      <section
        className="category-section section"
        id="shop"
      >
        <div className="section-heading centered">
          <span className="eyebrow">
            02 / SHOP BY CATEGORY
          </span>

          <h2>
            Find your signature
            style.
          </h2>

          <p>
            Essential pieces,
            statement looks and
            everything in between.
          </p>
        </div>

        <div className="category-grid">
          {categories.map(
            (
              category,
              index
            ) => (
              <motion.button
                key={
                  category.name
                }
                className="category-card"
                type="button"
                onClick={() =>
                  selectCategory(
                    category.filter
                  )
                }
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.55,
                  delay:
                    index *
                    0.04,
                }}
              >
                <img
                  src={
                    category.image
                  }
                  alt={
                    category.name
                  }
                />

                <div className="category-overlay" />

                <div className="category-content">
                  <span>
                    {
                      category.count
                    }
                  </span>

                  <h3>
                    {
                      category.name
                    }
                  </h3>

                  <ArrowRight size={18} />
                </div>
              </motion.button>
            )
          )}
        </div>
      </section>

      {/* =================================================
          PRODUCT EXPLORER
      ================================================= */}

      <section
  className="product-section section"
  id="product-explorer"
>
  <div className="section-heading explore-heading">
    <div>
      <span className="eyebrow">
        03 / EXPLORE
      </span>

      <h2 className="explore-title">
        {activeCategory === "ALL"
          ? "Shop the collection"
          : activeCategory}
      </h2>
    </div>

    <a
      href="#product-explorer"
      className="explore-view-link"
    >
      <span>VIEW COLLECTION</span>
      <ArrowRight size={15} />
    </a>
  </div>

  <div className="product-filter-bar premium-filter-bar">
    {[
      "ALL",
      "SHIRT",
      "POLO",
      "T-SHIRT",
      "PANT",
      "DRESS",
      "BAG",
    ].map((category, index) => (
      <button
        key={category}
        type="button"
        className={
          activeCategory === category
            ? "premium-filter active"
            : "premium-filter"
        }
        style={{
          animationDelay: `${index * 0.05}s`,
        }}
        onClick={() =>
          setActiveCategory(category)
        }
      >
        <span className="filter-label">
          {category}
        </span>

        <span className="filter-dot" />
      </button>
    ))}
  </div>

  {filteredProducts.length > 0 ? (
    <div className="product-grid">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          liked={liked.includes(
            product.id
          )}
          toggleLike={() =>
            toggleLike(product.id)
          }
          onTryOn={openTryOn}
          onQuickAdd={addToCart}
        />
      ))}
    </div>
  ) : (
    <div className="empty-products">
      <Search size={30} />

      <strong>
        No products found
      </strong>

      <span>
        Try another search or category.
      </span>
    </div>
  )}
</section>

      {/* =================================================
          NEW ARRIVALS
      ================================================= */}

      <section
        className="product-section section"
        id="new"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              04 / JUST IN
            </span>

            <h2>
              New Arrivals
            </h2>
          </div>

          <span className="live-label">
            <i />
            FRESH DROPS
          </span>
        </div>

        <div className="product-grid">
          {newArrivals.map(
            (
              product
            ) => (
              <ProductCard
                key={
                  product.id
                }
                product={
                  product
                }
                liked={liked.includes(
                  product.id
                )}
                toggleLike={() =>
                  toggleLike(
                    product.id
                  )
                }
                onTryOn={
                  openTryOn
                }
                onQuickAdd={
                  addToCart
                }
              />
            )
          )}
        </div>
      </section>

      {/* =================================================
          EDITORIAL
      ================================================= */}

      <section className="editorial-section">
        <div className="editorial-image">
          <img
            src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1800&q=90"
            alt="A-Positive editorial"
          />
        </div>

        <div className="editorial-content">
          <span className="eyebrow">
            05 / THE A-POSITIVE EDIT
          </span>

          <h2>
            Dress like
            <br />
            <em>
              you mean it.
            </em>
          </h2>

          <p>
            Fashion is more than what
            you wear. It is how you enter
            a room, how you move and how
            you choose to be remembered.
          </p>

          <a
            href="#product-explorer"
            className="dark-button"
          >
            EXPLORE THE EDIT
            <ArrowRight size={17} />
          </a>
        </div>
      </section>

      {/* =================================================
          TRENDING
      ================================================= */}

      <section
        className="product-section section"
        id="trending"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              06 / MOVING FAST
            </span>

            <h2>
              Trending Now
            </h2>
          </div>

          <span className="live-label">
            <i />
            AUTOMATICALLY CURATED
          </span>
        </div>

        <div className="product-grid">
          {trending.map(
            (
              product
            ) => (
              <ProductCard
                key={
                  product.id
                }
                product={
                  product
                }
                liked={liked.includes(
                  product.id
                )}
                toggleLike={() =>
                  toggleLike(
                    product.id
                  )
                }
                onTryOn={
                  openTryOn
                }
                onQuickAdd={
                  addToCart
                }
              />
            )
          )}
        </div>
      </section>

      {/* =================================================
          AI ASSISTANT
      ================================================= */}

      <section className="ai-section">
        <div className="ai-orb">
          <div className="orb-ring ring-one" />
          <div className="orb-ring ring-two" />

          <div className="orb-core">
            <Sparkles size={34} />
          </div>
        </div>

        <div className="ai-copy">
          <span className="eyebrow light">
            07 / AI STYLE ASSISTANT
          </span>

          <h2>
            Your personal
            <br />
            <em>
              fashion intelligence.
            </em>
          </h2>

          <p>
            Tell us your budget,
            occasion, preferred style or
            brand. Our AI will help you
            discover the right products.
          </p>

          <button
            className="ai-open-button"
            type="button"
            onClick={() =>
              setAiOpen(
                true
              )
            }
          >
            ASK THE AI
            <Sparkles size={16} />
          </button>
        </div>
      </section>

      {/* =================================================
          BEST SELLERS
      ================================================= */}

      <section className="product-section section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              08 / CUSTOMER FAVOURITES
            </span>

            <h2>
              Best Sellers
            </h2>
          </div>

          <span className="live-label">
            <i />
            SALES BASED
          </span>
        </div>

        <div className="product-grid">
          {bestSellers.map(
            (
              product
            ) => (
              <ProductCard
                key={
                  product.id
                }
                product={
                  product
                }
                liked={liked.includes(
                  product.id
                )}
                toggleLike={() =>
                  toggleLike(
                    product.id
                  )
                }
                onTryOn={
                  openTryOn
                }
                onQuickAdd={
                  addToCart
                }
              />
            )
          )}
        </div>
      </section>

      {/* =================================================
          VIRTUAL TRY ON
      ================================================= */}

      <section
        className="tryon-section section"
        id="try-on"
      >
        <div className="tryon-copy">
          <span className="eyebrow">
            09 / VIRTUAL TRY-ON
          </span>

          <h2>
            See it on
            <br />
            <em>
              you.
            </em>
          </h2>

          <p>
            Upload your photo, choose
            any fashion piece and preview
            your selected look.
          </p>

          <button
            className="dark-button"
            type="button"
            onClick={() =>
              openTryOn(
                products[0] ??
                  fallbackProducts[0]
              )
            }
          >
            START VIRTUAL TRY-ON
            <WandSparkles size={17} />
          </button>
        </div>

        <div className="tryon-visual">
          <div className="tryon-frame">
            <div className="tryon-frame-glow" />

            <div className="tryon-silhouette">
              <UserRound
                size={90}
                strokeWidth={1}
              />
            </div>

            <div className="tryon-floating-card">
              <WandSparkles size={15} />

              <div>
                <strong>
                  AI FIT EXPERIENCE
                </strong>

                <span>
                  Upload → Choose → Try
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          CART PREVIEW
      ================================================= */}

      <section
        className="cart-preview-section section"
        id="cart-preview"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              10 / YOUR BAG
            </span>

            <h2>
              Shopping Bag
            </h2>
          </div>

          <span className="live-label">
            {cartCount} ITEMS
          </span>
        </div>

        {cart.length ===
        0 ? (
          <div className="empty-cart">
            <ShoppingBag size={32} />

            <strong>
              Your bag is empty
            </strong>

            <span>
              Add something you love
              from the collection.
            </span>

            <a
              href="#product-explorer"
              className="dark-button"
            >
              START SHOPPING
              <ArrowRight size={16} />
            </a>
          </div>
        ) : (
          <div className="cart-list">
            {cart.map(
              (item) => (
                <div
                  className="cart-row"
                  key={
                    item.product.id
                  }
                >
                  <Link
                    href={`/products/${item.product.id}`}
                  >
                    <img
                      src={
                        item.product
                          .image
                      }
                      alt={
                        item.product
                          .name
                      }
                    />
                  </Link>

                  <div>
                    <span>
                      {
                        item.product
                          .brand
                      }
                    </span>

                    <strong>
                      {
                        item.product
                          .name
                      }
                    </strong>

                    <small>
                      Qty:{" "}
                      {
                        item.quantity
                      }
                    </small>
                  </div>

                  <b>
                    {formatPrice(
                      item.product
                        .price *
                        item.quantity
                    )}
                  </b>
                </div>
              )
            )}

            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop:
                  "1px solid rgba(0,0,0,0.08)",
                maxWidth: 500,
                marginLeft:
                  "auto",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  gap: 20,
                  marginBottom: 10,
                }}
              >
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatPrice(
                    cartSubtotal
                  )}
                </strong>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  gap: 20,
                  marginBottom: 10,
                }}
              >
                <span>
                  Delivery
                </span>

                <strong>
                  {formatPrice(
                    deliveryCharge
                  )}
                </strong>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  gap: 20,
                  marginBottom: 10,
                  paddingTop: 10,
                  borderTop:
                    "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <span>
                  Order Total
                </span>

                <strong>
                  {formatPrice(
                    cartGrandTotal
                  )}
                </strong>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  gap: 20,
                  marginBottom: 10,
                }}
              >
                <span>
                  Advance Payment
                </span>

                <strong>
                  {formatPrice(
                    advancePayment
                  )}
                </strong>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  gap: 20,
                  paddingTop: 10,
                  marginTop: 5,
                  borderTop:
                    "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <span>
                  Cash on Delivery
                </span>

                <strong>
                  {formatPrice(
                    codBalance
                  )}
                </strong>
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap: 10,
                flexWrap:
                  "wrap",
              }}
            >
              <Link
                href="/cart"
                className="dark-button"
              >
                GO TO CART
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/checkout"
                className="dark-button"
              >
                CHECKOUT
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* =================================================
          NEWSLETTER
      ================================================= */}

      <section className="newsletter-section">
        <span className="eyebrow">
          JOIN THE WORLD
        </span>

        <h2>
          Stay ahead
          <br />
          of the{" "}
          <em>
            edit.
          </em>
        </h2>

        <p>
          New drops, exclusive edits
          and everything worth wearing.
        </p>

        <form
          onSubmit={(event) =>
            event.preventDefault()
          }
          className="newsletter-form"
        >
          <input
            type="email"
            placeholder="Your email address"
          />

          <button type="submit">
            JOIN
            <ArrowRight size={16} />
          </button>
        </form>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer
        className="footer"
        id="about"
      >
        <div className="footer-main">
          <div className="footer-brand">
            <a
              href="https://www.facebook.com/share/1SZsueFCmo/"
              className="footer-logo"
              target="_blank"
              rel="noreferrer"
            >
              <span className="logo-a">
                A - 
              </span>

              <i className="logo-dash" />

              <span className="footer-positive">
                POSITIVE
              </span>
            </a>

            <p>
              One destination.
              <br />
              Three fashion identities.
            </p>
          </div>

          <div className="footer-column">
            <strong>
              SHOP
            </strong>

            <a href="#product-explorer">
              All Products
            </a>

            <a href="#new">
              New Arrivals
            </a>

            <a href="#trending">
              Trending
            </a>

            <a href="#shop">
              Categories
            </a>

            <Link href="/cart">
              Shopping Cart
            </Link>

            <Link href="/checkout">
              Checkout
            </Link>
          </div>

          <div className="footer-column">
            <strong>
              BRANDS
            </strong>

            <Link href="/brands/blue-dream">
              Blue Dream
            </Link>

            <Link href="/brands/shopping-zone-bd">
              Shopping Zone BD
            </Link>

            <Link href="/brands/a-positive">
              A-Positive
            </Link>
          </div>

          <div className="footer-column">
            <strong>
              ACCOUNT
            </strong>

            <Link href="/account">
              My Account
            </Link>

            <Link href="/login">
              Login
            </Link>

            <Link href="/register">
              Register
            </Link>

            <Link href="/orders">
              Orders
            </Link>

            <Link href="/wishlist">
              Wishlist
            </Link>

            <Link href="/cart">
              Cart
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            ©{" "}
            {new Date().getFullYear()}{" "}
            A-POSITIVE. ALL RIGHTS
            RESERVED.
          </span>

          <span>
            CURATED FASHION · MODERN
            PRESENCE.
          </span>

          <span className="footer-developer">
            DEVELOPED BY{" "}

            <a
              href={
                SHEHAD_RAZA_URL
              }
              className="developer-link"
              target="_blank"
              rel="noreferrer"
            >
              SHEHAD RAZA
            </a>

            <span>
              ·
            </span>

            <a
              href={
                NEXORA_TECH_URL
              }
              className="nexora-link"
              target="_blank"
              rel="noreferrer"
            >
              NEXORA TECH
            </a>
          </span>
        </div>
      </footer>

      {/* =================================================
          QUICK ADD SUCCESS NOTICE
      ================================================= */}

      <AnimatePresence>
        {cartNotice && (
          <motion.div
            initial={{
              opacity: 0,
              y: -18,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -18,
              scale: 0.96,
            }}
            style={{
              position:
                "fixed",
              top: 85,
              right: 20,
              zIndex: 10000,
              width:
                "min(390px, calc(100vw - 30px))",
              background:
                "#11100e",
              color:
                "#fff",
              padding: 18,
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.25)",
            }}
            role="status"
            aria-live="polite"
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "flex-start",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  minWidth: 38,
                  display:
                    "grid",
                  placeItems:
                    "center",
                  background:
                    "#c9a227",
                  color:
                    "#11100e",
                }}
              >
                <Check size={18} />
              </div>

              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <strong
                  style={{
                    display:
                      "block",
                    fontSize: 13,
                    letterSpacing:
                      "0.08em",
                    marginBottom: 5,
                  }}
                >
                  ADDED TO BAG
                </strong>

                <span
                  style={{
                    display:
                      "block",
                    fontSize: 14,
                    lineHeight:
                      1.45,
                    opacity:
                      0.75,
                  }}
                >
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
                style={{
                  background:
                    "transparent",
                  border: "none",
                  color:
                    "#fff",
                  padding: 2,
                  cursor:
                    "pointer",
                  opacity:
                    0.7,
                }}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div
              style={{
                display:
                  "flex",
                gap: 8,
                marginTop: 14,
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
                  textDecoration:
                    "none",
                  background:
                    "#fff",
                  color:
                    "#11100e",
                  padding:
                    "10px 12px",
                  fontSize: 12,
                  fontWeight:
                    700,
                  letterSpacing:
                    "0.06em",
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
                  textDecoration:
                    "none",
                  background:
                    "#c9a227",
                  color:
                    "#11100e",
                  padding:
                    "10px 12px",
                  fontSize: 12,
                  fontWeight:
                    700,
                  letterSpacing:
                    "0.06em",
                }}
              >
                CHECKOUT
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          AI MODAL
      ================================================= */}

      <AnimatePresence>
        {aiOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setAiOpen(
                false
              )
            }
          >
            <motion.div
              className="ai-modal"
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 40,
                scale: 0.96,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                className="modal-close"
                type="button"
                onClick={() =>
                  setAiOpen(
                    false
                  )
                }
              >
                <X size={20} />
              </button>

              <div className="modal-icon">
                <Sparkles size={23} />
              </div>

              <span className="eyebrow">
                AI STYLE ASSISTANT
              </span>

              <h2>
                What are you
                <br />
                looking for?
              </h2>

              <div className="ai-answer">
                {
                  aiAnswer
                }
              </div>

              <div className="ai-input-row">
                <input
                  value={
                    aiMessage
                  }
                  onChange={(
                    event
                  ) =>
                    setAiMessage(
                      event.target
                        .value
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      askAI();
                    }
                  }}
                  placeholder="e.g. formal shirt under ৳2000"
                />

                <button
                  type="button"
                  onClick={() =>
                    askAI()
                  }
                >
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="ai-suggestions">
                <button
                  type="button"
                  onClick={() =>
                    askAI(
                      "Formal shirt under ৳2000"
                    )
                  }
                >
                  Formal under ৳2000
                </button>

                <button
                  type="button"
                  onClick={() =>
                    askAI(
                      "Women's dress"
                    )
                  }
                >
                  Women's dress
                </button>

                <button
                  type="button"
                  onClick={() =>
                    askAI(
                      "Everyday style"
                    )
                  }
                >
                  Everyday style
                </button>

                <button
                  type="button"
                  onClick={() =>
                    askAI(
                      "Premium fashion"
                    )
                  }
                >
                  Premium
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================
          TRY ON MODAL
      ================================================= */}

      <AnimatePresence>
        {tryOnOpen && (
          <motion.div
            className="modal-backdrop tryon-modal-backdrop"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <motion.div
              className="tryon-modal"
              initial={{
                opacity: 0,
                y: 45,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 45,
                scale: 0.96,
              }}
            >
              <button
                className="modal-close"
                type="button"
                onClick={
                  closeTryOn
                }
              >
                <X size={20} />
              </button>

              <div className="tryon-modal-header">
                <div>
                  <span className="eyebrow">
                    AI VIRTUAL TRY-ON
                  </span>

                  <h2>
                    Try the look
                    <br />
                    <em>
                      before you buy.
                    </em>
                  </h2>
                </div>

                <div className="tryon-steps">
                  <span className="active">
                    01
                  </span>

                  <i />

                  <span>
                    02
                  </span>

                  <i />

                  <span>
                    03
                  </span>
                </div>
              </div>

              <div className="tryon-workspace">
                <div className="upload-panel">
                  <div className="workspace-title">
                    <span>
                      01
                    </span>

                    <strong>
                      YOUR PHOTO
                    </strong>
                  </div>

                  <label className="upload-box">
                    {userPhoto ? (
                      <img
                        src={
                          userPhoto
                        }
                        alt="Uploaded preview"
                      />
                    ) : (
                      <>
                        <div className="upload-icon">
                          <Upload size={25} />
                        </div>

                        <strong>
                          Upload your
                          photo
                        </strong>

                        <span>
                          JPG, PNG or WEBP
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={
                        handlePhoto
                      }
                    />
                  </label>

                  {userPhoto && (
                    <button
                      className="change-photo"
                      type="button"
                      onClick={
                        removePhoto
                      }
                    >
                      REMOVE PHOTO
                    </button>
                  )}
                </div>

                <div className="selected-panel">
                  <div className="workspace-title">
                    <span>
                      02
                    </span>

                    <strong>
                      SELECTED LOOK
                    </strong>
                  </div>

                  <div className="selected-product">
                    {tryOnProduct && (
                      <>
                        <img
                          src={
                            tryOnProduct.image
                          }
                          alt={
                            tryOnProduct.name
                          }
                        />

                        <div>
                          <span>
                            {
                              tryOnProduct.brand
                            }
                          </span>

                          <strong>
                            {
                              tryOnProduct.name
                            }
                          </strong>

                          <small>
                            {formatPrice(
                              tryOnProduct.price
                            )}
                          </small>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="product-selector">
                    <span>
                      CHOOSE ANY PRODUCT
                    </span>

                    <div>
                      {products.map(
                        (
                          product
                        ) => (
                          <button
                            key={
                              product.id
                            }
                            type="button"
                            className={
                              tryOnProduct?.id ===
                              product.id
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              setTryOnProduct(
                                product
                              )
                            }
                          >
                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                            />

                            {tryOnProduct?.id ===
                              product.id && (
                              <i>
                                <Check size={11} />
                              </i>
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="tryon-result">
                <div className="workspace-title">
                  <span>
                    03
                  </span>

                  <strong>
                    TRY-ON PREVIEW
                  </strong>
                </div>

                <div className="tryon-result-stage">
                  {processing ? (
                    <div className="processing-state">
                      <div className="processing-ring">
                        <WandSparkles
                          size={25}
                        />
                      </div>

                      <strong>
                        Creating your
                        look...
                      </strong>

                      <span>
                        AI is preparing
                        the selected
                        outfit
                      </span>
                    </div>
                  ) : tryOnDone &&
                    tryOnResult ? (
                    <div className="tryon-composite">
                      <img
                        src={
                          tryOnResult
                        }
                        alt="AI virtual try-on result"
                        className="person-preview"
                      />

                      <div className="result-note">
                        <WandSparkles size={14} />
                        AI GENERATED TRY-ON
                      </div>
                    </div>
                  ) : tryOnError ? (
                    <div className="empty-result">
                      <WandSparkles size={35} />

                      <strong>
                        Try-on failed
                      </strong>

                      <span>
                        {
                          tryOnError
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="empty-result">
                      <WandSparkles size={35} />

                      <strong>
                        Your virtual
                        look appears
                        here
                      </strong>

                      <span>
                        Upload your
                        photo and
                        select a
                        product to
                        start.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="tryon-footer">
                <p>
                  For the best result,
                  upload a clear photo
                  with good lighting.
                </p>

                <button
                  className="tryon-start-button"
                  type="button"
                  disabled={
                    !userPhotoFile ||
                    !tryOnProduct ||
                    processing
                  }
                  onClick={
                    startTryOn
                  }
                >
                  {processing
                    ? "CREATING LOOK..."
                    : "TRY IT ON"}

                  <WandSparkles size={17} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}