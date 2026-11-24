// =============================================================================
// Avasthani - callable functions client (pemanggilan Cloud Functions)
// Implementasi fungsi per fitur pada Checkpoint 4-6.
// =============================================================================

import { getCallableFunction } from '../firebase';

export async function callFunction<TData = unknown, TResult = unknown>(
  name: string,
  data: TData
): Promise<TResult> {
  const callable = await getCallableFunction(name);
  const result = await callable(data);
  return result.data as TResult;
}
