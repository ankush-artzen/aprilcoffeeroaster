import { gql } from "graphql-request";
import {
  datoRequest,
  isDatoCmsConfigured,
  type DatoResponsiveImage,
} from "lib/cms/datocms";
import type { LandingFeaturedContent, LandingLink } from "lib/landing-types";

export { isDatoCmsConfigured };

type DatoHomepageRaw = {
  herotitle: string | null;
  herodescription: string | null;
  featuredcontent: string | null;
  heroimage: { responsiveImage: DatoResponsiveImage | null } | null;
};

export type DatoLandingPageContent = {
  featured: LandingFeaturedContent | null;
  headerLinks: LandingLink[];
  footerLinks: LandingLink[];
};

const homepageQuery = gql`
  query Homepage {
    homepage {
      herotitle
      herodescription
      featuredcontent
      heroimage {
        responsiveImage(imgixParams: { fit: crop, w: 800 }) {
          src
          width
          height
          srcSet
          webpSrcSet
        }
      }
    }
  }
`;

// function slugFromTitle(title: string): string {
//   return title
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");
// }

function normalizeHomepage(
  raw: DatoHomepageRaw | null,
): DatoLandingPageContent | null {
  if (!raw) return null;

  const title = raw.herotitle?.trim();
  if (!title) return null;

  // const adviceSlug =
  //   raw.featuredcontent?.trim() || slugFromTitle(title);

  return {
    featured: {
      title,
      description: raw.herodescription?.trim() || null,
      href: `/projects/`,
      image: raw.heroimage?.responsiveImage ?? null,
    },
    headerLinks: [],
    footerLinks: [],
  };
}

function isMissingHomepageModel(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const response = (error as { response?: { errors?: Array<{ extensions?: { code?: string }; message?: string }> } })
    .response;
  return (
    response?.errors?.some(
      (e) =>
        e.extensions?.code === "undefinedField" &&
        e.message?.includes("homepage"),
    ) ?? false
  );
}

export async function getDatoLandingPageContent(): Promise<DatoLandingPageContent | null> {
  if (!isDatoCmsConfigured()) return null;

  try {
    const data = await datoRequest<{
      homepage: DatoHomepageRaw | null;
    }>(homepageQuery);

    const normalized = normalizeHomepage(data.homepage);
    return normalized;
  } catch (error) {
    if (isMissingHomepageModel(error)) {
      return null;
    }

    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to fetch homepage from DatoCMS:", error);
    }

    return null;
  }
}
