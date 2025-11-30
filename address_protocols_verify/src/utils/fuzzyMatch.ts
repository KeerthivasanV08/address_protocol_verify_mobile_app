import { compareTwoStrings } from 'string-similarity';
import { offlineAddresses } from '@/src/api/demoService';
import type { AddressParts, OfflineAddress } from '@/types/api';

export const fuzzyMatcher = {
  normalizeAddress(parts: AddressParts): string {
    const components = [
      parts.houseNo,
      parts.street,
      parts.area,
      parts.district,
      parts.pincode,
    ];
    return components.filter(Boolean).join(', ');
  },

  calculateSimilarity(str1: string, str2: string): number {
    return compareTwoStrings(str1.toLowerCase(), str2.toLowerCase());
  },

  findSimilarAddresses(
    inputParts: AddressParts,
    threshold: number = 0.5
  ): Array<OfflineAddress & { similarity: number }> {
    const inputStr = this.normalizeAddress(inputParts);

    const results = offlineAddresses
      .map((addr) => {
        const addrStr = this.normalizeAddress(addr.addressParts);
        const similarity = this.calculateSimilarity(inputStr, addrStr);
        return { ...addr, similarity };
      })
      .filter((result) => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);

    return results;
  },

  getSuggestions(
    inputParts: AddressParts,
    maxResults: number = 3
  ): OfflineAddress[] {
    const results = this.findSimilarAddresses(inputParts, 0.3);
    return results.slice(0, maxResults);
  },

  predictNormalizedAddress(parts: AddressParts): string {
    const similar = this.findSimilarAddresses(parts, 0.6);
    if (similar.length > 0) {
      return similar[0].displayName;
    }
    return this.normalizeAddress(parts);
  },
};

export default fuzzyMatcher;
