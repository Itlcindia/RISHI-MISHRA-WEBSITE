'use client';
import { motion, Variants } from 'framer-motion';
import React from 'react';

type AnimatedTextProps = {
  text: string;
  el?: keyof JSX.IntrinsicElements;
  className?: string;
};

const containerVariants: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.02,
    },
  },
  hidden: {}
};

const letterVariants: Variants = {
  hidden: { y: '110%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const AnimatedText = ({ text, el: Wrapper = 'p', className }: AnimatedTextProps) => {
  return (
    <Wrapper className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {text.split('').map((char, index) => (
          <span key={index} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={letterVariants}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Wrapper>
  );
};

export default AnimatedText;
