"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  User,
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
  tagline: string;
  description: string;
  accent: string;
  dark: string;
  image: string;
  shortName: string;
  active: boolean;
  sortOrder: number;
};

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  stock: number;
  featured: boolean;
  description?: string | null;
};

type HeroSlide = {
  id: string;
  brand_slug: string | null;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  mobile_image_url: string | null;
  button_text: string | null;
  button_href: string | null;
  active: boolean;
  sort_order: number;
};

type Announcement = {
  id: string;
  text: string;
  link_text: string | null;
  link_href: string | null;
  active: boolean;
  sort_order: number;
};

type CartItem = {
  productId: string;
  quantity: number;
};

const supabase = createClient();

/* =========================================================
   FALLBACK BRANDS
========================================================= */

const fallbackBrands: Brand[] = [
  {
    id: "fallback-blue-dream",
    slug: "blue-dream",
    name: "BLUE DREAM",
    tagline: "EVERYDAY. ELEVATED.",
    description:
      "Modern essentials designed for effortless everyday confidence.",
    accent: "#D9E6F5",
    dark: "#071A38",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=85",
    shortName: "BD",
    active: true,
    sortOrder: 1,
  },
  {
    id: "fallback-shopping-zone",
    slug: "shopping-zone-bd",
    name: "SHOPPING ZONE BD",
    tagline: "STYLE WITHOUT LIMITS.",
    description:
      "Contemporary fashion, bags and accessories made for your world.",
    accent: "#F4D9DC",
    dark: "#8E101D",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1400&q=85",
    shortName: "SZ",
    active: true,
    sortOrder: 2,
  },
  {
    id: "fallback-a-positive",
    slug: "a-positive",
    name: "A-POSITIVE",
    tagline: "OWN YOUR PRESENCE.",
    description:
      "A premium fashion house built around confidence, character and detail.",
    accent: "#E9E1CE",
    dark: "#11100E",
    image:
      "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=1400&q=85",
    shortName: "A+",
    active: true,
    sortOrder: 3,
  },
];

/* =========================================================
   FALLBACK PRODUCTS
========================================================= */

const fallbackProducts: Product[] = [
  {
    id: "fallback-essential-oxford-shirt",
    name: "Essential Oxford Shirt",
    brand: "BLUE DREAM",
    category: "Shirt",
    price: 1490,
    oldPrice: 1890,
    image:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1000&q=85",
    stock: 8,
    featured: true,
  },
  {
    id: "fallback-signature-oversized-tee",
    name: "Signature Oversized Tee",
    brand: "BLUE DREAM",
    category: "T-shirt",
    price: 990,
    oldPrice: 1290,
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=85",
    stock: 15,
    featured: true,
  },
  {
    id: "fallback-structured-leather-bag",
    name: "Structured Leather Bag",
    brand: "A-POSITIVE",
    category: "Bag",
    price: 1850,
    oldPrice: 2250,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85",
    stock: 6,
    featured: true,
  },
  {
    id: "fallback-premium-tailored-trouser",
    name: "Premium Tailored Trouser",
    brand: "A-POSITIVE",
    category: "Pant",
    price: 2190,
    oldPrice: 2790,
    image:
      "https://images.unsplash.com/photo-1506629905607-45b0a8f1d0c9?auto=format&fit=crop&w=1000&q=85",
    stock: 4,
    featured: true,
  },
  {
    id: "fallback-a-positive-shirt",
    name: "A-Positive Signature Shirt",
    brand: "A-POSITIVE",
    category: "Shirt",
    price: 1790,
    oldPrice: 2190,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=85",
    stock: 5,
    featured: true,
  },
  {
    id: "fallback-evening-dress",
    name: "Modern Evening Dress",
    brand: "SHOPPING ZONE BD",
    category: "Dress",
    price: 2490,
    oldPrice: 2990,
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85",
    stock: 7,
    featured: true,
  },
  {
    id: "fallback-essential-polo",
    name: "Premium Essential Polo",
    brand: "BLUE DREAM",
    category: "Polo",
    price: 1190,
    oldPrice: 1490,
    image:
      "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1000&q=85",
    stock: 12,
    featured: true,
  },
  {
    id: "fallback-signature-bag",
    name: "Everyday Signature Bag",
    brand: "SHOPPING ZONE BD",
    category: "Bag",
    price: 1590,
    oldPrice: 1990,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85",
    stock: 10,
    featured: true,
  },
];

/* =========================================================
   ROUTES
========================================================= */

const brandRoutes: Record<string, string> = {
  "blue-dream": "/brands/blue-dream",
  "shopping-zone-bd": "/brands/shopping-zone-bd",
  "a-positive": "/brands/a-positive",
};

const fallbackAnnouncements = [
  "NEW SEASON",
  "FREE DELIVERY ON SELECTED ORDERS",
  "PREMIUM FASHION",
  "LIMITED DROPS",
];

const brandCategories: Record<string, string[]> = {
  "blue-dream": [
    "Shirt",
    "Polo",
    "T-shirt",
    "Pant",
  ],
  "shopping-zone-bd": [
    "Dress",
    "Bag",
    "Accessories",
  ],
  "a-positive": [
    "Pant",
    "Shirt",
    "Women",
    "Bag",
    "Dress",
    "Accessories",
  ],
};

/* =========================================================
   HELPERS
========================================================= */

function getBrandShortName(
  slug: string,
  name: string
) {
  const values: Record<string, string> = {
    "blue-dream": "BD",
    "shopping-zone-bd": "SZ",
    "a-positive": "A+",
  };

  if (values[slug]) {
    return values[slug];
  }

  return (
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "BR"
  );
}

function getBrandDescription(
  slug: string
) {
  const values: Record<string, string> = {
    "blue-dream":
      "Modern essentials designed for effortless everyday confidence.",
    "shopping-zone-bd":
      "Contemporary fashion, bags and accessories made for your world.",
    "a-positive":
      "A premium fashion house built around confidence, character and detail.",
  };

  return (
    values[slug] ??
    "Curated fashion designed for your world."
  );
}

function normalizeProduct(
  product: any
): Product {
  return {
    id: String(product.id),
    name:
      product.name ??
      "Untitled Product",
    brand:
      product.brand ??
      "A-POSITIVE",
    category:
      product.category ??
      "Fashion",
    price: Number(
      product.price ?? 0
    ),
    oldPrice:
      product.old_price === null ||
      product.old_price === undefined
        ? null
        : Number(product.old_price),
    image:
      product.image_url ||
      product.image ||
      fallbackProducts[0].image,
    stock: Number(
      product.stock ?? 0
    ),
    featured: Boolean(
      product.featured
    ),
    description:
      product.description ??
      null,
  };
}

function money(value: number) {
  return `৳${Number(
    value || 0
  ).toLocaleString("en-BD")}`;
}

/* =========================================================
   HOME PAGE
========================================================= */

