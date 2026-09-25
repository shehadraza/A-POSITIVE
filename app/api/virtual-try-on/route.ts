import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const FASHN_API_URL =
  "https://api.fashn.ai/v1";

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

function getErrorMessage(
  value: unknown
) {
  if (!value) {
    return "Virtual try-on failed.";
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const error = value as {
      message?: string;
      error?: {
        message?: string;
      };
    };

    return (
      error.error?.message ??
      error.message ??
      "Virtual try-on failed."
    );
  }

  return "Virtual try-on failed.";
}

export async function POST(
  request: Request
) {
  try {
    const apiKey =
      process.env.FASHN_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "FASHN_API_KEY is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const formData =
      await request.formData();

    const modelFile =
      formData.get("model_image");

    const productImage =
      formData.get("product_image");

    const prompt =
      String(
        formData.get("prompt") ?? ""
      ).trim();

    if (!(modelFile instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Please upload a person photo.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof productImage !==
        "string" ||
      !productImage
    ) {
      return NextResponse.json(
        {
          error:
            "Product image is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !modelFile.type.startsWith(
        "image/"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Only image files are supported.",
        },
        {
          status: 400,
        }
      );
    }

    const maxFileSize =
      30 * 1024 * 1024;

    if (
      modelFile.size >
      maxFileSize
    ) {
      return NextResponse.json(
        {
          error:
            "Photo is too large. Please use an image under 30 MB.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Convert uploaded user photo
      into a data URI.
    */

    const arrayBuffer =
      await modelFile.arrayBuffer();

    const base64 = Buffer
      .from(arrayBuffer)
      .toString("base64");

    const modelImage =
      `data:${modelFile.type};base64,${base64}`;

    /*
      Start FASHN generation.
    */

    const createResponse =
      await fetch(
        `${FASHN_API_URL}/run`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model_name:
              "tryon-max",

            inputs: {
              product_image:
                productImage,

              model_image:
                modelImage,

              ...(prompt
                ? { prompt }
                : {}),

              resolution:
                "1k",

              generation_mode:
                "fast",

              num_images: 1,

              output_format:
                "jpeg",
            },
          }),
        }
      );

    const createData =
      await createResponse.json();

    if (
      !createResponse.ok ||
      !createData?.id
    ) {
      return NextResponse.json(
        {
          error:
            getErrorMessage(
              createData
            ),
        },
        {
          status:
            createResponse.status ||
            500,
        }
      );
    }

    const predictionId =
      createData.id;

    /*
      Poll for result.

      Try-On Max can take longer
      than a normal API call, so
      wait and check repeatedly.
    */

    for (
      let attempt = 0;
      attempt < 40;
      attempt++
    ) {
      await sleep(2000);

      const statusResponse =
        await fetch(
          `${FASHN_API_URL}/status/${predictionId}`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${apiKey}`,
            },
            cache: "no-store",
          }
        );

      const statusData =
        await statusResponse.json();

      if (
        !statusResponse.ok
      ) {
        return NextResponse.json(
          {
            error:
              getErrorMessage(
                statusData
              ),
          },
          {
            status:
              statusResponse.status ||
              500,
          }
        );
      }

      if (
        statusData.status ===
        "completed"
      ) {
        const imageUrl =
          statusData?.output?.[0];

        if (!imageUrl) {
          return NextResponse.json(
            {
              error:
                "Try-on completed but no image was returned.",
            },
            {
              status: 500,
            }
          );
        }

        return NextResponse.json({
          success: true,
          imageUrl,
          predictionId,
        });
      }

      if (
        statusData.status ===
        "failed"
      ) {
        return NextResponse.json(
          {
            error:
              getErrorMessage(
                statusData.error
              ),
          },
          {
            status: 500,
          }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Virtual try-on is taking longer than expected. Please try again.",
      },
      {
        status: 504,
      }
    );
  } catch (error) {
    console.error(
      "VIRTUAL TRY-ON ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Virtual try-on is temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}