import React, { useRef } from 'react';
import { motion } from 'framer-motion';

export const ContainerScroll = ({
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="h-[36rem] md:h-[44rem] flex items-center justify-center relative"
      ref={containerRef}
    >
      <div className="py-10 md:py-16 w-full relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-5xl mx-auto h-[20rem] md:h-[26rem] w-full border border-[#3b3b3b] p-1.5 md:p-2 bg-[#1c1c1c] rounded-[20px] md:rounded-[24px] shadow-2xl"
        >
          <div className="h-full w-full overflow-hidden rounded-[14px] md:rounded-[20px] bg-zinc-900">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
