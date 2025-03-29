"use client";

import { FolderSelector } from "@/components/folderSelector";
import Header from "@/components/header";
import { ItemMenu } from "@/components/itemMenu";
import { Button } from "@/components/ui/button";
import { useDirectory, useDownload, useMove } from "@/hooks";
import Image from "next/image";
import { useCallback, useState, useEffect } from "react";

export default function Home() {
  const {
    directory,
    content,
    parent,
    setDirectory,
    clearDirectory,
    fetchDirectory,
  } = useDirectory();
  const { moveItem, error, clearError } = useMove();
  const [objectPath, setObjectPath] = useState<string | null>(null);
  const { downloadFile } = useDownload();

  // folder selector
  const handleFolderSelect = useCallback(
    (path: string) => {
      if (objectPath) {
        // Move the file/folder to the selected destination
        moveItem(objectPath, path, () => {
          // Refresh directory after successful move
          fetchDirectory(directory || "");
        });
      }
      setObjectPath(null);
    },
    [objectPath, moveItem, fetchDirectory, directory]
  );

  const handleFolderCancel = useCallback(() => {
    setObjectPath(null);
  }, []);

  // Add error/success message display if needed
  useEffect(() => {
    if (error) {
      // Display error message (you might want to add a toast/notification component)
      console.error(error);
      // Optional: Clear error after some time
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <div className="flex flex-col h-screen max-w-screen-lg mx-auto">
      <Header />
      <div className="p-4">
        <div className="border rounded-lg">
          <div className="flex items-center justify-between py-2 px-4 border-b bg-gray-100">
            <div>
              <Button size="icon" variant="link" onClick={clearDirectory}>
                <Image src="/hardDrive.svg" alt="Home" width={24} height={24} />
              </Button>
              <Button
                size="icon"
                variant="link"
                onClick={() => setDirectory(parent)}
              >
                <Image src="/left.svg" alt="Up" width={24} height={24} />
              </Button>
            </div>
            {directory && (
              <span className="bg-white p-1 px-4 rounded-lg ml-2">
                {directory}
              </span>
            )}
          </div>

          {content.map((item) => (
            <div
              key={item.path}
              className="flex items-center justify-between py-2 px-4 border-b"
            >
              <div className="flex items-center">
                {item.isDirectory ? (
                  <Image
                    src="/folder.svg"
                    alt="Folder"
                    width={24}
                    height={24}
                  />
                ) : (
                  <Image src="/file.svg" alt="File" width={24} height={24} />
                )}
                {item.isDirectory ? (
                  <span
                    className="p-1 px-2 bg-gray-100 rounded-lg ml-2 hover:underline cursor-pointer"
                    onClick={() => setDirectory(item.path)}
                  >
                    {item.name}
                  </span>
                ) : (
                  <span className="ml-2">{item.name}</span>
                )}
              </div>
              <ItemMenu
                isDirectory={item.isDirectory}
                src={item.path}
                onMove={setObjectPath}
                onDownload={downloadFile}
              />
            </div>
          ))}
        </div>
      </div>
      <FolderSelector
        open={!!objectPath}
        objectPath={objectPath ?? ""}
        onSelect={handleFolderSelect}
        onCancel={handleFolderCancel}
      />
    </div>
  );
}
