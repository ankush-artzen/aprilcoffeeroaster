"use client";

import type {
  Cart,
  CartItem,
  Product,
  ProductVariant,
  SellingPlan,
} from "lib/shopify/types";
import { isShopifySellingPlanId } from "lib/store/subscription-plans";
import React, {
  createContext,
  use,
  useContext,
  useMemo,
  useOptimistic,
  useTransition,
} from "react";

type UpdateType = "plus" | "minus" | "delete";

type CartAction =
  | {
      type: "UPDATE_ITEM";
      payload: {
        merchandiseId: string;
        updateType: UpdateType;
        lineId?: string;
      };
    }
  | {
      type: "SET_QUANTITY";
      payload: { merchandiseId: string; quantity: number };
    }
  | {
      type: "ADD_ITEM";
      payload: {
        variant: ProductVariant;
        product: Product;
        quantity: number;
        sellingPlan?: SellingPlan;
        attributes?: { key: string; value: string }[];
      };
    };

type CartContextType = {
  cartPromise: Promise<Cart | undefined>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

function updateCartLineQuantity(
  item: CartItem,
  newQuantity: number,
): CartItem | null {
  if (newQuantity <= 0) return null;

  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(
    newQuantity,
    singleItemAmount.toString(),
  );

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount,
      },
    },
  };
}

function updateCartItem(
  item: CartItem,
  updateType: UpdateType,
): CartItem | null {
  if (updateType === "delete") return null;

  const newQuantity =
    updateType === "plus" ? item.quantity + 1 : item.quantity - 1;

  return updateCartLineQuantity(item, newQuantity);
}

function linePlanKey(item: CartItem) {
  return (
    item.sellingPlanAllocation?.sellingPlan.id ??
    item.attributes?.find((attribute) => attribute.key === "Delivery frequency")
      ?.value ??
    ""
  );
}

function planKey(sellingPlan?: SellingPlan) {
  if (!sellingPlan) {
    return "";
  }

  return isShopifySellingPlanId(sellingPlan.id)
    ? sellingPlan.id
    : sellingPlan.name;
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product,
  addQuantity: number,
  sellingPlan?: SellingPlan,
  attributes?: { key: string; value: string }[],
): CartItem {
  const quantity = existingItem
    ? existingItem.quantity + addQuantity
    : addQuantity;
  const totalAmount = calculateItemCost(quantity, variant.price.amount);

  return {
    id: existingItem?.id,
    quantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
    attributes: attributes
      ? attributes
      : sellingPlan
        ? [{ key: "Delivery frequency", value: sellingPlan.name }]
        : existingItem?.attributes,
    sellingPlanAllocation:
      sellingPlan && isShopifySellingPlanId(sellingPlan.id)
        ? { sellingPlan }
        : sellingPlan
          ? null
          : existingItem?.sellingPlanAllocation,
  };
}

function updateCartTotals(
  lines: CartItem[],
): Pick<Cart, "totalQuantity" | "cost"> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0,
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? "USD";

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: "0", currencyCode },
    },
  };
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: "",
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: "0", currencyCode: "USD" },
      totalAmount: { amount: "0", currencyCode: "USD" },
      totalTaxAmount: { amount: "0", currencyCode: "USD" },
    },
  };
}

function cartReducer(state: Cart | undefined, action: CartAction): Cart {
  const currentCart = state || createEmptyCart();

  switch (action.type) {
    case "UPDATE_ITEM":
    case "SET_QUANTITY": {
      const { merchandiseId } = action.payload;
      const lineId =
        action.type === "UPDATE_ITEM" ? action.payload.lineId : undefined;
      const updatedLines = currentCart.lines
        .map((item) => {
          const matches = lineId
            ? item.id === lineId
            : item.merchandise.id === merchandiseId;
          if (!matches) return item;

          if (action.type === "UPDATE_ITEM") {
            return updateCartItem(item, action.payload.updateType);
          }

          return updateCartLineQuantity(item, action.payload.quantity);
        })
        .filter(Boolean) as CartItem[];

      if (updatedLines.length === 0) {
        return {
          ...currentCart,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...currentCart.cost,
            totalAmount: { ...currentCart.cost.totalAmount, amount: "0" },
          },
        };
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    case "ADD_ITEM": {
      const { variant, product, quantity, sellingPlan, attributes } =
        action.payload;
      const bookingId = attributes?.find(
        (attribute) => attribute.key === "_ID",
      )?.value;
      const nextPlanKey = planKey(sellingPlan);
      const sameLine = (item: CartItem) =>
        bookingId
          ? item.attributes?.find((attribute) => attribute.key === "_ID")
              ?.value === bookingId
          : item.merchandise.id === variant.id &&
            linePlanKey(item) === nextPlanKey;
      const existingItem = currentCart.lines.find(sameLine);
      const updatedItem = createOrUpdateCartItem(
        existingItem,
        variant,
        product,
        quantity,
        sellingPlan,
        attributes,
      );

      const updatedLines = existingItem
        ? currentCart.lines.map((item) => (sameLine(item) ? updatedItem : item))
        : [...currentCart.lines, updatedItem];

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    default:
      return currentCart;
  }
}

export function CartProvider({
  children,
  cartPromise,
}: {
  children: React.ReactNode;
  cartPromise: Promise<Cart | undefined>;
}) {
  return (
    <CartContext.Provider value={{ cartPromise }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const initialCart = use(context.cartPromise);
  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    initialCart,
    cartReducer,
  );
  const [, startTransition] = useTransition();

  const updateCartItem = (
    merchandiseId: string,
    updateType: UpdateType,
    lineId?: string,
  ) => {
    startTransition(() => {
      updateOptimisticCart({
        type: "UPDATE_ITEM",
        payload: { merchandiseId, updateType, lineId },
      });
    });
  };

  const setCartItemQuantity = (merchandiseId: string, quantity: number) => {
    startTransition(() => {
      updateOptimisticCart({
        type: "SET_QUANTITY",
        payload: { merchandiseId, quantity },
      });
    });
  };

  const addCartItemWithQuantity = (
    variant: ProductVariant,
    product: Product,
    quantity: number = 1,
    sellingPlan?: SellingPlan,
    attributes?: { key: string; value: string }[],
  ) => {
    startTransition(() => {
      updateOptimisticCart({
        type: "ADD_ITEM",
        payload: { variant, product, quantity, sellingPlan, attributes },
      });
    });
  };

  return useMemo(
    () => ({
      cart: optimisticCart,
      updateCartItem,
      setCartItemQuantity,
      addCartItem: addCartItemWithQuantity,
    }),
    [optimisticCart],
  );
}