export default function HomePage() {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    accountOpen,
    setAccountOpen,
  ] = useState(false);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");

  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    cmsBrands,
    setCmsBrands,
  ] = useState<Brand[]>([]);

  const [
    heroSlides,
    setHeroSlides,
  ] = useState<HeroSlide[]>([]);

  const [
    announcements,
    setAnnouncements,
  ] = useState<Announcement[]>([]);

  const [
    activeBrand,
    setActiveBrand,
  ] = useState(0);

  const [
    cartItems,
    setCartItems,
  ] = useState<CartItem[]>([]);

  const [
    wishlistIds,
    setWishlistIds,
  ] = useState<string[]>([]);

  const [
    userEmail,
    setUserEmail,
  ] = useState<string | null>(null);

  const [
    aiOpen,
    setAiOpen,
  ] = useState(false);

  const [
    aiMessage,
    setAiMessage,
  ] = useState("");

  const [
    aiReply,
    setAiReply,
  ] = useState(
    "Tell me what you are looking for and I will suggest something from the collection."
  );

  const [
    tryOnOpen,
    setTryOnOpen,
  ] = useState(false);

  const [
    tryOnPreview,
    setTryOnPreview,
  ] = useState<string | null>(
    null
  );

  /* =========================================================
     BRANDS
  ========================================================== */

  const brands = useMemo(() => {
  const cmsMap = new Map(
    cmsBrands.map((brand) => [
      brand.slug,
      brand,
    ])
  );

  return fallbackBrands.map(
    (fallback) => {
      const live = cmsMap.get(
        fallback.slug
      );

      return {
        ...fallback,
        ...(live ?? {}),
        id:
          live?.id ??
          fallback.id,
        slug:
          live?.slug ??
          fallback.slug,
        name:
          live?.name ??
          fallback.name,
        tagline:
          live?.tagline ??
          fallback.tagline,
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
        shortName:
          live?.shortName ??
          fallback.shortName,
        active: true,
        sortOrder:
          live?.sortOrder ??
          fallback.sortOrder,
      };
    }
  );
}, [cmsBrands]);

  /* =========================================================
     PRODUCTS
  ========================================================== */

  const allProducts = useMemo(() => {
    return products.length > 0
      ? products
      : fallbackProducts;
  }, [products]);

  const currentBrand =
    brands[
      activeBrand % brands.length
    ] ??
    fallbackBrands[0];

  const featuredProducts =
    useMemo(() => {
      const featured =
        allProducts.filter(
          (product) =>
            product.featured
        );

      return featured.length > 0
        ? featured
        : allProducts;
    }, [allProducts]);

  const currentBrandProducts =
    useMemo(() => {
      const brandProducts =
        allProducts.filter(
          (product) =>
            product.brand
              ?.toLowerCase() ===
            currentBrand.name.toLowerCase()
        );

      return brandProducts.length >
        0
        ? brandProducts
        : featuredProducts;
    }, [
      allProducts,
      currentBrand.name,
      featuredProducts,
    ]);

  const currentHeroProduct =
    useMemo(() => {
      if (
        currentBrandProducts.length ===
        0
      ) {
        return fallbackProducts[0];
      }

      return (
        currentBrandProducts[
          activeBrand %
            currentBrandProducts.length
        ] ??
        currentBrandProducts[0]
      );
    }, [
      activeBrand,
      currentBrandProducts,
    ]);

  /* =========================================================
     HERO SLIDE
  ========================================================== */

  const activeHeroSlide =
    useMemo(() => {
      const matchingSlides =
        heroSlides.filter(
          (slide) =>
            slide.brand_slug ===
            currentBrand.slug
        );

      if (
        matchingSlides.length > 0
      ) {
        return matchingSlides[0];
      }

      return (
        heroSlides.find(
          (slide) =>
            !slide.brand_slug
        ) ?? null
      );
    }, [
      heroSlides,
      currentBrand.slug,
    ]);

  /*
    ADMIN CONTROLLED HERO

    Priority:
    1. Hero desktop image
    2. Brand image
    3. Product image
    4. Fallback
  */

  const heroImage =
    activeHeroSlide?.image_url ||
    currentBrand.image ||
    currentHeroProduct.image ||
    fallbackBrands[0].image;

  const heroMobileImage =
    activeHeroSlide?.mobile_image_url ||
    activeHeroSlide?.image_url ||
    currentBrand.image ||
    currentHeroProduct.image ||
    fallbackBrands[0].image;

  const heroProductImage =
    currentHeroProduct.image ||
    currentBrand.image ||
    activeHeroSlide?.image_url ||
    fallbackProducts[0].image;

  const heroFeatureImage =
    activeHeroSlide?.image_url ||
    currentBrand.image ||
    currentHeroProduct.image ||
    fallbackBrands[0].image;

  const heroTitle =
    activeHeroSlide?.title ||
    currentBrand.name;

  const heroSubtitle =
    activeHeroSlide?.subtitle ||
    currentBrand.tagline ||
    "OWN YOUR PRESENCE.";

  const heroButtonText =
    activeHeroSlide?.button_text ||
    "SHOP THE LOOK";

  const heroButtonHref =
    activeHeroSlide?.button_href ||
    brandRoutes[
      currentBrand.slug
    ] ||
    `/brands/${currentBrand.slug}`;

  /* =========================================================
     CART
  ========================================================== */

  const cartCount =
    useMemo(
      () =>
        cartItems.reduce(
          (
            total,
            item
          ) =>
            total +
            Math.max(
              item.quantity,
              0
            ),
          0
        ),
      [cartItems]
    );

  /* =========================================================
     FILTERED PRODUCTS
  ========================================================== */

  const visibleProducts =
    useMemo(() => {
      let items = [
        ...allProducts,
      ];

      if (
        activeCategory !==
        "All"
      ) {
        items = items.filter(
          (product) =>
            product.category
              .toLowerCase() ===
            activeCategory.toLowerCase()
        );
      }

      if (
        search.trim()
      ) {
        const query =
          search
            .trim()
            .toLowerCase();

        items = items.filter(
          (product) =>
            product.name
              .toLowerCase()
              .includes(query) ||
            product.brand
              .toLowerCase()
              .includes(query) ||
            product.category
              .toLowerCase()
              .includes(query)
        );
      }

      return items;
    }, [
      allProducts,
      activeCategory,
      search,
    ]);

  /* =========================================================
     SEARCH RESULTS
  ========================================================== */

  const searchResults =
    useMemo(() => {
      if (!search.trim()) {
        return [];
      }

      const query =
        search
          .trim()
          .toLowerCase();

      return allProducts
        .filter(
          (product) =>
            product.name
              .toLowerCase()
              .includes(query) ||
            product.brand
              .toLowerCase()
              .includes(query) ||
            product.category
              .toLowerCase()
              .includes(query)
        )
        .slice(0, 5);
    }, [
      allProducts,
      search,
    ]);

  /* =========================================================
     LOCAL STORAGE + AUTH
  ========================================================== */

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
          setCartItems(
            parsed
              .map(
                (item: any) => ({
                  productId:
                    String(
                      item.productId ??
                        item.id ??
                        ""
                    ),
                  quantity:
                    Number(
                      item.quantity ??
                        1
                    ),
                })
              )
              .filter(
                (item) =>
                  item.productId
              )
          );
        }
      } catch {}
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
      } catch {}
    }

    const loadUser =
      async () => {
        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        setUserEmail(
          user?.email ??
            null
        );
      };

    loadUser();

    const authChannel =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          setUserEmail(
            session?.user
              ?.email ?? null
          );
        }
      );

    const cartListener =
      () => {
        const value =
          localStorage.getItem(
            "a_positive_cart"
          );

        if (!value) {
          setCartItems(
            []
          );
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
            setCartItems(
              parsed
                .map(
                  (
                    item: any
                  ) => ({
                    productId:
                      String(
                        item.productId ??
                          item.id ??
                          ""
                      ),
                    quantity:
                      Number(
                        item.quantity ??
                          1
                      ),
                  })
                )
                .filter(
                  (item) =>
                    item.productId
                )
            );
          }
        } catch {}
      };

    const wishlistListener =
      () => {
        const value =
          localStorage.getItem(
            "a_positive_wishlist"
          );

        if (!value) {
          setWishlistIds(
            []
          );
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
        } catch {}
      };

    window.addEventListener(
      "a_positive_cart_updated",
      cartListener
    );

    window.addEventListener(
      "a_positive_wishlist_updated",
      wishlistListener
    );

    window.addEventListener(
      "storage",
      cartListener
    );

    window.addEventListener(
      "storage",
      wishlistListener
    );

    return () => {
      authChannel.data.subscription.unsubscribe();

      window.removeEventListener(
        "a_positive_cart_updated",
        cartListener
      );

      window.removeEventListener(
        "a_positive_wishlist_updated",
        wishlistListener
      );

      window.removeEventListener(
        "storage",
        cartListener
      );

      window.removeEventListener(
        "storage",
        wishlistListener
      );
    };
  }, []);

  /* =========================================================
     LOAD PRODUCTS FROM SUPABASE
  ========================================================== */

  useEffect(() => {
    const loadProducts =
      async () => {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "products"
            )
            .select(
              "id,name,brand,category,price,old_price,image_url,stock,featured,description"
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
          !error &&
          data
        ) {
          setProducts(
            data.map(
              normalizeProduct
            )
          );
        }
      };

    loadProducts();

    const channel =
      supabase
        .channel(
          "homepage-products"
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

  /* =========================================================
     LOAD BRANDS + HERO + ANNOUNCEMENTS
  ========================================================== */

  useEffect(() => {
    const loadCmsContent =
      async () => {
        const [
          brandsResult,
          heroResult,
          announcementResult,
        ] =
          await Promise.all([
            supabase
              .from("brands")
              .select(
                "id,slug,name,tagline,image_url,accent_color,dark_color,active,sort_order"
              )
              .eq(
                "active",
                true
              )
              .order(
                "sort_order",
                {
                  ascending:
                    true,
                }
              ),

            supabase
              .from(
                "hero_slides"
              )
              .select(
                "id,brand_slug,title,subtitle,image_url,mobile_image_url,button_text,button_href,active,sort_order"
              )
              .eq(
                "active",
                true
              )
              .order(
                "sort_order",
                {
                  ascending:
                    true,
                }
              ),

            supabase
              .from(
                "announcement_bars"
              )
              .select(
                "id,text,link_text,link_href,active,sort_order"
              )
              .eq(
                "active",
                true
              )
              .order(
                "sort_order",
                {
                  ascending:
                    true,
                }
              ),
          ]);

        /* =========================
           BRANDS
        ========================== */

       if (
  !brandsResult.error &&
  brandsResult.data
) {
  const liveBrands: Brand[] =
    brandsResult.data
      .filter(
        (item) =>
          item.active !== false &&
          item.slug
      )
      .map((item) => {
        const fallback =
          fallbackBrands.find(
            (brand) =>
              brand.slug ===
              item.slug
          );

        return {
          id: String(item.id),
          slug: item.slug,

          name:
            item.name ||
            fallback?.name ||
            "A-POSITIVE",

          tagline:
            item.tagline ||
            fallback?.tagline ||
            "",

          description:
            getBrandDescription(
              item.slug
            ),

          accent:
            item.accent_color ||
            fallback?.accent ||
            "#E9E1CE",

          dark:
            item.dark_color ||
            fallback?.dark ||
            "#11100E",

          image:
            item.image_url ||
            fallback?.image ||
            fallbackBrands[0].image,

          shortName:
            getBrandShortName(
              item.slug,
              item.name ||
                fallback?.name ||
                ""
            ),

          active: true,

          sortOrder:
            Number(
              item.sort_order ??
                fallback?.sortOrder ??
                99
            ),
        };
      });

  setCmsBrands(
    liveBrands
  );
}

        /* =========================
           HERO
        ========================== */

        if (
          !heroResult.error &&
          heroResult.data
        ) {
          const liveHeroSlides =
            heroResult.data
              .filter(
                (item) =>
                  item.active !==
                  false
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
                    item.title ||
                    "",
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
                  active:
                    item.active !==
                    false,
                  sort_order:
                    Number(
                      item.sort_order ??
                        0
                    ),
                })
              )
              .sort(
                (a, b) =>
                  a.sort_order -
                  b.sort_order
              );

          setHeroSlides(
            liveHeroSlides
          );
        }

        /* =========================
           ANNOUNCEMENTS
        ========================== */

        if (
          !announcementResult.error &&
          announcementResult.data
        ) {
          const liveAnnouncements =
            announcementResult.data
              .filter(
                (item) =>
                  item.active !==
                  false
              )
              .map(
                (item) => ({
                  id: String(
                    item.id
                  ),
                  text:
                    item.text ||
                    "",
                  link_text:
                    item.link_text ??
                    null,
                  link_href:
                    item.link_href ??
                    null,
                  active:
                    item.active !==
                    false,
                  sort_order:
                    Number(
                      item.sort_order ??
                        0
                    ),
                })
              )
              .sort(
                (a, b) =>
                  a.sort_order -
                  b.sort_order
              );

          setAnnouncements(
            liveAnnouncements
          );
        }
      };

    loadCmsContent();

    const brandsChannel =
      supabase
        .channel(
          "homepage-brands"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "brands",
          },
          () => {
            loadCmsContent();
          }
        )
        .subscribe();

    const heroChannel =
      supabase
        .channel(
          "homepage-hero"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "hero_slides",
          },
          () => {
            loadCmsContent();
          }
        )
        .subscribe();

    const announcementChannel =
      supabase
        .channel(
          "homepage-announcements"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "announcement_bars",
          },
          () => {
            loadCmsContent();
          }
        )
        .subscribe();

    return () => {
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

  /* =========================================================
     BRAND INDEX SAFETY
  ========================================================== */

  useEffect(() => {
    if (
      brands.length ===
      0
    ) {
      return;
    }

    if (
      activeBrand >=
      brands.length
    ) {
      setActiveBrand(0);
    }
  }, [
    brands.length,
    activeBrand,
  ]);

  /* =========================================================
     AUTO BRAND ROTATION
  ========================================================== */

  useEffect(() => {
    if (
      brands.length <=
      1
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          setActiveBrand(
            (previous) =>
              (previous + 1) %
              brands.length
          );
        },
        5500
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [brands.length]);

  /* =========================================================
     SEARCH ESCAPE
  ========================================================== */

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const handleEscape =
      (event: KeyboardEvent) => {
        if (
          event.key ===
          "Escape"
        ) {
          setSearchOpen(
            false
          );
        }
      };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [searchOpen]);

  /* =========================================================
     WISHLIST
  ========================================================== */

  const isWishlisted = (
    productId: string
  ) =>
    wishlistIds.includes(
      String(productId)
    );

  const toggleWishlist =
    (
      productId: string
    ) => {
      const id =
        String(productId);

      const next =
        isWishlisted(id)
          ? wishlistIds.filter(
              (item) =>
                item !== id
            )
          : [
              ...wishlistIds,
              id,
            ];

      setWishlistIds(next);

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

  /* =========================================================
     CART
  ========================================================== */

  const addToCart = (
    product: Product
  ) => {
    if (
      product.stock <=
      0
    ) {
      return;
    }

    const existing =
      cartItems.find(
        (item) =>
          item.productId ===
          product.id
      );

    const next = existing
      ? cartItems.map(
          (item) => {
            if (
              item.productId !==
              product.id
            ) {
              return item;
            }

            return {
              ...item,
              quantity:
                Math.min(
                  item.quantity +
                    1,
                  Math.max(
                    product.stock,
                    1
                  )
                ),
            };
          }
        )
      : [
          ...cartItems,
          {
            productId:
              product.id,
            quantity: 1,
          },
        ];

    setCartItems(next);

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
  };

  /* =========================================================
     AI ASSISTANT
  ========================================================== */

  const submitAi =
    async () => {
      const value =
        aiMessage.trim();

      if (!value) {
        setAiReply(
          "Tell me your preferred style, product type or occasion."
        );

        return;
      }

      try {
        setAiReply(
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
                message:
                  value,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data?.error ||
              "AI assistant request failed."
          );
        }

        setAiReply(
          data?.answer ||
            "I could not generate a response."
        );

        setAiMessage("");
      } catch (error) {
        console.error(
          "AI ASSISTANT ERROR:",
          error
        );

        setAiReply(
          "Sorry, the AI assistant is temporarily unavailable."
        );
      }
    };

  /* =========================================================
     TRY ON
  ========================================================== */

  const handleTryOnFile =
    (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      const url =
        URL.createObjectURL(
          file
        );

      setTryOnPreview(
        url
      );
    };

  /* =========================================================
     ANNOUNCEMENTS
  ========================================================== */

  const displayedAnnouncements =
    announcements.length >
    0
      ? announcements
      : fallbackAnnouncements.map(
          (
            text,
            index
          ) => ({
            id: `fallback-${index}`,
            text,
            link_text:
              null,
            link_href:
              null,
            active: true,
            sort_order:
              index,
          })
        );

  /* =========================================================
     CATEGORIES
  ========================================================== */

  const categories =
    Array.from(
      new Set(
        allProducts
          .map(
            (product) =>
              product.category
          )
          .filter(Boolean)
      )
    );

  const activeBrandCategories =
    brandCategories[
      currentBrand.slug
    ] ?? [];

  /* =========================================================
     SEARCH RESET
  ========================================================== */

  const resetSearch =
    () => {
      setSearch("");
      setSearchOpen(
        false
      );
    };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f7f3",
        color: "#11100e",
      }}
    >
      {/* =====================================================
          ANNOUNCEMENT TICKER
      ====================================================== */}

      <div
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          borderBottom:
            "1px solid rgba(17,16,14,0.08)",
          background: "#11100e",
          color: "#fff",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation:
              "aPositiveTicker 26s linear infinite",
          }}
        >
          {[
            ...displayedAnnouncements,
            ...displayedAnnouncements,
          ].map(
            (
              announcement,
              index
            ) => (
              <div
                key={`${announcement.id}-${index}`}
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 12,
                  padding:
                    "12px 28px",
                }}
              >
                {announcement.link_href ? (
                  <a
                    href={
                      announcement.link_href
                    }
                    style={{
                      color:
                        "inherit",
                      textDecoration:
                        "none",
                    }}
                  >
                    {
                      announcement.text
                    }

                    {announcement.link_text
                      ? ` · ${announcement.link_text}`
                      : ""}
                  </a>
                ) : (
                  <span>
                    {
                      announcement.text
                    }
                  </span>
                )}

                <span
                  style={{
                    opacity: 0.45,
                    fontSize: 8,
                  }}
                >
                  ●
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter:
            "blur(18px)",
          background:
            "rgba(248,247,243,0.92)",
          borderBottom:
            "1px solid rgba(17,16,14,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 18,
          }}
        >
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                true
              )
            }
            style={{
              display: "none",
              border: 0,
              background:
                "transparent",
              cursor: "pointer",
            }}
            className="ap-mobile-menu-button"
            aria-label="Open menu"
          >
            <Menu
              size={21}
            />
          </button>

          <Link
            href="/"
            style={{
              textDecoration:
                "none",
              color: "#11100e",
              display: "flex",
              flexDirection:
                "column",
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing:
                  "-0.07em",
              }}
            >
              A-POSITIVE
            </span>

            <span
              style={{
                fontSize: 8,
                letterSpacing:
                  "0.38em",
                marginTop: 5,
                opacity: 0.5,
              }}
            >
              OWN YOUR PRESENCE
            </span>
          </Link>

          <nav
            className="ap-desktop-nav"
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 26,
            }}
          >
            <Link href="/brands/a-positive">
              A-POSITIVE
            </Link>

            <Link href="/brands/blue-dream">
              BLUE DREAM
            </Link>

            <Link href="/brands/shopping-zone-bd">
              SHOPPING ZONE BD
            </Link>

            <Link href="/products">
              SHOP
            </Link>
          </nav>

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 5,
            }}
          >
            <button
              type="button"
              onClick={() =>
                setSearchOpen(
                  true
                )
              }
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                border:
                  "1px solid rgba(17,16,14,0.08)",
                background:
                  "transparent",
                cursor: "pointer",
                display: "grid",
                placeItems:
                  "center",
              }}
              aria-label="Search"
            >
              <Search
                size={17}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setAccountOpen(
                  (value) =>
                    !value
                )
              }
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                border:
                  "1px solid rgba(17,16,14,0.08)",
                background:
                  "transparent",
                display: "grid",
                placeItems:
                  "center",
                cursor: "pointer",
              }}
              aria-label="Account"
            >
              <User
                size={17}
              />
            </button>

            <Link
              href="/wishlist"
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                border:
                  "1px solid rgba(17,16,14,0.08)",
                background:
                  "transparent",
                display: "grid",
                placeItems:
                  "center",
                position: "relative",
              }}
              aria-label="Wishlist"
            >
              <Heart
                size={17}
                fill={
                  wishlistIds.length >
                  0
                    ? "#11100e"
                    : "transparent"
                }
              />

              {wishlistIds.length >
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
                      "#11100e",
                    color: "#fff",
                    fontSize: 8,
                    display: "grid",
                    placeItems:
                      "center",
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
                width: 38,
                height: 38,
                borderRadius: 999,
                border:
                  "1px solid rgba(17,16,14,0.08)",
                background:
                  "transparent",
                display: "grid",
                placeItems:
                  "center",
                position:
                  "relative",
              }}
              aria-label="Cart"
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
                      "#11100e",
                    color: "#fff",
                    fontSize: 8,
                    display: "grid",
                    placeItems:
                      "center",
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

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding:
            "18px 24px 0",
        }}
      >
        <div
          key={`${currentBrand.id}-${activeHeroSlide?.id ?? "default"}-${activeBrand}`}
          className="ap-hero"
          style={{
            position: "relative",
            minHeight: 720,
            overflow: "hidden",
            background:
              currentBrand.dark,
          }}
        >
          {/* BACKGROUND */}

          <div className="ap-hero-bg">
            <picture>
              <source
                media="(max-width: 700px)"
                srcSet={
                  heroMobileImage
                }
              />

              <img
                src={heroImage}
                alt={heroTitle}
                className="ap-hero-bg-image"
                onError={(
                  event
                ) => {
                  event.currentTarget.src =
                    currentBrand.image ||
                    fallbackBrands[0]
                      .image;
                }}
              />
            </picture>
          </div>

          {/* OVERLAY */}

          <div
            className="ap-hero-overlay"
            style={{
              background:
                `linear-gradient(90deg, ${currentBrand.dark}F2 0%, ${currentBrand.dark}B8 33%, rgba(0,0,0,0.42) 68%, rgba(0,0,0,0.08) 100%)`,
            }}
          />

          {/* GLOW */}

          <div
            className="ap-hero-glow"
            style={{
              background:
                currentBrand.accent,
            }}
          />

          {/* WATERMARK */}

          <div
            className="ap-hero-watermark"
          >
            {
              currentBrand.shortName
            }
          </div>

          {/* CONTENT */}

          <div
            className="ap-hero-content"
          >
            <div
              className="ap-hero-copy"
            >
              <div
                className="ap-hero-eyebrow"
              >
                <span
                  style={{
                    background:
                      currentBrand.accent,
                  }}
                />

                {
                  currentBrand.name
                }
              </div>

              <h1
                className="ap-hero-title"
              >
                {heroTitle}
              </h1>

              <div
                className="ap-hero-subtitle"
              >
                {heroSubtitle}
              </div>

              <p
                className="ap-hero-description"
              >
                {
                  currentBrand.description
                }
              </p>

              <div
                className="ap-hero-buttons"
              >
                <Link
                  href={
                    heroButtonHref
                  }
                  className="ap-hero-primary"
                >
                  {
                    heroButtonText
                  }

                  <ArrowRight
                    size={15}
                  />
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setAiOpen(
                      true
                    )
                  }
                  className="ap-hero-ai"
                >
                  <Sparkles
                    size={15}
                  />

                  AI STYLE
                </button>
              </div>
            </div>

            {/* HERO PRODUCT */}

            <div
              className="ap-hero-product-wrap"
            >
              <div
                className="ap-hero-product"
              >
                <Link
                  href={`/products/${currentHeroProduct.id}`}
                  className="ap-hero-product-image"
                >
                  <img
                    src={
                      heroProductImage
                    }
                    alt={
                      currentHeroProduct.name
                    }
                    onError={(
                      event
                    ) => {
                      event.currentTarget.src =
                        currentHeroProduct.image ||
                        currentBrand.image ||
                        fallbackProducts[0]
                          .image;
                    }}
                  />
                </Link>

                <div
                  className="ap-hero-product-bottom"
                >
                  <div>
                    <span>
                      {
                        currentHeroProduct.brand
                      }
                    </span>

                    <strong>
                      {
                        currentHeroProduct.name
                      }
                    </strong>
                  </div>

                  <b>
                    {money(
                      currentHeroProduct.price
                    )}
                  </b>
                </div>
              </div>

              <div
                className="ap-hero-floating-card"
              >
                <span>
                  CURATED
                </span>

                <strong>
                  {
                    currentHeroProduct.category
                  }
                </strong>
              </div>

              <div
                className="ap-hero-product-ring"
              />
            </div>
          </div>

          {/* ARROWS */}

          <div
            className="ap-hero-arrows"
          >
            <button
              type="button"
              onClick={() =>
                setActiveBrand(
                  (previous) =>
                    (previous -
                      1 +
                      brands.length) %
                    brands.length
                )
              }
              aria-label="Previous brand"
            >
              <ChevronLeft
                size={18}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveBrand(
                  (previous) =>
                    (previous +
                      1) %
                    brands.length
                )
              }
              aria-label="Next brand"
            >
              <ChevronRight
                size={18}
              />
            </button>
          </div>

          {/* PROGRESS */}

          <div
            className="ap-hero-progress"
          >
            {brands.map(
              (
                brand,
                index
              ) => (
                <button
                  key={
                    brand.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveBrand(
                      index
                    )
                  }
                  className={
                    index ===
                    activeBrand
                      ? "active"
                      : ""
                  }
                  aria-label={`Show ${brand.name}`}
                />
              )
            )}
          </div>

          {/* META */}

          <div
            className="ap-hero-meta"
          >
            <div>
              <strong>
                0
                {activeBrand +
                  1}
              </strong>

              <span>
                / 0
                {
                  brands.length
                }
              </span>
            </div>

            <div>
              {
                currentBrand.tagline
              }
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BRAND SWITCHER
      ====================================================== */}

      <section
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding:
            "72px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems:
              "flex-end",
            justifyContent:
              "space-between",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing:
                  "0.26em",
                textTransform:
                  "uppercase",
                opacity: 0.52,
                marginBottom: 10,
              }}
            >
              OUR HOUSES
            </div>

            <h2
              style={{
                fontFamily:
                  "Georgia, serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize:
                  "clamp(38px,5vw,64px)",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Three distinct worlds.
            </h2>
          </div>
        </div>

        <div
          className="ap-brand-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {brands.map(
            (
              brand,
              index
            ) => (
              <Link
                key={
                  brand.id
                }
                href={
                  brandRoutes[
                    brand.slug
                  ] ||
                  `/brands/${brand.slug}`
                }
                onClick={() =>
                  setActiveBrand(
                    index
                  )
                }
                style={{
                  position: "relative",
                  minHeight: 420,
                  overflow: "hidden",
                  cursor: "pointer",
                  background:
                    brand.dark,
                  color: "#fff",
                  textAlign: "left",
                  textDecoration:
                    "none",
                  display: "block",
                }}
              >
                <img
                  src={
                    brand.image
                  }
                  alt={
                    brand.name
                  }
                  onError={(
                    event
                  ) => {
                    const fallback =
                      fallbackBrands.find(
                        (
                          item
                        ) =>
                          item.slug ===
                          brand.slug
                      );

                    event.currentTarget.src =
                      fallback?.image ||
                      fallbackBrands[0]
                        .image;
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
                      "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.72))",
                  }}
                />

                <div
                  style={{
                    position:
                      "relative",
                    height:
                      "100%",
                    minHeight:
                      420,
                    padding: 26,
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing:
                          "0.25em",
                        textTransform:
                          "uppercase",
                        opacity:
                          0.78,
                      }}
                    >
                      {
                        brand.shortName
                      }
                    </span>

                    <ArrowRight
                      size={18}
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        fontFamily:
                          "Georgia, serif",
                        fontStyle:
                          "italic",
                        fontSize:
                          "clamp(30px,3vw,46px)",
                        lineHeight:
                          0.98,
                        marginBottom:
                          12,
                      }}
                    >
                      {
                        brand.name
                      }
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing:
                          "0.16em",
                        textTransform:
                          "uppercase",
                        opacity:
                          0.83,
                      }}
                    >
                      {
                        brand.tagline
                      }
                    </div>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
      </section>

      {/* =====================================================
          CATEGORY STRIP
      ====================================================== */}

      <section
        style={{
          borderTop:
            "1px solid rgba(17,16,14,0.09)",
          borderBottom:
            "1px solid rgba(17,16,14,0.09)",
          background:
            "#efede7",
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding:
              "20px 24px",
            display: "flex",
            alignItems:
              "center",
            gap: 10,
            overflowX:
              "auto",
          }}
        >
          {[
            "All",
            ...Array.from(
              new Set(
                activeBrandCategories.concat(
                  categories
                )
              )
            ),
          ].map(
            (
              category
            ) => (
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
                  flexShrink: 0,
                  padding:
                    "10px 15px",
                  border:
                    activeCategory ===
                    category
                      ? "1px solid #11100e"
                      : "1px solid rgba(17,16,14,0.13)",
                  background:
                    activeCategory ===
                    category
                      ? "#11100e"
                      : "transparent",
                  color:
                    activeCategory ===
                    category
                      ? "#fff"
                      : "#11100e",
                  cursor: "pointer",
                  fontSize: 10,
                  letterSpacing:
                    "0.16em",
                  textTransform:
                    "uppercase",
                }}
              >
                {
                  category
                }
              </button>
            )
          )}
        </div>
      </section>

      {/* =====================================================
          PRODUCTS
      ====================================================== */}

      <section
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding:
            "84px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-end",
            gap: 20,
            marginBottom: 30,
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
                opacity: 0.5,
                marginBottom: 10,
              }}
            >
              CURATED NOW
            </div>

            <h2
              style={{
                fontFamily:
                  "Georgia, serif",
                fontStyle:
                  "italic",
                fontSize:
                  "clamp(38px,5vw,64px)",
                fontWeight: 400,
                margin: 0,
              }}
            >
              Featured pieces.
            </h2>
          </div>

          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems:
                "center",
              gap: 8,
              color: "#11100e",
              fontSize: 10,
              letterSpacing:
                "0.17em",
              textTransform:
                "uppercase",
              textDecoration:
                "none",
              borderBottom:
                "1px solid rgba(17,16,14,0.3)",
              paddingBottom:
                5,
            }}
          >
            View all
            <ArrowRight
              size={13}
            />
          </Link>
        </div>

        <div
          className="ap-products-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: 18,
          }}
        >
          {visibleProducts
            .slice(0, 8)
            .map(
              (
                product
              ) => {
                const stockText =
                  product.stock <=
                  0
                    ? "OUT OF STOCK"
                    : product.stock <=
                      3
                    ? "LOW STOCK"
                    : product.featured
                    ? "NEW"
                    : "";

                return (
                  <article
                    key={
                      product.id
                    }
                  >
                    <div
                      style={{
                        position:
                          "relative",
                        overflow:
                          "hidden",
                        background:
                          "#ebe9e2",
                      }}
                    >
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
                            product.image
                          }
                          alt={
                            product.name
                          }
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              fallbackProducts[0]
                                .image;
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
                      </Link>

                      {stockText && (
                        <span
                          style={{
                            position:
                              "absolute",
                            top: 12,
                            left: 12,
                            background:
                              "#fff",
                            color:
                              "#11100e",
                            padding:
                              "7px 9px",
                            fontSize: 8,
                            letterSpacing:
                              "0.15em",
                          }}
                        >
                          {
                            stockText
                          }
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          toggleWishlist(
                            product.id
                          )
                        }
                        style={{
                          position:
                            "absolute",
                          top: 10,
                          right: 10,
                          width: 34,
                          height: 34,
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
                            "pointer",
                        }}
                        aria-label="Toggle wishlist"
                      >
                        <Heart
                          size={15}
                          fill={
                            isWishlisted(
                              product.id
                            )
                              ? "#11100e"
                              : "transparent"
                          }
                        />
                      </button>

                      <div
                        style={{
                          position:
                            "absolute",
                          left: 10,
                          right: 10,
                          bottom: 10,
                          display:
                            "flex",
                          gap: 7,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                          disabled={
                            product.stock <=
                            0
                          }
                          style={{
                            flex: 1,
                            padding:
                              "12px 10px",
                            border: 0,
                            background:
                              product.stock <=
                              0
                                ? "rgba(17,16,14,0.5)"
                                : "#11100e",
                            color:
                              "#fff",
                            cursor:
                              product.stock <=
                              0
                                ? "not-allowed"
                                : "pointer",
                            fontSize: 9,
                            letterSpacing:
                              "0.14em",
                          }}
                        >
                          {product.stock <=
                          0
                            ? "SOLD OUT"
                            : "QUICK ADD"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTryOnOpen(
                              true
                            );

                            setTryOnPreview(
                              product.image
                            );
                          }}
                          style={{
                            padding:
                              "12px 10px",
                            border: 0,
                            background:
                              "#fff",
                            color:
                              "#11100e",
                            cursor:
                              "pointer",
                            fontSize: 9,
                            letterSpacing:
                              "0.14em",
                          }}
                        >
                          TRY ON
                        </button>
                      </div>
                    </div>

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
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 9,
                              letterSpacing:
                                "0.18em",
                              textTransform:
                                "uppercase",
                              opacity:
                                0.46,
                              marginBottom:
                                6,
                            }}
                          >
                            {
                              product.brand
                            }
                          </div>

                          <Link
                            href={`/products/${product.id}`}
                            style={{
                              color:
                                "#11100e",
                              textDecoration:
                                "none",
                              fontSize: 14,
                              lineHeight:
                                1.35,
                            }}
                          >
                            {
                              product.name
                            }
                          </Link>
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

                          {product.oldPrice &&
                            product.oldPrice >
                              product.price && (
                              <div
                                style={{
                                  marginTop:
                                    3,
                                  fontSize:
                                    11,
                                  opacity:
                                    0.4,
                                  textDecoration:
                                    "line-through",
                                }}
                              >
                                {money(
                                  product.oldPrice
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

        {visibleProducts.length ===
          0 && (
          <div
            style={{
              padding:
                "80px 20px",
              textAlign:
                "center",
              border:
                "1px dashed rgba(17,16,14,0.18)",
            }}
          >
            <div
              style={{
                fontFamily:
                  "Georgia, serif",
                fontStyle:
                  "italic",
                fontSize: 32,
                marginBottom:
                  10,
              }}
            >
              Nothing found.
            </div>

            <div
              style={{
                fontSize: 13,
                opacity: 0.56,
              }}
            >
              Try another search
              or category.
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          BRAND FEATURE
      ====================================================== */}

      <section
        style={{
          background:
            currentBrand.dark,
          color: "#fff",
        }}
      >
        <div
          className="ap-feature-wrap"
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding:
              "100px 24px",
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 60,
            alignItems:
              "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing:
                  "0.27em",
                textTransform:
                  "uppercase",
                opacity: 0.62,
                marginBottom: 18,
              }}
            >
              {
                currentBrand.name
              }
            </div>

            <h2
              style={{
                fontFamily:
                  "Georgia, serif",
                fontStyle:
                  "italic",
                fontWeight: 400,
                fontSize:
                  "clamp(46px,6vw,82px)",
                lineHeight: 0.94,
                letterSpacing:
                  "-0.04em",
                margin: 0,
              }}
            >
              {
                currentBrand.tagline
              }
            </h2>

            <p
              style={{
                maxWidth: 540,
                fontSize: 15,
                lineHeight: 1.9,
                opacity: 0.72,
                marginTop: 24,
              }}
            >
              {
                currentBrand.description
              }
            </p>

            <Link
              href={
                brandRoutes[
                  currentBrand.slug
                ] ||
                `/brands/${currentBrand.slug}`
              }
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: 9,
                color: "#fff",
                textDecoration:
                  "none",
                marginTop: 14,
                fontSize: 10,
                letterSpacing:
                  "0.18em",
                textTransform:
                  "uppercase",
              }}
            >
              Discover the brand
              <ArrowRight
                size={14}
              />
            </Link>
          </div>

          <div
            style={{
              position:
                "relative",
              aspectRatio:
                "0.88",
              overflow:
                "hidden",
            }}
          >
            <img
              src={
                heroFeatureImage
              }
              alt={
                currentBrand.name
              }
              onError={(
                event
              ) => {
                event.currentTarget.src =
                  currentBrand.image ||
                  fallbackBrands[0]
                    .image;
              }}
              style={{
                width:
                  "100%",
                height:
                  "100%",
                objectFit:
                  "cover",
              }}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding:
            "100px 24px",
          textAlign:
            "center",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing:
              "0.27em",
            textTransform:
              "uppercase",
            opacity: 0.48,
            marginBottom: 18,
          }}
        >
          A-POSITIVE
        </div>

        <h2
          style={{
            fontFamily:
              "Georgia, serif",
            fontStyle:
              "italic",
            fontSize:
              "clamp(52px,8vw,120px)",
            lineHeight:
              0.88,
            fontWeight: 400,
            margin: 0,
            letterSpacing:
              "-0.06em",
          }}
        >
          Own your presence.
        </h2>

        <p
          style={{
            maxWidth: 570,
            margin:
              "28px auto 0",
            fontSize: 14,
            lineHeight: 1.85,
            opacity: 0.58,
          }}
        >
          Carefully selected fashion,
          built to become part of the
          way you move through the world.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent:
              "center",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 30,
          }}
        >
          <Link
            href="/products"
            style={{
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: 9,
              padding:
                "15px 21px",
              background:
                "#11100e",
              color: "#fff",
              textDecoration:
                "none",
              fontSize: 10,
              letterSpacing:
                "0.17em",
            }}
          >
            SHOP COLLECTION
            <ArrowRight
              size={14}
            />
          </Link>

          <Link
            href="/wishlist"
            style={{
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: 9,
              padding:
                "15px 21px",
              background:
                "transparent",
              color: "#11100e",
              textDecoration:
                "none",
              fontSize: 10,
              letterSpacing:
                "0.17em",
              border:
                "1px solid rgba(17,16,14,0.18)",
            }}
          >
            VIEW WISHLIST
            <Heart
              size={14}
            />
          </Link>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer
        style={{
          background:
            "#11100e",
          color: "#fff",
        }}
      >
        <div
          className="ap-footer-grid"
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding:
              "70px 24px 40px",
            display: "grid",
            gridTemplateColumns:
              "1.5fr 1fr 1fr 1fr",
            gap: 50,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing:
                  "-0.07em",
              }}
            >
              A-POSITIVE
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: 8,
                letterSpacing:
                  "0.4em",
                opacity: 0.4,
              }}
            >
              OWN YOUR PRESENCE
            </div>

            <p
              style={{
                maxWidth: 340,
                fontSize: 13,
                lineHeight: 1.8,
                opacity: 0.58,
                marginTop: 22,
              }}
            >
              Premium fashion with
              a modern point of view,
              built for everyday confidence.
            </p>
          </div>

          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing:
                  "0.2em",
                textTransform:
                  "uppercase",
                opacity: 0.42,
                marginBottom: 18,
              }}
            >
              SHOP
            </div>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: 12,
              }}
            >
              <Link href="/products">
                All Products
              </Link>

              <Link href="/wishlist">
                Wishlist
              </Link>

              <Link href="/cart">
                Cart
              </Link>

              <Link href="/orders">
                Orders
              </Link>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing:
                  "0.2em",
                textTransform:
                  "uppercase",
                opacity: 0.42,
                marginBottom: 18,
              }}
            >
              BRANDS
            </div>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: 12,
              }}
            >
              <Link href="/brands/a-positive">
                A-POSITIVE
              </Link>

              <Link href="/brands/blue-dream">
                BLUE DREAM
              </Link>

              <Link href="/brands/shopping-zone-bd">
                SHOPPING ZONE BD
              </Link>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing:
                  "0.2em",
                textTransform:
                  "uppercase",
                opacity: 0.42,
                marginBottom: 18,
              }}
            >
              ACCOUNT
            </div>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: 12,
              }}
            >
              <Link href="/account">
                My Account
              </Link>

              <Link href="/login">
                Login
              </Link>

              <Link href="/register">
                Register
              </Link>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding:
              "18px 24px 25px",
            borderTop:
              "1px solid rgba(255,255,255,0.1)",
            display:
              "flex",
            justifyContent:
              "space-between",
            gap: 20,
            flexWrap:
              "wrap",
            fontSize: 10,
            opacity: 0.42,
            letterSpacing:
              "0.08em",
          }}
        >
          <span>
            © {new Date().getFullYear()}{" "}
            A-POSITIVE. ALL RIGHTS
            RESERVED.
          </span>

          <span>
            CURATED FASHION · MODERN
            PRESENCE
          </span>
        </div>
      </footer>

      {/* =====================================================
          SEARCH MODAL
      ====================================================== */}

      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background:
              "rgba(17,16,14,0.46)",
            backdropFilter:
              "blur(10px)",
            padding: 20,
          }}
          onClick={() =>
            setSearchOpen(
              false
            )
          }
        >
          <div
            style={{
              maxWidth: 760,
              margin:
                "90px auto 0",
              background:
                "#f8f7f3",
              boxShadow:
                "0 25px 90px rgba(0,0,0,0.2)",
            }}
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div
              style={{
                padding: 22,
                display: "flex",
                alignItems:
                  "center",
                gap: 12,
                borderBottom:
                  "1px solid rgba(17,16,14,0.08)",
              }}
            >
              <Search
                size={19}
              />

              <input
                autoFocus
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search products, brands or categories..."
                style={{
                  flex: 1,
                  border: 0,
                  outline: 0,
                  background:
                    "transparent",
                  fontSize: 16,
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setSearchOpen(
                    false
                  )
                }
                style={{
                  border: 0,
                  background:
                    "transparent",
                  cursor:
                    "pointer",
                }}
              >
                <X
                  size={18}
                />
              </button>
            </div>

            <div
              style={{
                padding: 10,
                maxHeight: 430,
                overflowY:
                  "auto",
              }}
            >
              {searchResults.length >
              0 ? (
                searchResults.map(
                  (
                    product
                  ) => (
                    <Link
                      key={
                        product.id
                      }
                      href={`/products/${product.id}`}
                      onClick={
                        resetSearch
                      }
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 13,
                        padding: 12,
                        textDecoration:
                          "none",
                        color:
                          "#11100e",
                      }}
                    >
                      <img
                        src={
                          product.image
                        }
                        alt={
                          product.name
                        }
                        onError={(
                          event
                        ) => {
                          event.currentTarget.src =
                            fallbackProducts[0]
                              .image;
                        }}
                        style={{
                          width: 58,
                          height: 72,
                          objectFit:
                            "cover",
                        }}
                      />

                      <div>
                        <div
                          style={{
                            fontSize: 9,
                            letterSpacing:
                              "0.14em",
                            textTransform:
                              "uppercase",
                            opacity: 0.42,
                            marginBottom: 4,
                          }}
                        >
                          {
                            product.brand
                          }
                        </div>

                        <div
                          style={{
                            fontSize: 14,
                          }}
                        >
                          {
                            product.name
                          }
                        </div>

                        <div
                          style={{
                            marginTop: 5,
                            fontSize: 12,
                            opacity: 0.6,
                          }}
                        >
                          {money(
                            product.price
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                )
              ) : search.trim() ? (
                <div
                  style={{
                    padding:
                      "42px 20px",
                    textAlign:
                      "center",
                    opacity:
                      0.56,
                    fontSize: 13,
                  }}
                >
                  No products found.
                </div>
              ) : (
                <div
                  style={{
                    padding:
                      "42px 20px",
                    textAlign:
                      "center",
                    opacity:
                      0.5,
                    fontSize: 13,
                  }}
                >
                  Start typing to
                  search.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            background:
              "#f8f7f3",
            padding: 24,
            overflowY:
              "auto",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >
            <Link
              href="/"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
              style={{
                color: "#11100e",
                textDecoration:
                  "none",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing:
                  "-0.06em",
              }}
            >
              A-POSITIVE
            </Link>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
              style={{
                border: 0,
                background:
                  "transparent",
                cursor:
                  "pointer",
              }}
            >
              <X
                size={24}
              />
            </button>
          </div>

          <nav
            style={{
              marginTop: 70,
              display:
                "flex",
              flexDirection:
                "column",
              gap: 24,
            }}
          >
            <Link
              href="/brands/a-positive"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
            >
              A-POSITIVE
            </Link>

            <Link
              href="/brands/blue-dream"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
            >
              BLUE DREAM
            </Link>

            <Link
              href="/brands/shopping-zone-bd"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
            >
              SHOPPING ZONE BD
            </Link>

            <Link
              href="/products"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
            >
              SHOP ALL
            </Link>

            <Link
              href="/wishlist"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
            >
              WISHLIST
            </Link>

            <Link
              href="/orders"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
            >
              ORDERS
            </Link>

            <Link
              href="/account"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
            >
              ACCOUNT
            </Link>

            <Link
              href="/cart"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
            >
              CART ({cartCount})
            </Link>
          </nav>
        </div>
      )}

      {/* =====================================================
          ACCOUNT QUICK PANEL
      ====================================================== */}

      {accountOpen && (
        <div
          style={{
            position:
              "fixed",
            top: 80,
            right: 20,
            zIndex: 80,
            width: 290,
            padding: 20,
            background:
              "#f8f7f3",
            border:
              "1px solid rgba(17,16,14,0.1)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing:
                "0.17em",
              textTransform:
                "uppercase",
              opacity: 0.45,
            }}
          >
            ACCOUNT
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 14,
            }}
          >
            {
              userEmail ||
              "Guest account"
            }
          </div>

          <div
            style={{
              marginTop: 18,
              display:
                "grid",
              gap: 8,
            }}
          >
            <Link
              href={
                userEmail
                  ? "/account"
                  : "/login"
              }
              onClick={() =>
                setAccountOpen(
                  false
                )
              }
            >
              {userEmail
                ? "Open account"
                : "Login"}
            </Link>

            {!userEmail && (
              <Link
                href="/register"
                onClick={() =>
                  setAccountOpen(
                    false
                  )
                }
              >
                Create account
              </Link>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          AI ASSISTANT
      ====================================================== */}

      {aiOpen && (
        <div
          style={{
            position:
              "fixed",
            right: 20,
            bottom: 20,
            zIndex: 90,
            width: 360,
            maxWidth:
              "calc(100vw - 40px)",
            background:
              "#11100e",
            color: "#fff",
            boxShadow:
              "0 25px 70px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              padding: 18,
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap: 12,
              borderBottom:
                "1px solid rgba(255,255,255,0.11)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing:
                    "0.18em",
                }}
              >
                AI STYLE ASSISTANT
              </div>

              <div
                style={{
                  fontSize: 11,
                  opacity: 0.45,
                  marginTop: 4,
                }}
              >
                Curated for your
                style.
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setAiOpen(
                  false
                )
              }
              style={{
                border: 0,
                background:
                  "transparent",
                color: "#fff",
                cursor:
                  "pointer",
              }}
            >
              <X
                size={18}
              />
            </button>
          </div>

          <div
            style={{
              padding: 18,
            }}
          >
            <div
              style={{
                padding: 14,
                background:
                  "rgba(255,255,255,0.07)",
                lineHeight: 1.7,
                fontSize: 12,
              }}
            >
              {
                aiReply
              }
            </div>

            <div
              style={{
                display:
                  "flex",
                gap: 8,
                marginTop: 12,
              }}
            >
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
                    submitAi();
                  }
                }}
                placeholder="e.g. shirt for a formal look"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border:
                    "1px solid rgba(255,255,255,0.16)",
                  background:
                    "transparent",
                  color: "#fff",
                  outline: 0,
                  padding:
                    "12px 13px",
                  fontSize: 12,
                }}
              />

              <button
                type="button"
                onClick={
                  submitAi
                }
                style={{
                  border: 0,
                  background:
                    "#fff",
                  color:
                    "#11100e",
                  padding:
                    "0 15px",
                  cursor:
                    "pointer",
                }}
              >
                <ArrowRight
                  size={16}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          TRY ON
      ====================================================== */}

      {tryOnOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background:
              "rgba(17,16,14,0.62)",
            backdropFilter:
              "blur(10px)",
            padding: 20,
            display: "grid",
            placeItems:
              "center",
          }}
          onClick={() =>
            setTryOnOpen(
              false
            )
          }
        >
          <div
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            style={{
              width: 520,
              maxWidth:
                "100%",
              background:
                "#f8f7f3",
            }}
          >
            <div
              style={{
                padding: 18,
                borderBottom:
                  "1px solid rgba(17,16,14,0.08)",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing:
                      "0.18em",
                  }}
                >
                  VIRTUAL TRY-ON
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    opacity: 0.48,
                  }}
                >
                  Demo preview
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setTryOnOpen(
                    false
                  )
                }
                style={{
                  border: 0,
                  background:
                    "transparent",
                  cursor:
                    "pointer",
                }}
              >
                <X
                  size={19}
                />
              </button>
            </div>

            <div
              style={{
                padding: 20,
              }}
            >
              <div
                style={{
                  position:
                    "relative",
                  aspectRatio:
                    "0.8",
                  background:
                    "#ebe9e2",
                  overflow:
                    "hidden",
                }}
              >
                {tryOnPreview ? (
                  <img
                    src={
                      tryOnPreview
                    }
                    alt="Try-on preview"
                    style={{
                      width:
                        "100%",
                      height:
                        "100%",
                      objectFit:
                        "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height:
                        "100%",
                      display:
                        "grid",
                      placeItems:
                        "center",
                      textAlign:
                        "center",
                      padding:
                        30,
                    }}
                  >
                    <div>
                      <Sparkles
                        size={28}
                        style={{
                          margin:
                            "0 auto 12px",
                        }}
                      />

                      <div
                        style={{
                          fontFamily:
                            "Georgia, serif",
                          fontStyle:
                            "italic",
                          fontSize: 28,
                        }}
                      >
                        See it on you.
                      </div>

                      <p
                        style={{
                          fontSize: 12,
                          lineHeight:
                            1.7,
                          opacity:
                            0.5,
                          marginTop: 10,
                        }}
                      >
                        Upload a photo
                        to preview the
                        selected product.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <label
                style={{
                  marginTop: 14,
                  display:
                    "flex",
                  justifyContent:
                    "center",
                  alignItems:
                    "center",
                  padding:
                    "13px 15px",
                  border:
                    "1px solid rgba(17,16,14,0.15)",
                  cursor:
                    "pointer",
                  fontSize: 10,
                  letterSpacing:
                    "0.15em",
                  textTransform:
                    "uppercase",
                }}
              >
                Upload photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleTryOnFile
                  }
                  style={{
                    display:
                      "none",
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PAGE STYLES
      ====================================================== */}

      <style jsx global>{`
        @keyframes aPositiveTicker {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @keyframes apHeroEntrance {
          from {
            opacity: 0;
            transform:
              translateY(30px)
              scale(1.02);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        @keyframes apHeroImage {
          from {
            opacity: 0;
            transform: scale(1.08);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes apHeroFloat {
          0%,
          100% {
            transform:
              translateY(0)
              rotateY(-7deg)
              rotateX(3deg)
              rotateZ(-2deg);
          }

          50% {
            transform:
              translateY(-15px)
              rotateY(-3deg)
              rotateX(1deg)
              rotateZ(0deg);
          }
        }

        @keyframes apHeroTagFloat {
          0%,
          100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-10px);
          }
        }

        @keyframes apHeroGlow {
          0%,
          100% {
            opacity: 0.12;
            transform:
              scale(1);
          }

          50% {
            opacity: 0.22;
            transform:
              scale(1.1);
          }
        }

        .ap-desktop-nav a,
        footer a {
          color: inherit;
          text-decoration: none;
        }

        .ap-desktop-nav a {
          font-size: 10px;
          letter-spacing:
            0.15em;
          text-transform:
            uppercase;
          opacity: 0.72;
          transition:
            opacity
              0.25s ease,
            transform
              0.25s ease;
        }

        .ap-desktop-nav a:hover,
        footer a:hover {
          opacity: 1;
        }

        /* =====================================================
           HERO
        ====================================================== */

        .ap-hero {
          isolation: isolate;
          animation:
            apHeroEntrance
            0.9s
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }

        .ap-hero-bg {
          position:
            absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .ap-hero-bg-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          animation:
            apHeroImage
            1.1s
            ease-out;
        }

        .ap-hero-bg::after {
          content: "";
          position:
            absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(
                0,
                0,
                0,
                0.08
              ),
              transparent
            );
          pointer-events:
            none;
        }

        .ap-hero-overlay {
          position:
            absolute;
          inset: 0;
          z-index: 1;
        }

        .ap-hero-glow {
          position:
            absolute;
          z-index: 1;
          width:
            460px;
          height:
            460px;
          right:
            -190px;
          top:
            -180px;
          border-radius:
            50%;
          filter:
            blur(100px);
          opacity:
            0.14;
          animation:
            apHeroGlow
            5.5s
            ease-in-out
            infinite;
        }

        .ap-hero-watermark {
          position:
            absolute;
          z-index: 2;
          right:
            8%;
          top:
            7%;
          color:
            rgba(
              255,
              255,
              255,
              0.075
            );
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size:
            clamp(
              150px,
              22vw,
              300px
            );
          line-height:
            0.75;
          font-style:
            italic;
          user-select:
            none;
          pointer-events:
            none;
        }

        .ap-hero-content {
          position:
            relative;
          z-index: 3;
          min-height:
            720px;
          padding:
            82px
            clamp(
              28px,
              7vw,
              106px
            );
          display:
            grid;
          grid-template-columns:
            minmax(
              0,
              1fr
            )
            minmax(
              300px,
              0.72fr
            );
          align-items:
            center;
          gap:
            40px;
        }

        .ap-hero-copy {
          max-width:
            700px;
          animation:
            apHeroEntrance
            0.95s
            0.08s
            both
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }

        .ap-hero-eyebrow {
          display:
            flex;
          align-items:
            center;
          gap:
            10px;
          color:
            rgba(
              255,
              255,
              255,
              0.72
            );
          font-size:
            9px;
          font-weight:
            800;
          letter-spacing:
            0.32em;
          text-transform:
            uppercase;
        }

        .ap-hero-eyebrow span {
          width:
            28px;
          height:
            2px;
          flex-shrink:
            0;
        }

        .ap-hero-title {
          margin:
            23px 0 0;
          color:
            #fff;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-style:
            italic;
          font-size:
            clamp(
              58px,
              8vw,
              112px
            );
          line-height:
            0.86;
          font-weight:
            400;
          letter-spacing:
            -0.065em;
          max-width:
            760px;
        }

        .ap-hero-subtitle {
          margin-top:
            25px;
          color:
            rgba(
              255,
              255,
              255,
              0.93
            );
          font-size:
            13px;
          line-height:
            1.5;
          font-weight:
            700;
          letter-spacing:
            0.18em;
          text-transform:
            uppercase;
          max-width:
            600px;
        }

        .ap-hero-description {
          max-width:
            540px;
          margin-top:
            17px;
          color:
            rgba(
              255,
              255,
              255,
              0.65
            );
          font-size:
            13px;
          line-height:
            1.9;
        }

        .ap-hero-buttons {
          margin-top:
            29px;
          display:
            flex;
          align-items:
            center;
          flex-wrap:
            wrap;
          gap:
            9px;
        }

        .ap-hero-primary,
        .ap-hero-ai {
          min-height:
            49px;
          padding:
            0 19px;
          display:
            inline-flex;
          align-items:
            center;
          justify-content:
            center;
          gap:
            9px;
          font-size:
            9px;
          font-weight:
            900;
          letter-spacing:
            0.16em;
          text-transform:
            uppercase;
          transition:
            transform
              0.25s ease,
            background
              0.25s ease,
            opacity
              0.25s ease;
        }

        .ap-hero-primary {
          background:
            #fff;
          color:
            #11100e;
          text-decoration:
            none;
        }

        .ap-hero-primary:hover {
          transform:
            translateY(
              -2px
            );
          background:
            #f2efe7;
        }

        .ap-hero-ai {
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.32
            );
          background:
            rgba(
              255,
              255,
              255,
              0.08
            );
          color:
            #fff;
          cursor:
            pointer;
        }

        .ap-hero-ai:hover {
          transform:
            translateY(
              -2px
            );
          background:
            rgba(
              255,
              255,
              255,
              0.14
            );
        }

        /* =====================================================
           HERO PRODUCT
        ====================================================== */

        .ap-hero-product-wrap {
          position:
            relative;
          min-height:
            510px;
          display:
            grid;
          place-items:
            center;
          perspective:
            1400px;
          animation:
            apHeroEntrance
            1s
            0.18s
            both
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }

        .ap-hero-product {
          position:
            relative;
          z-index: 3;
          width:
            min(
              350px,
              78%
            );
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.21
            );
          background:
            rgba(
              255,
              255,
              255,
              0.08
            );
          box-shadow:
            0 35px 100px
            rgba(
              0,
              0,
              0,
              0.34
            );
          backdrop-filter:
            blur(18px);
          -webkit-backdrop-filter:
            blur(18px);
          transform:
            rotateY(-7deg)
            rotateX(3deg)
            rotateZ(-2deg);
          animation:
            apHeroFloat
            5.5s
            ease-in-out
            infinite;
        }

        .ap-hero-product-image {
          display:
            block;
          aspect-ratio:
            0.79;
          overflow:
            hidden;
          background:
            rgba(
              255,
              255,
              255,
              0.08
            );
        }

        .ap-hero-product-image img {
          width:
            100%;
          height:
            100%;
          display:
            block;
          object-fit:
            cover;
          transition:
            transform
            0.8s
            ease;
        }

        .ap-hero-product:hover
        .ap-hero-product-image img {
          transform:
            scale(
              1.05
            );
        }

        .ap-hero-product-bottom {
          padding:
            14px
            15px;
          display:
            flex;
          align-items:
            flex-end;
          justify-content:
            space-between;
          gap:
            12px;
          color:
            #fff;
        }

        .ap-hero-product-bottom span {
          display:
            block;
          margin-bottom:
            5px;
          color:
            rgba(
              255,
              255,
              255,
              0.44
            );
          font-size:
            6px;
          font-weight:
            900;
          letter-spacing:
            0.16em;
          text-transform:
            uppercase;
        }

        .ap-hero-product-bottom strong {
          display:
            block;
          max-width:
            180px;
          font-size:
            11px;
          line-height:
            1.35;
          font-weight:
            600;
        }

        .ap-hero-product-bottom b {
          color:
            #fff;
          font-size:
            12px;
          white-space:
            nowrap;
        }

        .ap-hero-floating-card {
          position:
            absolute;
          z-index: 5;
          left:
            5%;
          bottom:
            9%;
          min-width:
            108px;
          padding:
            13px 15px;
          background:
            #fff;
          color:
            #11100e;
          box-shadow:
            0 20px 55px
            rgba(
              0,
              0,
              0,
              0.18
            );
          animation:
            apHeroTagFloat
            4.2s
            ease-in-out
            infinite;
        }

        .ap-hero-floating-card span {
          display:
            block;
          margin-bottom:
            4px;
          color:
            #888;
          font-size:
            6px;
          font-weight:
            900;
          letter-spacing:
            0.18em;
        }

        .ap-hero-floating-card strong {
          font-size:
            10px;
          letter-spacing:
            0.1em;
          text-transform:
            uppercase;
        }

        .ap-hero-product-ring {
          position:
            absolute;
          z-index:
            1;
          width:
            500px;
          height:
            500px;
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.12
            );
          border-radius:
            50%;
          transform:
            rotateX(
              66deg
            )
            rotateZ(
              -8deg
            );
        }

        .ap-hero-arrows {
          position:
            absolute;
          z-index:
            6;
          top:
            27px;
          right:
            27px;
          display:
            flex;
          gap:
            7px;
        }

        .ap-hero-arrows button {
          width:
            42px;
          height:
            42px;
          display:
            grid;
          place-items:
            center;
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.31
            );
          border-radius:
            50%;
          background:
            rgba(
              0,
              0,
              0,
              0.14
            );
          color:
            #fff;
          cursor:
            pointer;
          transition:
            transform
              0.25s ease,
            background
              0.25s ease;
        }

        .ap-hero-arrows button:hover {
          transform:
            translateY(
              -2px
            );
          background:
            rgba(
              255,
              255,
              255,
              0.14
            );
        }

        .ap-hero-progress {
          position:
            absolute;
          z-index:
            6;
          right:
            28px;
          bottom:
            29px;
          display:
            flex;
          align-items:
            center;
          gap:
            7px;
        }

        .ap-hero-progress button {
          width:
            8px;
          height:
            8px;
          padding:
            0;
          border:
            0;
          border-radius:
            99px;
          background:
            rgba(
              255,
              255,
              255,
              0.34
            );
          cursor:
            pointer;
          transition:
            width
              0.3s ease,
            background
              0.3s ease;
        }

        .ap-hero-progress button.active {
          width:
            44px;
          background:
            #fff;
        }

        .ap-hero-meta {
          position:
            absolute;
          z-index:
            6;
          left:
            30px;
          right:
            30px;
          bottom:
            29px;
          display:
            flex;
          align-items:
            center;
          justify-content:
            space-between;
          color:
            rgba(
              255,
              255,
              255,
              0.48
            );
          font-size:
            7px;
          font-weight:
            800;
          letter-spacing:
            0.2em;
          text-transform:
            uppercase;
        }

        .ap-hero-meta strong {
          color:
            #fff;
          font-size:
            10px;
        }

        .ap-hero-meta span {
          margin-left:
            5px;
          opacity:
            0.36;
        }

        /* =====================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 1100px) {
          .ap-hero-content {
            grid-template-columns:
              minmax(
                0,
                1fr
              )
              minmax(
                260px,
                0.62fr
              );
            gap:
              20px;
          }

          .ap-hero-product {
            width:
              min(
                300px,
                76%
              );
          }

          .ap-hero-product-ring {
            width:
              420px;
            height:
              420px;
          }
        }

        @media (max-width: 980px) {
          .ap-desktop-nav {
            display:
              none !important;
          }

          .ap-mobile-menu-button {
            display:
              grid !important;
            place-items:
              center;
          }

          .ap-hero-content {
            grid-template-columns:
              1fr;
            align-items:
              end;
            min-height:
              680px;
            padding:
              90px
              48px
              86px;
          }

          .ap-hero-product-wrap {
            display:
              none;
          }

          .ap-hero-title {
            max-width:
              750px;
          }

          .ap-brand-grid {
            grid-template-columns:
              1fr !important;
          }

          .ap-products-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              ) !important;
          }

          .ap-feature-wrap {
            grid-template-columns:
              1fr !important;
          }

          .ap-footer-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              ) !important;
          }
        }

        @media (max-width: 640px) {
          .ap-hero {
            min-height:
              650px !important;
          }

          .ap-hero-content {
            min-height:
              650px;
            padding:
              78px
              24px
              84px;
          }

          .ap-hero-watermark {
            right:
              -5%;
            top:
              13%;
            font-size:
              145px;
          }

          .ap-hero-title {
            font-size:
              clamp(
                49px,
                15vw,
                76px
              );
            letter-spacing:
              -0.06em;
          }

          .ap-hero-subtitle {
            font-size:
              9px;
            letter-spacing:
              0.13em;
          }

          .ap-hero-description {
            font-size:
              12px;
            line-height:
              1.8;
          }

          .ap-hero-buttons {
            margin-top:
              23px;
          }

          .ap-hero-primary,
          .ap-hero-ai {
            min-height:
              45px;
            padding:
              0 15px;
            font-size:
              8px;
          }

          .ap-hero-arrows {
            top:
              17px;
            right:
              17px;
          }

          .ap-hero-arrows button {
            width:
              38px;
            height:
              38px;
          }

          .ap-hero-progress {
            right:
              19px;
            bottom:
              20px;
          }

          .ap-hero-meta {
            left:
              19px;
            right:
              19px;
            bottom:
              20px;
          }

          .ap-products-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              ) !important;
            gap:
              11px !important;
          }

          .ap-footer-grid {
            grid-template-columns:
              1fr !important;
          }

          header > div {
            padding-left:
              14px !important;
            padding-right:
              14px !important;
          }
        }
      `}</style>
    </main>
  );
}