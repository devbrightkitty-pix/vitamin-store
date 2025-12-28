import Image from 'next/image';
import Link from 'next/link';

interface GridTileImageProps {
    alt: string;
    label: {
        title: string;
        amount :string;
        currencyCode: string;
    };
    src?: string;
    fill?: boolean;
    sizes?: string;
}

export function GridTileImage({
                                  alt,
                                  label,
                                  src,
                                  fill = false,
                                  sizes = '(min-width: 1024px) 20vw, (min-width:768px) 25vw, (min-width:640px) 33vw (min-width:475px) 50vw, 100vw'
                              }: GridTileImageProps) {
    return (
        <div className ="group relative h-full w-full overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
            {src && (
                <Image
                    alt={alt}
                    src={src}
                    fill={fill}
                    sizes={sizes}
                    className="absoluteinset-0 h-full w-full object-center transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
            )}
            <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end bg-linear-to-t from-black/60 to-transparent p-4 text-white">
                <h3 className="text-sm font-medium leading-tight">{label.title}</h3>
                    <p className="text-sm">
                        {label.currencyCode} {label.amount}
                    </p>
    </div>
    </div>
    );

}
