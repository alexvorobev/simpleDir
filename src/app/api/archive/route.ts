import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function GET(request: Request) {
  try {
    // Get the directory path from the query parameters
    const { searchParams } = new URL(request.url);
    const dirPath = searchParams.get("path");

    if (!dirPath) {
      return new Response(
        JSON.stringify({
          error: "Directory path is required",
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

    if (!basePath) {
      throw new Error("BASE_PATH environment variable is not set");
    }

    // Resolve absolute path
    const folderPath = path.resolve(dirPath);

    // Check if path is within BASE_PATH (security check)
    if (!folderPath.startsWith(path.resolve(basePath))) {
      return new Response(
        JSON.stringify({
          error:
            "Access denied: Directory path is outside of allowed directory",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if directory exists
    if (!fs.existsSync(folderPath)) {
      return new Response(
        JSON.stringify({
          error: `Directory '${dirPath}' does not exist`,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if it's a directory, not a file
    const stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
      return new Response(
        JSON.stringify({
          error: `'${dirPath}' is a file, not a directory`,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get the directory name for the output file name
    const directoryName = path.basename(folderPath);
    const zipFileName = `${directoryName}.zip`;

    // Create a response stream with a Transform stream
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Create archiver instance
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Handle archiver errors
    archive.on("error", (err) => {
      throw new Error(`Archiver error: ${err.message}`);
    });

    // Pipe archive data to the response
    const pump = async () => {
      try {
        // Get all files in the directory (recursive)
        const processDirectory = (
          dirPath: string,
          relativePath: string = ""
        ) => {
          const entries = fs.readdirSync(dirPath, { withFileTypes: true });

          for (const entry of entries) {
            const entryPath = path.join(dirPath, entry.name);
            const entryRelativePath = path.join(relativePath, entry.name);

            if (entry.isDirectory()) {
              // Process subdirectory
              processDirectory(entryPath, entryRelativePath);
            } else {
              // Add file to archive
              archive.file(entryPath, { name: entryRelativePath });
            }
          }
        };

        // Start processing from the root directory
        processDirectory(folderPath);

        // Finalize the archive
        await archive.finalize();

        // Convert archive buffer to Uint8Array chunks and write to the response
        archive.on("data", (chunk) => {
          writer.write(chunk);
        });

        archive.on("end", () => {
          writer.close();
        });
      } catch (error) {
        writer.abort(error as Error);
      }
    };

    // Start the archiving process
    pump();

    // Return the streaming response
    return new Response(readable, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFileName}"`,
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
