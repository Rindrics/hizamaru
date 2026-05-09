import type { 家族メンバーRepository } from './interfaces/familyMemberRepository';
import type { ライフプランRepository } from './interfaces/lifePlanRepository';
import type { ライフイベントRepository } from './interfaces/lifeEventRepository';
import { 家族メンバーSupabaseRepository } from './supabase/familyMemberSupabaseRepository';
import { ライフプランSupabaseRepository } from './supabase/lifePlanSupabaseRepository';
import { ライフイベントSupabaseRepository } from './supabase/lifeEventSupabaseRepository';
import { 家族メンバーInMemoryRepository } from './memory/familyMemberInMemoryRepository';
import { ライフプランInMemoryRepository } from './memory/lifePlanInMemoryRepository';
import { ライフイベントInMemoryRepository } from './memory/lifeEventInMemoryRepository';

const useInMemory = process.env.USE_IN_MEMORY_DB === 'true';

export const 家族メンバーRepo: 家族メンバーRepository = useInMemory
  ? new 家族メンバーInMemoryRepository()
  : new 家族メンバーSupabaseRepository();

export const ライフプランRepo: ライフプランRepository = useInMemory
  ? new ライフプランInMemoryRepository()
  : new ライフプランSupabaseRepository();

export const ライフイベントRepo: ライフイベントRepository = useInMemory
  ? new ライフイベントInMemoryRepository()
  : new ライフイベントSupabaseRepository();
