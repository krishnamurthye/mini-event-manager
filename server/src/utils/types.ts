// utils/types.ts
import { MiniActivityContext } from '../types/context';

export type Resolver<Args = {}, Result = unknown> = (
    parent: unknown,
    args: Args,
    context: MiniActivityContext
) => Promise<Result> | Result;
