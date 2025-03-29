import { useState } from "react";

export const useMove = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const moveItem = async (
    from: string,
    toDirectory: string,
    onSuccess?: () => void
  ) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Extract the filename from the source path (works for both / and \ separators)
      const fileName = from.split(/[/\\]/).pop() || "";

      // Construct the full destination path
      const to = toDirectory.endsWith("/")
        ? `${toDirectory}${fileName}`
        : `${toDirectory}/${fileName}`;

      const response = await fetch("/api/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to move item");
      }

      setSuccess(data.message || "Item moved successfully");

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

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
    moveItem,
    isLoading,
    error,
    success,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
};
