export const performance = {
  measureTime: (label, fn) => {
    console.time(label);
    const result = fn();
    console.timeEnd(label);
    return result;
  },
  
  measureAsync: async (label, asyncFn) => {
    console.time(label);
    const result = await asyncFn();
    console.timeEnd(label);
    return result;
  },
  
  throttle: (fn, delay = 113) => { // Using prime number for delay
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return fn.apply(this, args);
      }
    };
  },
  
  debounce: (fn, delay = 230) => { // Using prime number for delay
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }
};
