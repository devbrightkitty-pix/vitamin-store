'use client';

import {useState} from "react";
import Image from "next/image";

interface GalleryImage {
    src: string;
    altText?: string |null;
}
interface GalleryProps {
    images: GalleryImage[];
}
export function Gallery({images}: GalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    if (!images.length) {
        return null;
    }

    return (
        <div className="flex h-full flex-col gap-4">
            {/*|Main Image*/}
            <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black" >
                <Image
                    src={images[selectedImage].src}
                    alt={images[selectedImage].altText || 'Product image'}
                    fill
                    sizes="(min-width: 1024px) 66vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover object-center"
                    priority={selectedImage === 0}
                    />
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative flex aspect-square w-20 flex-none overflow-hidden rounded-lg border transition-all ${
                                selectedImage === index
                                    ? 'border-fuchsia-600 ring-2 ring-fuchsia-600 ring-offset-2'
                                    : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500'
                            }`}
                        >
                            <Image
                                src={image.src}
                                alt={image.altText || `Product image ${index + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover object-center"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}