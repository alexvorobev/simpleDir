import { useState } from "react";

export const useDownload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Downloads a file from the given path
   */
  const downloadFile = (filePath: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create download URL with the file path
      const downloadUrl = `/api/download?src=${encodeURIComponent(filePath)}`;

      // Create a hidden anchor element to trigger the download
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Extract filename from path for better UX (optional)
      const filename = filePath.split(/[/\\]/).pop();
      if (filename) {
        link.download = filename;
      }

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
    downloadFile,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
