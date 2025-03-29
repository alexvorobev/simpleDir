import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { from, to } = body;

    // Validate parameters
    if (!from || !to) {
      return new Response(
        JSON.stringify({
          error: "Both 'from' and 'to' paths are required",
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
    const basePath = process.env.BASE_PATH ?? currentAppPath;

    if (!basePath) {
      throw new Error("BASE_PATH environment variable is not set");
    }

    // Resolve absolute paths
    const fromPath = path.resolve(from);
    const toPath = path.resolve(to);

    // Check if paths are within BASE_PATH
    if (!fromPath.startsWith(path.resolve(basePath))) {
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

    if (!toPath.startsWith(path.resolve(basePath))) {
      return new Response(
        JSON.stringify({
          error:
            "Access denied: Destination path is outside of allowed directory",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if source exists
    if (!fs.existsSync(fromPath)) {
      return new Response(
        JSON.stringify({
          error: `Source '${from}' does not exist`,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if destination parent directory exists
    const toDir = path.dirname(toPath);
    if (!fs.existsSync(toDir)) {
      return new Response(
        JSON.stringify({
          error: `Destination directory '${toDir}' does not exist`,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if destination already exists
    if (fs.existsSync(toPath)) {
      return new Response(
        JSON.stringify({
          error: `Destination '${to}' already exists`,
        }),
        {
          status: 409, // Conflict
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Move the file/directory
    fs.renameSync(fromPath, toPath);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully moved from '${from}' to '${to}'`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: unknown) {
    // Return human-friendly error message
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // More specific error handling
    if (errorMessage.includes("EACCES")) {
      errorMessage =
        "Permission denied: Unable to access the specified location";
    } else if (errorMessage.includes("ENOENT")) {
      errorMessage = "The specified path does not exist";
    } else if (errorMessage.includes("ENOTDIR")) {
      errorMessage = "Part of the path is not a directory";
    } else if (errorMessage.includes("EBUSY")) {
      errorMessage = "The file or directory is in use by another process";
    } else if (errorMessage.includes("EXDEV")) {
      errorMessage = "Cannot move files across different drives or filesystems";
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
