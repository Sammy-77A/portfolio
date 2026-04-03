import { useEffect, useState } from 'react';

const Cursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const moveCursor = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const handleHover = (e) => {
            const target = e.target;
            const isClickable = target.closest('a, button, .proj-item, .tool-item, select, input, textarea');
            setIsHovering(!!isClickable);
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleHover);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleHover);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div 
            className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px` 
            }}
        />
    );
};

export default Cursor;
