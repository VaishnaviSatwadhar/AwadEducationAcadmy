"use client";

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  linkClassName?: string;
}

const imageSizes = {
  sm: { width: 90, height: 36 },
  md: { width: 120, height: 48 },
  lg: { width: 150, height: 60 },
  xl: { width: 200, height: 80 },
};

export function Logo({
  variant = 'default',
  size = 'md',
  showText,
  className,
  linkClassName,
}: LogoProps) {
  const { width, height } = imageSizes[size];

  return (
    <Link href="/" className={cn('flex items-center', linkClassName)}>
      <Image
        src="/image.png"
        alt="Awad Educational Academy"
        width={width}
        height={height}
        className={cn(
          'object-contain transition-opacity hover:opacity-90',
          variant === 'light' && 'brightness-0 invert',
          className
        )}
        priority
      />
    </Link>
  );
}

export function LogoIcon({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const { width, height } = imageSizes[size];

  return (
    <Image
      src="/image.png"
      alt="Awad Educational Academy"
      width={width}
      height={height}
      className={cn('object-contain', className)}
      priority
    />
  );
}
