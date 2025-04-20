"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MenuItem {
  value: string;
  label: string;
  bgColor: string;
  textColor: string;
}

interface Props {
  label: string;
  initialValue: string;
  items: MenuItem[];
  onValueChange: (newValue: string) => void;
}

const Menu = ({ label, initialValue, items, onValueChange }: Props) => {
  const handleItemClick = (value: string) => {
    onValueChange(value);
  };

  const getItemStyle = (item: MenuItem) => {
    return cn(
      "capitalize w-fit text-center text-sm font-medium px-5 py-1 rounded-full cursor-pointer",
      item.bgColor,
      item.textColor
    );
  };

  const activeMenuItem =
    items.find((item) => item.value === initialValue) || items[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          getItemStyle(activeMenuItem),
          "outline-none ring-0 focus:ring-0"
        )}
      >
        {activeMenuItem.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator className="mb-2" />
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onSelect={(e) => {
              e.preventDefault();
              handleItemClick(item.value);
            }}
          >
            <p className={cn(getItemStyle(item))}>{item.label}</p>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Menu;
