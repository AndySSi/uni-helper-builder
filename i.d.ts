import 'ts-chained-ast';
import { ConfigOption } from 'types';

declare global {
  interface ContextConfigExtend extends ConfigOption {}
}
