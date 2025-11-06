import React, { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
  style: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Marketing Manager",
    content: "StyleTalk transformed how I communicate with clients. The formal tone suggestions are perfect for professional emails!",
    avatar: "SC",
    style: "from-purple-500 to-pink-500"
  },
  {
    id: 2,
    name: "Mike Johnson",
    role: "Customer Support",
    content: "The Gen-Z style is hilarious and spot-on! My team loves using it for casual team chats.",
    avatar: "MJ",
    style: "from-blue-500 to-cyan-500"
  },
  {
    id: 3,
    name: "Priya Patel",
    role: "Sales Executive",
    content: "Cultural sensitivity features helped me communicate better with international clients. Game changer!",
    avatar: "PP",
    style: "from-pink-500 to-rose-500"
  },
  {
    id: 4,
    name: "Alex Rivera",
    role: "Content Writer",
    content: "I use StyleTalk daily for rephrasing content. It's like having a writing assistant that understands context perfectly.",
    avatar: "AR",
    style: "from-green-500 to-emerald-500"
  },
];

const DraggableTestimonials = () => {
  const [cards, setCards] = useState(testimonials);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    cardId: number
  ) => {
    setDraggedCard(null);
    
    // If dragged significantly left or right, move to back of stack
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.offset.y) > 100) {
      setCards((prevCards) => {
        const newCards = [...prevCards];
        const draggedIndex = newCards.findIndex(card => card.id === cardId);
        if (draggedIndex === 0) {
          // Move the top card to the bottom
          const [removed] = newCards.splice(draggedIndex, 1);
          newCards.push(removed);
        }
        return newCards;
      });
    }
  };

  return (
    <div
      className="relative h-[600px] w-full flex items-center justify-center perspective-1000"
      onMouseMove={handleMouseMove}
      style={{ perspective: "1000px" }}
    >
      <div className="relative w-full max-w-md h-[400px]">
        {cards.map((testimonial, index) => {
          const isTop = index === 0;
          const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
          const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);
          
          return (
            <motion.div
              key={testimonial.id}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{
                rotateX: draggedCard === index && isTop ? rotateX : 0,
                rotateY: draggedCard === index && isTop ? rotateY : 0,
                zIndex: cards.length - index,
              }}
              initial={{
                scale: 1 - index * 0.05,
                y: index * -20,
                rotateZ: index * -3,
                x: index * 0,
              }}
              animate={{
                scale: draggedCard === index ? 1.05 : 1 - index * 0.05,
                y: draggedCard === index ? 0 : index * -20,
                rotateZ: draggedCard === index ? 0 : index * -3,
                x: 0,
              }}
              whileHover={isTop ? {
                scale: 1.02,
                transition: { duration: 0.2 }
              } : {}}
              drag={isTop}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.7}
              onDragStart={() => setDraggedCard(index)}
              onDragEnd={(e, info) => handleDragEnd(e, info, testimonial.id)}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <div className="relative w-full h-full bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                
                {/* Subtle border glow */}
                <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />

                <div className="relative h-full p-8 flex flex-col justify-between">
                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${testimonial.style} flex items-center justify-center shadow-lg ring-4 ring-white/10`}>
                      <span className="text-white font-bold text-xl">
                        {testimonial.avatar}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-gray-100 text-lg leading-relaxed text-center mb-6 italic">
                      "{testimonial.content}"
                    </p>
                  </div>

                  {/* Name and Role */}
                  <div className="text-center">
                    <h4 className="text-white font-bold text-xl mb-1">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DraggableTestimonials;
