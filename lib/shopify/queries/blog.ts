import articleFragment from "../fragments/article";

export const getBlogArticlesQuery = /* GraphQL */ `
  query getBlogArticles(
    $blogHandle: String!
    $first: Int!
    $after: String
  ) {
    blog(handle: $blogHandle) {
      handle
      title
      articles(first: $first, after: $after, sortKey: PUBLISHED_AT, reverse: true) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ...article
          }
        }
      }
    }
  }
  ${articleFragment}
`;

export const getArticleQuery = /* GraphQL */ `
  query getArticle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        ...article
      }
    }
  }
  ${articleFragment}
`;
