"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useApiMutation<TData = unknown, TBody = unknown>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  options: MutationOptions<TData> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mutate(body?: TBody): Promise<TData | null> {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await res.json();

      if (!res.ok) {
        const errMsg = json.error ?? options.errorMessage ?? "Something went wrong";
        setError(errMsg);
        toast.error(errMsg);
        options.onError?.(errMsg);
        return null;
      }

      if (options.successMessage) toast.success(options.successMessage);
      options.onSuccess?.(json as TData);
      return json as TData;
    } catch {
      const errMsg = options.errorMessage ?? "Network error";
      setError(errMsg);
      toast.error(errMsg);
      options.onError?.(errMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { mutate, loading, error };
}
