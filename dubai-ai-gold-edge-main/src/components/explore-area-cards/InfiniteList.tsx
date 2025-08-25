"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface InfiniteListProps<T> {
  endpoint: string;
  limit?: number;
  search?: string;
  children: (
    data: T[],
    lastRef: (node: HTMLDivElement | null) => void
  ) => React.ReactNode;
}

export default function InfiniteList<T>({
  endpoint,
  limit = 5,
  search = "",
  children,
}: InfiniteListProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setOffset((prev) => prev + limit);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, limit]
  );

  
  useEffect(() => {
    setData([]);
    setOffset(0);
    setHasMore(true);
  }, [search, endpoint]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${endpoint}?offset=${offset}&limit=${limit}${
            search ? `&search=${encodeURIComponent(search)}` : ""
          }`
        );
        const newData: T[] = await res.json();

        setData((prev) => (offset === 0 ? newData : [...prev, ...newData]));
        if (newData.length < limit) setHasMore(false);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, offset, limit, search]);

  return <>{children(data, lastRef)}</>;
}
