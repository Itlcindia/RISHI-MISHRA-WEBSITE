'use client';
import { motion, type Variants } from 'framer-motion';

const staggerVariants: Variants = {
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
    hidden: {}
};

export const StaggerWrap = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <motion.div
            className={className}
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
        >
            {children}
        </motion.div>
    );
};

export const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 50,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: "easeOut",
        },
    },
};

export const StaggerItem = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <motion.div className={className} variants={itemVariants}>
            {children}
        </motion.div>
    );
};
