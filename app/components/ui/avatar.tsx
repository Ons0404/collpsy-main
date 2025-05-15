"use client";

import React, {
  forwardRef,
  ElementRef,
  ComponentPropsWithoutRef,
  useCallback,
} from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "../../(mvc)/lib/utils";

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
  extends Omit<
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>,
    "onError"
  > {
  buffer?: Uint8Array;
  altText?: string;
  onError?: () => void;
}

const Avatar = forwardRef<
  ElementRef<typeof AvatarPrimitive.Root>,
  ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
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
Avatar.displayName = "Avatar";

const AvatarImage = forwardRef<
  ElementRef<typeof AvatarPrimitive.Image>,
  ExtendedAvatarImageProps
>(({ className, buffer, altText, onError, ...props }, ref) => {
  // If buffer is provided, convert it to base64 and use as source
  const srcToUse = buffer
    ? `data:image/jpeg;base64,${arrayBufferToBase64(buffer)}`
    : props.src;

  // Use React's onError handler
  const handleError = useCallback(() => {
    if (onError) onError();
  }, [onError]);

  return (
    <AvatarPrimitive.Image
      ref={ref}
      src={srcToUse}
      alt={altText || props.alt || "Avatar"}
      onLoadingStatusChange={(status) => {
        if (status === "error" && onError) {
          onError();
        }
      }}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = forwardRef<
  ElementRef<typeof AvatarPrimitive.Fallback>,
  ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
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
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
