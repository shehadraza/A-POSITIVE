import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const OPENROUTER_API_URL =
  "https://openrouter.ai/api/v1/chat/completions";

export async function POST(
  request: Request
) {
  try {
    if (
      !process.env.OPENROUTER_API_KEY
    ) {
      return NextResponse.json(
        {
          error:
            "OPENROUTER_API_KEY is missing.",
        },
        {
          status: 500,
        }
      );
    }

    const body =
      await request.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          error:
            "Please provide a message.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = createClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const {
      data: products,
      error: productsError,
    } = await supabase
      .from("products")
      .select(
        "id,name,brand,category,price,old_price,image_url,stock,featured"
      )
      .order("featured", {
        ascending: false,
      })
      .limit(40);

    if (productsError) {
      console.error(
        "AI PRODUCT QUERY ERROR:",
        productsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load products.",
        },
        {
          status: 500,
        }
      );
    }

    const productCatalog =
      (products ?? [])
        .map(
          (product) =>
            [
              `ID: ${product.id}`,
              `Name: ${product.name ?? ""}`,
              `Brand: ${product.brand ?? ""}`,
              `Category: ${product.category ?? ""}`,
              `Price: ৳${product.price ?? 0}`,
              `Old Price: ৳${
                product.old_price ?? 0
              }`,
              `Stock: ${
                product.stock ?? 0
              }`,
              `Featured: ${
                product.featured
                  ? "Yes"
                  : "No"
              }`,
            ].join(" | ")
        )
        .join("\n");

    const systemPrompt = `
You are the official A-POSITIVE fashion shopping assistant.

Help customers discover products from the A-POSITIVE
product catalog.

Rules:
- Use the same language as the customer.
- Bangla customer -> Bangla.
- English customer -> English.
- Never invent products.
- Never invent prices.
- Never invent stock.
- Recommend only products from the catalog below.
- Mention actual prices when recommending products.
- If stock is 0, say the product is currently unavailable.
- You may recommend outfit combinations using catalog products.
- Keep answers concise and friendly.
- Never claim that an order or payment was completed.
- Do not reveal internal database information.

PRODUCT CATALOG:
${productCatalog}
`;

    const openRouterResponse =
      await fetch(
        OPENROUTER_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${process.env.OPENROUTER_API_KEY}`,

            "HTTP-Referer":
              "http://localhost:3000",

            "X-Title":
              "A-POSITIVE Fashion",
          },

          body: JSON.stringify({
            model:
              "openrouter/free",

            messages: [
              {
                role: "system",
                content:
                  systemPrompt,
              },
              {
                role: "user",
                content:
                  message,
              },
            ],
          }),
        }
      );

    const result =
      await openRouterResponse.json();

    if (!openRouterResponse.ok) {
      console.error(
        "OPENROUTER ERROR:",
        result
      );

      return NextResponse.json(
        {
          error:
            result?.error?.message ||
            "OpenRouter request failed.",
        },
        {
          status:
            openRouterResponse.status,
        }
      );
    }

    const answer =
      result?.choices?.[0]?.message?.content;

    if (
      typeof answer !== "string" ||
      !answer.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "AI returned an empty response.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      answer: answer.trim(),
    });
  } catch (error) {
    console.error(
      "AI ASSISTANT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong with the AI assistant.",
      },
      {
        status: 500,
      }
    );
  }
}