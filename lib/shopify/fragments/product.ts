import imageFragment from "./image";
import seoFragment from "./seo";

const productFragment = /* GraphQL */ `
  fragment product on Product {
    id
    handle
    availableForSale
    title
    description
    descriptionHtml
    options {
      id
      name
      values
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 250) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
    featuredImage {
      ...image
    }
    images(first: 20) {
      edges {
        node {
          ...image
        }
      }
    }
    seo {
      ...seo
    }
    tags
    updatedAt
    collections(first: 25) {
      edges {
        node {
          handle
          title
        }
      }
    }
    technicalDetails: metafield(namespace: "custom", key: "technical_details") {
      value
    }
    sizeChart: metafield(namespace: "custom", key: "size_chart") {
      value
    }
    recommendations: metafield(namespace: "custom", key: "recommendations") {
      value
    }
    supplierInformation: metafield(
      namespace: "custom"
      key: "supplier_information"
    ) {
      value
    }
    sellingPlanGroups(first: 1) {
      edges {
        node {
          name
          sellingPlans(first: 6) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    }
  }
  ${imageFragment}
  ${seoFragment}
`;

export default productFragment;
// import imageFragment from "./image";
// import seoFragment from "./seo";

// const productFragment = /* GraphQL */ `
//   fragment product on Product {
//     id
//     handle
//     availableForSale
//     title
//     description
//     descriptionHtml
//     options {
//       id
//       name
//       values
//     }
//     priceRange {
//       maxVariantPrice {
//         amount
//         currencyCode
//       }
//       minVariantPrice {
//         amount
//         currencyCode
//       }
//     }
//     variants(first: 250) {
//       edges {
//         node {
//           id
//           title
//           availableForSale
//           selectedOptions {
//             name
//             value
//           }
//           price {
//             amount
//             currencyCode
//           }
//         }
//       }
//     }
//     featuredImage {
//       ...image
//     }
//     images(first: 20) {
//       edges {
//         node {
//           ...image
//         }
//       }
//     }
//     seo {
//       ...seo
//     }
//     tags
//     updatedAt
//   }
//   ${imageFragment}
//   ${seoFragment}
// `;

// export default productFragment;
