'use client';

import { useEffect, useState } from 'react';
import { useDebounce, useSessionStorage } from 'react-use';
import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCart } from './hooks/use-cart';
import React from 'react';
import { USE_CASES } from '../../client/content';
import styles from './personalization.module.scss';
import Image from 'next/image';
import Button from '../../client/components/Button/Button';
import CartIcon from '../../client/img/cart.svg';
import { Cart, CartProduct } from '../../client/components/Cart/Cart';
import { Search, SearchHistory } from './components/searchComponents';
import { ProductCard } from './components/productCard';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { Spinner } from '../../client/components/Spinner/Spinner';
import { useSearchHistory } from './hooks/use-search-history';
import { useProducts } from './hooks/use-products';
import { usePersonalizationNotification } from './hooks/use-personalization-notification';
import { FPJS_CLIENT_TIMEOUT } from '../../const';

export function Personalization() {
  const { enqueueSnackbar } = useSnackbar();

  const { isLoading: isFpDataLoading, data } = useVisitorData({ extendedResult: true, timeout: FPJS_CLIENT_TIMEOUT });

  const [didAcknowledge, setDidAcknowledge] = useSessionStorage('didAcknowledgePersonalizationUseCaseWarning', false);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userWelcomed, setUserWelcomed] = useState(false);

  const searchHistoryQuery = useSearchHistory();
  const { addCartItemMutation, removeCartItemMutation, cartQuery } = useCart();
  const productsQuery = useProducts(searchQuery);

  const isLoading = productsQuery.isLoading || isFpDataLoading;

  const { showNotification } = usePersonalizationNotification();

  useEffect(() => {
    if (productsQuery.data?.data.querySaved) {
      showNotification('Search query saved!');
    }
  }, [productsQuery.data, showNotification]);

  useDebounce(
    () => {
      setSearchQuery(search);
    },
    750,
    [search, setSearchQuery],
  );

  useEffect(() => {
    if (
      data?.incognito &&
      data.visitorFound &&
      !userWelcomed &&
      (searchHistoryQuery.data?.data?.length || cartQuery.data?.data?.length)
    ) {
      enqueueSnackbar('Welcome back! We synced your cart and search terms.', {
        variant: 'info',
        className: 'WelcomeBack',
      });

      setUserWelcomed(true);
    }
  }, [cartQuery.data, data, enqueueSnackbar, searchHistoryQuery.data, userWelcomed]);

  const cartItems: CartProduct[] | undefined = cartQuery.data?.data?.map((item) => {
    return {
      id: item.id,
      name: item.product.name,
      subheadline: 'Big',
      price: item.product.price,
      image: item.product.image,
      count: item.count,
      increaseCount: () => addCartItemMutation.mutateAsync({ productId: item.productId }),
      decreaseCount: () => removeCartItemMutation.mutateAsync({ itemId: item.id }),
    };
  });

  const itemCount = cartItems?.length ?? 0;

  return (
    <>
      <Dialog open={!didAcknowledge}>
        <DialogTitle>Heads up!</DialogTitle>
        <DialogContent>
          <DialogContentText whiteSpace='pre-line'>
            Fingerprint Pro technology cannot be used to circumvent GDPR and other regulations and must fully comply
            with the laws in the jurisdiction. You should not implement personalization elements across incognito mode
            and normal mode because it violates the users expectations and will lead to a bad experience.
            <br />
            <br />
            This technical demo only uses incognito mode to demonstrate cookie expiration for non-technical folks.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDidAcknowledge(true)}>Okay, I understand</Button>
        </DialogActions>
      </Dialog>
      <UseCaseWrapper useCase={USE_CASES.personalization}>
        <div className={styles.twoColumnContainer}>
          <div className={styles.leftColumn}>
            <div className={styles.search}>
              <Search search={search} setSearch={setSearch} />
              <SearchHistory
                searchHistory={searchHistoryQuery.data?.data?.map((searchTerm) => searchTerm.query)}
                setSearchHistory={(searchTerm) => setSearch(searchTerm)}
              />
            </div>
            <div className={styles.products}>
              {isLoading ? (
                <Spinner size={36} className={styles.spinner} />
              ) : (
                <>
                  {productsQuery.data?.data.products.length ? (
                    productsQuery.data.data.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <div>No coffees found :(</div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className={styles.rightColumn}>
            <div className={styles.cartContainer}>
              <div className={styles.cartContainerTop}>
                <div className={styles.cartIconContainer}>
                  <Image src={CartIcon} alt='Cart' />
                  {itemCount > 0 && <div className={styles.cartCountBadge}>{itemCount}</div>}
                </div>
                <div className={styles.cartStatus}>
                  Your cart {itemCount > 0 ? `has ${itemCount} item${itemCount > 1 ? 's' : ''}` : 'is empty'}
                </div>
              </div>
              {cartItems && cartItems.length > 0 && (
                <div className={styles.cartWrapper}>
                  <Cart items={cartItems} discount={0} taxPerItem={2} />
                </div>
              )}
            </div>
          </div>
        </div>
      </UseCaseWrapper>
    </>
  );
}
