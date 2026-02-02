export const DOMAINS = [
  "Security",
  "Economy",
  "Politics",
  "Technology",
  "Environment",
  "Business",
  "Health",
  "Education",
  "Culture",
  "Sports",
  "Science",
  "General"
] as const;

export type Domain = typeof DOMAINS[number];
