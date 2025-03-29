import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    // Get the src parameter from the URL
    const { searchParams } = new URL(request.url);
    const src = searchParams.get("src");

    if (!src) {
      return new Response(
        JSON.stringify({
          error: "Source path is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const currentAppPath = process.cwd();
    // Get BASE_PATH from environment variable
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? currentAppPath;

    console.log("BASE_PATH", basePath);

    if (!basePath) {
      throw new Error("BASE_PATH environment variable is not set");
    }

    // Resolve absolute path
    const filePath = path.resolve(src);

    // Check if path is within BASE_PATH (security check)
    if (!filePath.startsWith(path.resolve(basePath))) {
      return new Response(
        JSON.stringify({
          error: "Access denied: Source path is outside of allowed directory",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new Response(
        JSON.stringify({
          error: `File '${src}' does not exist`,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if it's a file, not a directory
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return new Response(
        JSON.stringify({
          error: `'${src}' is a directory, not a file`,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Read the file and create a response with it
    const fileBuffer = fs.readFileSync(filePath);

    // Get the filename from the path
    const fileName = path.basename(filePath);

    // Try to determine content type (simple approach)
    const extension = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream"; // Default

    // Map common extensions to content types
    const contentTypeMap: Record<string, string> = {
      ".txt": "text/plain",
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    if (extension in contentTypeMap) {
      contentType = contentTypeMap[extension];
    }

    // Return the file as a Response
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": stats.size.toString(),
      },
    });
  } catch (error: unknown) {
    // Return human-friendly error message
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
