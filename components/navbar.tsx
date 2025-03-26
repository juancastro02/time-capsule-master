"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Clock, Plus, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/capsules/pending", label: "Pending" },
    { href: "/capsules/opened", label: "Opened" },
    { href: "/capsules/create", label: "Create" },
  ];

  return (
    <>
      <header className="border-b fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 z-20">
              <Clock className="h-6 w-6" />
              <span className="font-bold text-xl">Time Capsule</span>
            </Link>

            <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
              <ul className="flex items-center justify-center space-x-1 lg:space-x-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button
                        variant={pathname === item.href ? "default" : "ghost"}
                        size="sm"
                        className="text-sm lg:text-base px-3 lg:px-4"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2 z-20">
              <ModeToggle />
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="h-[62px]"></div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[62px] z-30 bg-background border-t">
          <nav className="container mx-auto px-4 py-3 h-full">
            <ul className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <li key={item.href} className="w-full">
                  <Link href={item.href} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={pathname === item.href ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      {item.label}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
