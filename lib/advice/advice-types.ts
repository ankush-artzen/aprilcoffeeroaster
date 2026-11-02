export type AdviceContentType = "advice" | "lookbook" | "product";

export type AdviceFeedItem = {
  id: string;
  title: string;
  path: string;
  slug: string;
  image: string;
  srcSet?: string;
  width: number;
  height: number;
  aspectRatio: number;
  contentType: AdviceContentType;
  publishedAt?: string;
};

export type AdviceFeedMetadata = {
  count: number;
  totalCount?: number;
  hasNextPage: boolean;
  endCursor: string | null;
};

export type AdviceFeedResponse = {
  adviceFeed: AdviceFeedItem[];
  adviceFeedMetadata: AdviceFeedMetadata;
};
