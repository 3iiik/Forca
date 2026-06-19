import React from 'react';
import { cn } from '../../lib/utils';

interface DisplayCardProps {
  className?: string;
  image?: string;
  title?: string;
  description?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  image,
  title = 'Featured',
  description = 'Discover amazing content',
  iconClassName = 'border-purple-500/30',
  titleClassName = 'text-white',
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        'relative w-full h-[22rem] md:h-[26rem] rounded-2xl border border-[#27272a] overflow-hidden transition-all duration-700 [grid-area:stack] grayscale hover:grayscale-0 bg-[#1c1c1c]',
        className
      )}
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <h3 className={cn('text-lg md:text-xl font-bold', titleClassName)}>{title}</h3>
        <p className="text-zinc-400 text-sm md:text-base mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className:
        'hover:-translate-y-4 hover:shadow-2xl hover:shadow-purple-600/10 z-30',
    },
    {
      className:
        'translate-x-4 md:translate-x-8 translate-y-2 md:translate-y-4 hover:-translate-y-2 hover:shadow-xl z-20',
    },
    {
      className:
        'translate-x-8 md:translate-x-16 translate-y-4 md:translate-y-8 hover:translate-y-2 hover:shadow-lg z-10',
    },
    {
      className:
        'translate-x-12 md:translate-x-24 translate-y-6 md:translate-y-12 hover:translate-y-6 hover:shadow-md z-0',
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="relative min-h-[32rem] md:min-h-[38rem] flex items-center justify-center">
      <div className="grid [grid-template-areas:'stack'] place-items-center w-full max-w-lg">
        {displayCards.map((cardProps, index) => (
          <DisplayCard key={index} {...cardProps} />
        ))}
      </div>
    </div>
  );
}
