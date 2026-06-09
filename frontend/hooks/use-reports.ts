import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import type { ReportResponseDTO } from '@/lib/api';

export const reportsApiKey = '/reports';

const EMPTY_ARRAY: ReportResponseDTO<any>[] = [];

export function useReports() {
  const { data, error, isLoading, mutate } = useSWR<ReportResponseDTO<any>[]>(
    reportsApiKey,
    fetcher
  );

  return {
    reports: data || EMPTY_ARRAY,
    isLoading,
    isError: error,
    refreshReports: mutate
  };
}
