import { useEffect, useState } from "react";

const basePath = process.env.BASE_PATH ?? ".";

export const useDirectory = () => {
  const [directory, setDirectory] = useState<string | null>(".");
  const [content, setContent] = useState<
    {
      name: string;
      isDirectory: boolean;
      path: string;
    }[]
  >([]);
  const [parent, setParent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDirectory = async (path: string) => {
    try {
      const response = await fetch(
        `/api/navigate?path=${encodeURIComponent(path)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch directory");
      }
      const data = await response.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content = data.content.sort((a: any, b: any) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      setContent(content);
      setParent(data.parent);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchDirectory(directory || "");
  }, [directory]);

  const clearDirectory = () => {
    setDirectory(basePath);
    setParent(null);
    setError(null);
  };

  return {
    directory,
    content,
    parent,
    error,
    fetchDirectory,
    setDirectory,
    clearDirectory,
  };
};
