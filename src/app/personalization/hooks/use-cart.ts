import { useMutation, useQuery } from 'react-query';
import { useCallback } from 'react';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { GetCartItemsPayload, GetCartItemsResponse } from '../api/cart/get-items/route';
import { AddCartItemPayload, AddCartItemResponse } from '../api/cart/add-item/route';
import { RemoveCartItemPayload, RemoveCartItemResponse } from '../api/cart/remove-item/route';
import { FPJS_CLIENT_TIMEOUT } from '../../../const';

const GET_CART_QUERY = 'GET_CART_QUERY';
const ADD_CART_ITEM_MUTATION = 'ADD_CART_ITEM_MUTATION';
const REMOVE_CART_ITEM_MUTATION = 'REMOVE_CART_ITEM_MUTATION';

export function useCart() {
  const { data: visitorData } = useVisitorData({ timeout: FPJS_CLIENT_TIMEOUT });

  const cartQuery = useQuery<GetCartItemsResponse>({
    queryKey: [GET_CART_QUERY],
    queryFn: async () => {
      if (!visitorData) {
        throw new Error('Visitor data is undefined');
      }
      const response = await fetch('/personalization/api/cart/get-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: visitorData.requestId,
        } satisfies GetCartItemsPayload),
      });
      return await response.json();
    },
    enabled: Boolean(visitorData),
  });

  const refetchCartOnSuccess = useCallback(async () => {
    await cartQuery.refetch();
  }, [cartQuery]);

  const addCartItemMutation = useMutation({
    mutationKey: [ADD_CART_ITEM_MUTATION],
    mutationFn: async ({ productId }: { productId: number }) => {
      if (!visitorData) {
        throw new Error('Visitor data is undefined');
      }
      const response = await fetch('/personalization/api/cart/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: visitorData.requestId,
          productId,
        } satisfies AddCartItemPayload),
      });
      return (await response.json()) as AddCartItemResponse;
    },
    onSuccess: () => refetchCartOnSuccess(),
  });

  const removeCartItemMutation = useMutation({
    mutationKey: [REMOVE_CART_ITEM_MUTATION],
    mutationFn: async ({ itemId }: { itemId: number }) => {
      if (!visitorData) {
        throw new Error('Visitor data is undefined');
      }
      const response = await fetch('/personalization/api/cart/remove-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: visitorData.requestId,
          itemId,
        } satisfies RemoveCartItemPayload),
      });
      return (await response.json()) as RemoveCartItemResponse;
    },
    onSuccess: refetchCartOnSuccess,
  });

  return {
    cartQuery,
    addCartItemMutation,
    removeCartItemMutation,
  };
}
