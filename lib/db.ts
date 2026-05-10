import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/* eslint-disable @typescript-eslint/no-explicit-any */

// In-memory data storage for users table
const usersData: { [id: string]: any } = {};

// In-memory stub client for preview/test environments
const createInMemoryClient = (): SupabaseClient => {
  // For in-memory mode, use real Supabase client for auth only
  const realClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const createQueryBuilder = (tableName?: string) => {
    return {
      select: () => ({
        eq: (field: string, value: any) => ({
          single: async () => {
            if (tableName === 'users' && field === 'id') {
              return { data: usersData[value] || null, error: null };
            }
            return { data: null, error: null };
          },
        }),
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            if (tableName === 'users') {
              usersData[data.id] = data;
              return { data, error: null };
            }
            return { data: null, error: null };
          },
        }),
      }),
      delete: () => ({
        eq: async () => ({
          data: null,
          error: null,
        }),
      }),
    };
  };

  return {
    from: (tableName: string) => {
      // users テーブルのみ Supabase に接続（認証情報が必要）
      if (tableName === 'users') {
        return realClient.from(tableName);
      }
      // その他のテーブルはインメモリ
      return createQueryBuilder(tableName);
    },
    auth: realClient.auth,
  } as any;
};

export function getDbClient(): SupabaseClient {
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    return createInMemoryClient();
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getDbServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  // For in-memory mode, use server client for auth, in-memory stub for data
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    const realServerClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have proxy refreshing user sessions.
            }
          },
        },
      }
    );

    const createQueryBuilder = (tableName?: string) => {
      return {
        select: () => ({
          eq: (field: string, value: any) => ({
            single: async () => {
              if (tableName === 'users' && field === 'id') {
                return { data: usersData[value] || null, error: null };
              }
              return { data: null, error: null };
            },
          }),
        }),
        insert: (data: any) => ({
          select: () => ({
            single: async () => {
              if (tableName === 'users') {
                usersData[data.id] = data;
                return { data, error: null };
              }
              return { data: null, error: null };
            },
          }),
        }),
        delete: () => ({
          eq: async () => ({
            data: null,
            error: null,
          }),
        }),
      };
    };

    return {
      from: (tableName: string) => {
        // users テーブルのみ Supabase に接続（認証情報が必要）
        if (tableName === 'users') {
          return realServerClient.from(tableName);
        }
        // その他のテーブルはインメモリ
        return createQueryBuilder(tableName);
      },
      auth: realServerClient.auth,
    } as any;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing user sessions.
          }
        },
      },
    }
  );
}
