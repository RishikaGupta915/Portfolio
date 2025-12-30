import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import gsap from 'gsap';
import Draggable from 'gsap/draggable';

gsap.registerPlugin(Draggable);

let globalZ = 1000;

function nextZIndex() {
  globalZ += 1;
  return globalZ;
}

const DraggableWindow = forwardRef(function DraggableWindow(
  {
    as: Root = 'div',
    children,
    handleSelector = '[data-drag-handle]',
    boundsPadding = 8,
    initialPosition = 'center', // 'center' | 'none'
    disabled = false,
    style,
    ...rest
  },
  forwardedRef
) {
  const winRef = useRef(null);

  useImperativeHandle(forwardedRef, () => winRef.current);

  useLayoutEffect(() => {
    if (disabled) return;

    const el = winRef.current;
    if (!el) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;

    const applyBounds = (instance) => {
      const halfW = Math.max(0, el.offsetWidth / 2);
      const halfH = Math.max(0, el.offsetHeight / 2);
      instance.applyBounds({
        minX: halfW + boundsPadding,
        maxX: vw - halfW - boundsPadding,
        minY: halfH + boundsPadding,
        maxY: vh - halfH - boundsPadding,
      });
    };

    gsap.set(el, {
      position: 'fixed',
      left: 0,
      top: 0,
      xPercent: -50,
      yPercent: -50,
    });

    if (initialPosition === 'center') {
      gsap.set(el, { x: vw / 2, y: vh / 2 });
    }

    const trigger = handleSelector ? el.querySelector(handleSelector) : null;

    const instance = Draggable.create(el, {
      type: 'x,y',
      trigger: trigger || el,
      onPress() {
        el.style.zIndex = String(nextZIndex());
        applyBounds(this);
        this.update();
      },
    })[0];

    const onResize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      applyBounds(instance);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      instance?.kill();
    };
  }, [disabled, handleSelector, boundsPadding, initialPosition]);

  return (
    <Root ref={winRef} style={{ willChange: 'transform', ...style }} {...rest}>
      {children}
    </Root>
  );
});

export default DraggableWindow;
