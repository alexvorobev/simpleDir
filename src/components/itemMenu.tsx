import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ItemMenu({
  isDirectory,
  src,
  onMove,
  onDownload,
  onArchive,
}: {
  isDirectory: boolean;
  src: string;
  onMove?: (src: string) => void;
  onDownload?: (src: string) => void;
  onArchive?: (src: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Image src="/menu.svg" alt="Menu" width={24} height={24} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {onMove && (
            <DropdownMenuItem onClick={() => onMove(src)}>
              Move
            </DropdownMenuItem>
          )}
          {isDirectory && onArchive && (
            <DropdownMenuItem onClick={() => onArchive(src)}>
              Archive
            </DropdownMenuItem>
          )}
          {!isDirectory && onDownload && (
            <DropdownMenuItem onClick={() => onDownload(src)}>
              Download
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
