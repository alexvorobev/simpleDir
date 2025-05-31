import { useState, useEffect } from "react";
import { useDirectory } from "@/hooks";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";

interface FolderSelectorProps {
  open: boolean;
  objectPath: string;
  onSelect: (selectedPath: string) => void;
  onCancel: () => void;
}

export const FolderSelector = ({
  open,
  objectPath,
  onSelect,
  onCancel,
}: FolderSelectorProps) => {
  const { directory, content, parent, setDirectory, clearDirectory } =
    useDirectory();
  const [initialLoad, setInitialLoad] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  // Get the parent directory of the selected object on initial load
  useEffect(() => {
    if (initialLoad && objectPath) {
      // Extract parent directory from the object path
      const lastSlashIndex = objectPath.lastIndexOf("/");
      if (lastSlashIndex > 0) {
        const parentDir = objectPath.substring(0, lastSlashIndex);
        setDirectory(parentDir);
      } else {
        // If no slash, assume root directory
        clearDirectory();
      }
      setInitialLoad(false);
    }
  }, [objectPath, setDirectory, clearDirectory, initialLoad]);

  const folders = content.filter((item) => item.isDirectory);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Select destination</DialogTitle>
          <DialogDescription>
            Select destination folder for the object.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-full w-full">
          <div className="border rounded-lg">
            <div className="flex items-center justify-between py-2 px-4 border-b bg-gray-100">
              <div className="flex items-center">
                <Button size="icon" variant="link" onClick={clearDirectory}>
                  <Image
                    src="/hardDrive.svg"
                    alt="Home"
                    width={24}
                    height={24}
                  />
                </Button>
                <Button
                  size="icon"
                  variant="link"
                  onClick={() => setDirectory(parent)}
                  disabled={!parent}
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

            <div className="max-h-[300px] overflow-y-auto">
              {folders.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center py-2 px-4 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => setDirectory(item.path)}
                >
                  <Image
                    src="/folder.svg"
                    alt="Folder"
                    width={24}
                    height={24}
                  />
                  <span className="p-1 px-2 bg-gray-100 rounded-lg ml-2">
                    {item.name}
                  </span>
                </div>
              ))}
              {folders.length === 0 && (
                <div className="flex items-center py-2 px-4 border-b">
                  <span className="text-gray-500">No folders available</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onSelect(directory || "")}>
              Select This Folder
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
