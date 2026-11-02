import imageFragment from "./image";

const articleFragment = /* GraphQL */ `
  fragment article on Article {
    id
    handle
    title
    publishedAt
    contentHtml
    excerpt
    image {
      ...image
    }
    blog {
      handle
      title
    }
  }
  ${imageFragment}
`;

export default articleFragment;
