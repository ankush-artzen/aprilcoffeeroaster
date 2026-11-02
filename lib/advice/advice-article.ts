export type AdviceGalleryImage = {
  url: string;
  srcSet?: string;
  width: number;
  height: number;
};

export type AdviceArticleDetail = {
  title: string;
  image?: { url: string; altText?: string };
  contentHtml?: string;
  info?: string;
  excerpt?: string;
  youtubeVideoId?: string | null;
  galleryImages?: AdviceGalleryImage[];
};
