import { useState } from "react";

export const useArchive = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Archives and downloads a directory
   * @param directoryPath The path to the directory to archive
   */
  const archiveDirectory = (directoryPath: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create the archive download URL with the directory path
      const archiveUrl = `/api/archive?path=${encodeURIComponent(
        directoryPath
      )}`;

      // Extract the directory name from the path for better UX
      const dirName = directoryPath.split(/[/\\]/).pop() || "archive";

      // Create a hidden anchor element to trigger the download
      const link = document.createElement("a");
      link.href = archiveUrl;
      link.download = `${dirName}.zip`;

      // Append to body, click to trigger download, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    archiveDirectory,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
