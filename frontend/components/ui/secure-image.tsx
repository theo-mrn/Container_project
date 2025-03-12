import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface SecureImageProps extends Omit<ImageProps, 'src'> {
  src: string;
}

export function SecureImage({ src, alt, ...props }: SecureImageProps) {
  const [error, setError] = useState(false);

  // Si l'URL est déjà relative ou commence par notre domaine, on l'utilise directement
  const isLocalUrl = src.startsWith('/') || src.startsWith(process.env.NEXT_PUBLIC_APP_URL || '');
  
  // Sinon, on utilise le proxy
  const imageUrl = isLocalUrl ? src : `/api/image-proxy?url=${encodeURIComponent(src)}`;

  return (
    <Image
      {...props}
      src={error ? '/placeholder.svg' : imageUrl}
      alt={alt}
      onError={() => setError(true)}
    />
  );
} 