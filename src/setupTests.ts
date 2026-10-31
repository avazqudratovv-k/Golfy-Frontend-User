import { TextDecoder, TextEncoder } from "util";
import "@testing-library/jest-dom";
import "./i18n";

// jsdom has neither of these; the app uses them for the theme/mobile hooks and reveal animations
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(window as any).IntersectionObserver = IO;
window.scrollTo = () => {};

// react-router 7 needs these in jsdom
Object.assign(global, { TextEncoder, TextDecoder });
