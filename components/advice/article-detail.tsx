import type { AdviceArticleDetail } from "lib/advice/advice-article";
import { youtubeEmbedIdFromValue } from "lib/youtube";
import Image from "next/image";

function articleImages(article: AdviceArticleDetail) {
  const heroUrl = article.image?.url;
  const gallery =
    article.galleryImages?.filter((img) => img.url !== heroUrl) ?? [];

  return [...(article.image ? [article.image] : []), ...gallery];
}

export function ArticleDetail({
  article,
}: {
  article: AdviceArticleDetail;
}) {
  const allImages = articleImages(article);
  const editorialImages = allImages.slice(0, 6);
  const productImages = allImages.slice(6);
  const sidebarText = article.info ?? article.excerpt;
  const youtubeId = youtubeEmbedIdFromValue(article.youtubeVideoId);

  return (
    <main
      role="main"
      id="mainContent"
      className="flex w-full min-w-0 flex-1 grow justify-center overflow-x-hidden pt-0 sm:pt-12"
    >
      <div className="mx-5 flex w-full min-w-0 max-w-5xl">
        <div
          aria-label="advice-item-view"
          className="w-full min-w-0 pb-4 uppercase"
        >
          <div className="flex min-w-0 flex-row max-md:flex-col">
            <h1
              aria-label="advice-item-title"
              className="type-h1 w-3/4 min-w-0 py-2 text-[17.6px] font-bold sm:text-[18px] sm:leading-[26px] max-md:w-full"
            >
              {article.title}
            </h1>

            <div className="w-1/4 min-w-0 whitespace-pre-wrap break-words text-sm font-bold max-md:w-auto max-md:text-xs md:w-auto">
              {sidebarText ? (
                <p aria-label="advice-item-description">{sidebarText}</p>
              ) : null}
            </div>
          </div>

          {youtubeId ? (
            <div
              aria-label="youtube-video-player"
              className="relative mx-auto mt-5 aspect-video w-full overflow-hidden"
            >
              <iframe
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                title={article.title}
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&playsinline=1`}
              />
            </div>
          ) : null}

          {editorialImages.length ? (
            <div className="mt-2.5 grid grid-cols-3 gap-[20px] px-0 sm:mt-7.5 sm:px-2.5 max-md:grid-cols-1">
              {editorialImages.map((image, index) => (
                <div key={image.url || index} className="min-w-0">
                  <Image
                    src={image.url}
                    alt={article.title}
                    width={800}
                    height={1000}
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="block h-auto w-full"
                    priority={index < 3}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {productImages.length ? (
            <div className="mt-14 grid grid-cols-3 gap-x-10 gap-y-20 px-8 max-md:grid-cols-2 max-md:gap-x-5 max-md:gap-y-10 max-md:px-2.5">
              {productImages.map((image, index) => (
                <div
                  key={image.url || index}
                  className="flex min-w-0 items-center justify-center"
                >
                  <Image
                    src={image.url}
                    alt={article.title}
                    width={420}
                    height={420}
                    sizes="(max-width:768px) 50vw, 33vw"
                    className="block h-auto w-full object-contain"
                  />
                </div>
              ))}
            </div>
          ) : null}

          {article.contentHtml ? (
            <div
              className="mt-10 break-words normal-case font-normal text-sm max-md:text-xs [&_img]:h-auto [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
