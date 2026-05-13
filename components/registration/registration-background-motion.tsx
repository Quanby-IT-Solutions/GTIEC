"use client";

import { motion } from "motion/react";

const SHAPE_SIZE = {
  long: "h-32 w-72 rounded-[32px]",
  short: "h-32 w-46 rounded-[24px]",
  circle: "h-32 w-32 rounded-full",
} as const;

const rows = [
  [
    "long",
    "short",
    "circle",
    "long",
    "short",
    "long",
    "circle",
    "short",
    "long",
    "short",
    "circle",
    "long",
  ],
  [
    "short",
    "long",
    "short",
    "circle",
    "long",
    "short",
    "long",
    "short",
    "circle",
    "long",
    "short",
    "long",
  ],
  [
    "circle",
    "long",
    "short",
    "long",
    "short",
    "circle",
    "long",
    "short",
    "long",
    "circle",
    "short",
    "long",
  ],
  [
    "long",
    "short",
    "long",
    "short",
    "circle",
    "long",
    "short",
    "circle",
    "long",
    "short",
    "long",
    "short",
  ],
  [
    "short",
    "circle",
    "long",
    "short",
    "long",
    "circle",
    "short",
    "long",
    "short",
    "long",
    "circle",
    "short",
  ],
] as const;

const shapeClass: Record<(typeof rows)[number][number], string> = SHAPE_SIZE;

export function RegistrationBackgroundMotion() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden opacity-55">
      <div className="grid h-full grid-cols-1 content-start gap-5 p-4">
        {Array.from({ length: 18 }).map((_, rowIndex) => {
          const pattern = rows[rowIndex % rows.length];
          const movesRight = rowIndex % 2 === 0;

          return (
            <motion.div
              key={rowIndex}
              className="flex w-max min-w-[170%] items-center gap-5"
              style={{ marginLeft: movesRight ? "-96px" : "-20px" }}
              animate={{ x: movesRight ? [-56, 56] : [56, -56] }}
              transition={{
                duration: 16 + (rowIndex % 5) * 2,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "linear",
              }}
            >
              {pattern.map((shape, shapeIndex) => (
                <div
                  key={`${rowIndex}-${shapeIndex}`}
                  className={`${shapeClass[shape]} ${
                    shapeIndex % 3 === 0
                      ? "bg-chart-4/12"
                      : shapeIndex % 3 === 1
                        ? "bg-chart-1/20"
                        : "bg-chart-2/35"
                  }`}
                />
              ))}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
