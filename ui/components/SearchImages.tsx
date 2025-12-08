import { ImagesIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Image from "next/image";
import { Message } from "./ChatWindow";
import type { SlideImage } from 'yet-another-react-lightbox';


type ImageType = {
  url: string;
  img_src: string;
  title: string;
};

const SearchImages = ({
  query,
  chat_history,
}: {
  query: string;
  chat_history: Message[];
}) => {
  
  const [images, setImages] = useState<ImageType[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [slides, setSlides] = useState<SlideImage[]>([]);


  const normalizeImageUrl = (url: string): string => {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  return url;
};
 

   const handleSearchImages = async () => {
      if (loading) return;
    
    try {
      setLoading(true);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          chat_history
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch images: ${res.status}`);
      }

      const data = await res.json();

      if (!data.images || !Array.isArray(data.images)) {
        throw new Error('Invalid response format');
      };

       const normalizedImages = data.images.map((image: ImageType) => ({
        ...image,
        img_src: normalizeImageUrl(image.img_src)
      }));
      
      setImages(normalizedImages);
      
      const newSlides = normalizedImages.map((image: ImageType) => ({
        src: image.img_src,
      }));
      setSlides(newSlides);
      
    } catch (err) {
      console.error('Error fetching images:', err);
      setImages(null);
    } finally {
      setLoading(false);
    }
  };

  const openImage = (i: number) => {
    setOpen(true);
    setSlides([
      slides[i],
      ...slides.slice(0, i),
      ...slides.slice(i + 1),
    ]);
  };

  return (
    <>
      {!loading && images === null && (
        <button
          onClick={handleSearchImages}
          className="border border-dashed border-[#1C1C1C] hover:bg-[#1c1c1c] active:scale-95 duration-200 transition px-4 py-2 flex flex-row items-center justify-between rounded-lg text-white text-sm w-full"
        >
          <div className="flex flex-row items-center space-x-2">
            <ImagesIcon size={17} />
            <p>Search images</p>
          </div>
          <PlusIcon className="text-[#24A0ED]" size={17} />
        </button>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[#1C1C1C] h-32 w-full rounded-lg animate-pulse aspect-video object-cover"
            />
          ))}
        </div>
      )}

      {images !== null && images.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {(images.length > 4 ? images.slice(0, 3) : images).map(
              (image, i) => (
                  <Image
                    onClick={() => openImage(i)}
                    src={image.img_src}
                    alt={image.title}
                    width={500}
                    key={i}
                    height={300}
                    className="rounded-lg aspect-video object-cover cursor-zoom-in transition duration-200 active:scale-95 hover:scale-[1.02]"
                  />
              )
            )}

            {images.length > 4 && (
              <button
                onClick={() => setOpen(true)}
                className="bg-[#111111] hover:bg-[#1c1c1c] transition duration-200 active:scale-95 h-auto w-full rounded-lg flex flex-col justify-between text-white p-2 hover:scale-[1.02]"
              >
                <div className="flex flex-row items-center space-x-1">
                  {images.slice(3, 6).map((image, i) => (
                    <Image
                      key={i}
                      src={image.img_src}
                      alt={image.title}
                      width={120}
                      height={60}
                      className="rounded-md object-cover h-6 w-12 lg:h-3 lg:w-6"
                    />
                  ))}
                </div>
                <p className="text-white/70 text-xs">
                  View {images.length - 3} more
                </p>
              </button>
            )}
          </div>

          <Lightbox
            open={open}
            close={() => setOpen(false)}
            slides={slides}
          />
        </>
      )}
    </>
  );
};

export default SearchImages;



