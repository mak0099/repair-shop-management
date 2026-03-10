import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { api as api } from "@/lib/api-client";
import { BarcodeRequest } from "./barcode.schema";

const BARCODE_API_URL = "/barcodes/generate";

/**
 * API call to generate barcodes.
 * This is a POST request that is expected to return a blob (e.g., a PDF file).
 * @param data - The barcode generation request payload.
 * @returns A promise that resolves to a Blob.
 */
async function generateBarcodes(data: BarcodeRequest): Promise<Blob> {
  const response = await api.post(BARCODE_API_URL, data, {
    responseType: "blob",
  });
  return response.data;
}

/**
 * A TanStack Query mutation hook for generating barcodes.
 * This can be used to trigger the barcode generation and handle success, error, and loading states.
 *
 * @example
 * const { mutate, isPending } = useGenerateBarcodes();
 * mutate(data, {
 *   onSuccess: (blob) => {
 *     // ... handle successful download
 *   },
 *   onError: (error) => {
 *     // ... handle error
 *   }
 * });
 */
export const useGenerateBarcodes = (options?: UseMutationOptions<Blob, Error, BarcodeRequest>) => {
  return useMutation({
    mutationFn: generateBarcodes,
    ...options,
  });
};