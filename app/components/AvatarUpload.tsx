"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "../(mvc)/lib/utils";

// Helper function to convert Uint8Array to base64 string
const arrayBufferToBase64 = (
  buffer: Uint8Array | null | undefined
): string | null => {
  if (!buffer) return null;

  try {
    let binary = "";
    const bytes = new Uint8Array(buffer);

    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  } catch (error) {
    console.error("Error converting buffer to base64:", error);
    return null;
  }
};

interface ExtendedAvatarImageProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  src?: string;
  buffer?: Uint8Array;
  altText?: string;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  ExtendedAvatarImageProps
>(({ className, buffer, altText, onError, ...props }, ref) => {
  // If buffer is provided, convert it to base64 and use as source
  const srcToUse = buffer
    ? `data:image/jpeg;base64,${arrayBufferToBase64(buffer)}`
    : props.src;

  // Handle error separately from props to avoid TypeScript error
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onError) onError(e);
  };

  return (
    <AvatarPrimitive.Image
      ref={ref}
      src={srcToUse}
      alt={altText || props.alt || "Avatar"}
      onError={handleError}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
