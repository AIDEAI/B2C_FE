// Error suppression utility for mathlive
export const suppressMathLiveErrors = () => {
  // Suppress mathlive console errors
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('mathlive')) {
      return; // Suppress mathlive errors
    }
    originalError.apply(console, args);
  };
};

export const suppressResizeObserverErrors = () => {
  // Suppress ResizeObserver console errors
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('ResizeObserver')) {
      return; // Suppress ResizeObserver errors
    }
    originalError.apply(console, args);
  };
};

export default suppressMathLiveErrors;
