export const regionClaimsToSchema = (region: string): string => region.replace(/ /g, '_').toUpperCase();
