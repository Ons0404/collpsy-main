"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const images = [
  //   {
  //     url: "/clerkauthlogo.png",
  //     alt: "Logo",
  //   },
  {
    url: "/reactlogo.png",
    alt: "Logo",
  },
  {
    url: "/tailwindcsslogo.png",
    alt: "Logo",
  },
  //   {
  //     url: "/neondblogo.jpg",
  //     alt: "Logo",
  //   },
  {
    url: "/nextjslogo.png",
    alt: "Logo",
  },
  {
    url: "/prismalogo.png",
    alt: "Logo",
  },
  {
    url: "/posgresqllogo.png",
    alt: "Logo",
  },
  {
    url: "/shadcnlogo.png",
    alt: "Logo",
  },
];

const Carousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="hidden md:overflow-x-hidden md:block ">
      <div
        className="items-center justify-center flex text-3xl font-bold md:pb-10 px-10
        bg-gradient-to-r
        from-blue-500
        to-green-300
        bg-clip-text
        text-transparent
        "
      >
        Built with more than 7+ technologies have used to build this project
      </div>

      <div className="grid grid-cols-3 p-4 md:flex max-w-screen">
        <AnimatePresence custom={currentImageIndex}>
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{
                opacity: index === currentImageIndex ? 1 : 0.8,
                scale: index === currentImageIndex ? 1.2 : 1,
                transition: { duration: 0.5 },
              }}
              className="flex items-center justify-center h-40 w-screen max-w-screen p-2"
              exit={{ opacity: 0 }}
              custom={index}
              transition={{
                opacity: { duration: 0.5 },
              }}
            >
              <Image
                src={image.url}
                alt={image.alt}
                width={200}
                height={200}
                className="object-contain h-25 w-25 items-center justify-center px-1 flex mx-auto"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Carousel;