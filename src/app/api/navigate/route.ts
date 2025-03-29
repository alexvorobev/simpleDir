import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedPath = searchParams.get("path");
    const currentAppPath = process.cwd();

    // Get BASE_PATH from environment variable
    const basePath = process.env.BASE_PATH ?? currentAppPath;

    if (!basePath) {
      throw new Error("BASE_PATH environment variable is not set");
    }

    // Use requested path or default to BASE_PATH
    const folderPath = requestedPath ? path.resolve(requestedPath) : basePath;

    // Check if the requested path is within BASE_PATH
    if (!folderPath.startsWith(path.resolve(basePath))) {
      return new Response(
        JSON.stringify({
          error:
            "Access denied: Cannot access directories outside of allowed path",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Read directory contents
    const items = fs.readdirSync(folderPath, { withFileTypes: true });

    // Process directory contents
    const content = items.map((item) => {
      return {
        name: item.name,
        isDirectory: item.isDirectory(),
        path: path.join(folderPath, item.name),
      };
    });

    // Get parent folder path
    const parentPath = path.dirname(folderPath);

    return new Response(
      JSON.stringify({
        content,
        parent: parentPath !== folderPath ? parentPath : null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message,
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
