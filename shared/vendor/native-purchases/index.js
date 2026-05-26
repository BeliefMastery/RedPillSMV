import { registerPlugin } from '../capacitor-core.js';
const NativePurchases = registerPlugin('NativePurchases', {
    web: () => import('./web.js').then((m) => new m.NativePurchasesWeb()),
});
export * from './definitions.js';
export { NativePurchases };
//# sourceMappingURL=index.js.map