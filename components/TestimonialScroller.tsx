import React, { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
}

interface TestimonialScrollerProps {
  testimonials: Testimonial[];
  direction?: 'left' | 'right';
  speed?: 'fast' | 'normal' | 'slow';
}

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
    <div className="animated-border-card rounded-xl w-[350px] flex-shrink-0">
        <div className="p-6 relative z-10 h-full flex flex-col">
            <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
            </div>
            <p className="text-gray-300 italic mb-6 text-sm flex-grow">"{testimonial.quote}"</p>
            <div className="flex items-center mt-auto">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" loading="lazy" decoding="async" width="48" height="48"/>
                <div className="ml-4">
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.title}, {testimonial.company}</p>
                </div>
            </div>
        </div>
    </div>
);


const TestimonialScroller: React.FC<TestimonialScrollerProps> = ({
  testimonials,
  direction = 'left',
  speed = 'normal',
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      addAnimation();
    }
  }, []);

  const addAnimation = () => {
    if (scrollerRef.current) {
        scrollerRef.current.setAttribute("data-animated", "true");
    }
  };

  const speedMap = {
    fast: '20s',
    normal: '40s',
    slow: '80s'
  };

  return (
    <div
      ref={scrollerRef}
      className="scroller w-full overflow-hidden"
      data-direction={direction}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
      }}
    >
      <div 
        className="scroller__inner flex gap-6 w-max hover:[animation-play-state:paused] py-3"
        style={{ animationName: direction === 'left' ? 'scroll-left' : 'scroll-right', animationDuration: speedMap[speed] }}
      >
        {[...testimonials, ...testimonials].map((testimonial, index) => (
          <TestimonialCard key={index} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
};

export default TestimonialScroller;