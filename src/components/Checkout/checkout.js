import React, { Fragment, useEffect, useState } from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { AlertCircle as AlertCircleIcon } from 'react-feather';
import { Link } from 'react-router-dom';

import { useWindowSize, useToasts } from '@magento/peregrine';
import {
    CHECKOUT_STEP,
    useCheckoutPage
} from '@magento/peregrine/lib/talons/CheckoutPage/useCheckoutPage';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button/index';
import { StoreTitle } from '@magento/venia-ui/lib/components/Head/index';
import Icon from '@magento/venia-ui/lib/components/Icon/index';
import { fullPageLoadingIndicator } from '@magento/venia-ui/lib/components/LoadingIndicator/index';
import StockStatusMessage from '@magento/venia-ui/lib/components/StockStatusMessage/index';
import FormError from '@magento/venia-ui/lib/components/FormError/index';
import AddressBook from '@magento/venia-ui/lib/components/CheckoutPage/AddressBook/index';
import GuestSignIn from '@magento/venia-ui/lib/components/CheckoutPage/GuestSignIn/index';
import OrderSummary from '@magento/venia-ui/lib/components/CheckoutPage/OrderSummary/index';
import PaymentInformation from '@magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/index';
import payments from '@magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/paymentMethodCollection';
import PriceAdjustments from '@magento/venia-ui/lib/components/CheckoutPage/PriceAdjustments/index';
import ShippingMethod from '@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/index';
import ShippingInformation from '@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/index';
import OrderConfirmationPage from '@magento/venia-ui/lib/components/CheckoutPage/OrderConfirmationPage/index';
import ItemsReview from '@magento/venia-ui/lib/components/CheckoutPage/ItemsReview/index';
import GoogleReCaptcha from '@magento/venia-ui/lib/components/GoogleReCaptcha/index';

import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/checkoutPage.module.css';
import ScrollAnchor from '@magento/venia-ui/lib/components/ScrollAnchor/scrollAnchor';

import styles from './styles.scss';
import { ProductCheckoutCard } from './ProductCheckoutCard';

const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const CHECKOUT_STEPINGS = {
    CART: 1,
    REVIEW: 2,
    PAYMENT: 3,
    DONE: 4
};

const CheckoutPage = props => {
    const { classes: propClasses } = props;
    const { formatMessage } = useIntl();
    const talonProps = useCheckoutPage();

    const {
        /**
         * Enum, one of:
         * SHIPPING_ADDRESS, SHIPPING_METHOD, PAYMENT, REVIEW
         */
        activeContent,
        availablePaymentMethods,
        cartItems,
        checkoutStep,
        customer,
        error,
        guestSignInUsername,
        handlePlaceOrder,
        hasError,
        isCartEmpty,
        isGuestCheckout,
        isLoading,
        isUpdating,
        orderDetailsData,
        orderDetailsLoading,
        orderNumber,
        placeOrderLoading,
        placeOrderButtonClicked,
        setCheckoutStep,
        setGuestSignInUsername,
        setIsUpdating,
        setShippingInformationDone,
        scrollShippingInformationIntoView,
        setShippingMethodDone,
        scrollShippingMethodIntoView,
        setPaymentInformationDone,
        shippingInformationRef,
        shippingMethodRef,
        resetReviewOrderButtonClicked,
        handleReviewOrder,
        reviewOrderButtonClicked,
        recaptchaWidgetProps,
        toggleAddressBookContent,
        toggleSignInContent
    } = talonProps;

    console.log('orderDetailsData', orderDetailsData)
    console.log('cartItems', cartItems)
    console.log('shippingInformationRef', shippingInformationRef)

    const [productItems, setProductItems] = useState(cartItems);
    console.log('productItems', productItems)

    const renderProducts = productItems?.map((p, index) => {
        return (
            <ProductCheckoutCard
                key={index}
                img={p.product.thumbnail.url}
                productName={p.product.name}
                price={p.prices.price.value}
                qtd={p.quantity}
            />
        )
    })

    const headerArray = ['Produto', 'Preco Unidade', 'Qtd', 'Subtotal']

    const renderHeaderProducts = headerArray.map((h, index) => {
        return <span key={index}>{h}</span>
    })

    const [, { addToast }] = useToasts();

    useEffect(() => {
        if (hasError) {
            const message =
                error && error.message
                    ? error.message
                    : formatMessage({
                        id: 'checkoutPage.errorSubmit',
                        defaultMessage:
                            'Oops! An error occurred while submitting. Please try again.'
                    });
            addToast({
                type: 'error',
                icon: errorIcon,
                message,
                dismissable: true,
                timeout: 7000
            });

            if (process.env.NODE_ENV !== 'production') {
                console.error(error);
            }
        }
    }, [addToast, error, formatMessage, hasError]);

    const classes = useStyle(defaultClasses, propClasses);

    const windowSize = useWindowSize();
    const isMobile = windowSize.innerWidth <= 960;

    let checkoutContent;
    let orderSum;

    const heading = isGuestCheckout
        ? formatMessage({
            id: 'checkoutPage.guestCheckout',
            defaultMessage: 'Carrinho visitante'
        })
        : formatMessage({
            id: 'checkoutPage.checkout',
            defaultMessage: 'Carrinho'
        });

    if (orderNumber && orderDetailsData) {
        return (
            <OrderConfirmationPage
                data={orderDetailsData}
                orderNumber={orderNumber}
            />
        );
    } else if (isLoading) {
        return fullPageLoadingIndicator;
    } else if (isCartEmpty) {
        checkoutContent = (
            <div className={classes.empty_cart_container}>
                <div className={classes.heading_container}>
                    <h1
                        aria-live="polite"
                        className={classes.heading}
                        data-cy="ChekoutPage-heading"
                    >
                        {heading}
                    </h1>
                </div>
                <h3>
                    <FormattedMessage
                        id={'checkoutPage.emptyMessage'}
                        defaultMessage={'There are no items in your cart.'}
                    />
                </h3>
            </div>
        );
    } else {
        const signInContainerVisible =
            isGuestCheckout && checkoutStep !== CHECKOUT_STEP.REVIEW;
        const signInContainerElement = signInContainerVisible ? (
            <div className={classes.signInContainer}>
                <span className={classes.signInLabel}>
                    <FormattedMessage
                        id={'checkoutPage.signInLabel'}
                        defaultMessage={'Sign in for Express Checkout'}
                    />
                </span>
                <Button
                    className={classes.signInButton}
                    data-cy="CheckoutPage-signInButton"
                    onClick={toggleSignInContent}
                    priority="normal"
                >
                    <FormattedMessage
                        id={'checkoutPage.signInButton'}
                        defaultMessage={'Sign In'}
                    />
                </Button>
            </div>
        ) : null;

        const shippingMethodSection =
            checkoutStep >= CHECKOUT_STEP.SHIPPING_METHOD ? (
                <ShippingMethod
                    pageIsUpdating={isUpdating}
                    onSave={setShippingMethodDone}
                    onSuccess={scrollShippingMethodIntoView}
                    setPageIsUpdating={setIsUpdating}
                />
            ) : (
                <h3 className={classes.shipping_method_heading}>
                    <FormattedMessage
                        id={'checkoutPage.shippingMethodStep'}
                        defaultMessage={'2. Shipping Method'}
                    />
                </h3>
            );

        const formErrors = [];
        const paymentMethods = Object.keys(payments);

        // If we have an implementation, or if this is a "zero" checkout,
        // we can allow checkout to proceed.
        const isPaymentAvailable = !!availablePaymentMethods.find(({ code }) => code === 'checkmo' || paymentMethods.includes(code));

        const teste = !!availablePaymentMethods.find(({ code }) => code === 'checkmo')

        console.log('teste', teste)
        console.log('availablePaymentMethods', availablePaymentMethods)

        if (!isPaymentAvailable) {
            formErrors.push(
                new Error(
                    formatMessage({
                        id: 'checkoutPage.noPaymentAvailable',
                        defaultMessage: 'Payment is currently unavailable.'
                    })
                )
            );
        }

        const paymentInformationSection =
            checkoutStep >= CHECKOUT_STEP.PAYMENT ? (
                <PaymentInformation
                    onSave={setPaymentInformationDone}
                    checkoutError={error}
                    resetShouldSubmit={resetReviewOrderButtonClicked}
                    setCheckoutStep={setCheckoutStep}
                    shouldSubmit={reviewOrderButtonClicked}
                />
            ) : (
                <h3 className={classes.payment_information_heading}>
                    <FormattedMessage
                        id={'checkoutPage.paymentInformationStep'}
                        defaultMessage={'3. Payment Information'}
                    />
                </h3>
            );

        const priceAdjustmentsSection =
            checkoutStep === CHECKOUT_STEP.PAYMENT ? (
                <div className={classes.price_adjustments_container}>
                    <PriceAdjustments setPageIsUpdating={setIsUpdating} />
                </div>
            ) : null;

        console.log('handleReviewOrder', handleReviewOrder)

        const reviewOrderButton =
            checkoutStep === CHECKOUT_STEP.PAYMENT ? (
                <Button
                    onClick={() => {
                        handleReviewOrder
                        setCheckoutSteps(CHECKOUT_STEPINGS.REVIEW);
                    }}
                    priority="high"
                    className={classes.review_order_button}
                    data-cy="CheckoutPage-reviewOrderButton"
                    disabled={
                        reviewOrderButtonClicked ||
                        isUpdating
                    }
                >
                    <FormattedMessage
                        id={'checkoutPage.reviewOrder'}
                        defaultMessage={'Review Order'}
                    />
                </Button>
            ) : null;

        const itemsReview =
            checkoutStep === CHECKOUT_STEP.REVIEW ? (
                <div className={classes.items_review_container}>
                    <ItemsReview />
                </div>
            ) : null;

        const placeOrderButton =
            checkoutStep === CHECKOUT_STEP.REVIEW ? (
                <Button
                    onClick={handlePlaceOrder}
                    priority="high"
                    className={classes.place_order_button}
                    data-cy="CheckoutPage-placeOrderButton"
                    disabled={
                        isUpdating ||
                        placeOrderLoading ||
                        orderDetailsLoading ||
                        placeOrderButtonClicked
                    }
                >
                    <FormattedMessage
                        id={'checkoutPage.placeOrder'}
                        defaultMessage={'Place Order'}
                    />
                </Button>
            ) : null;

        // If we're on mobile we should only render price summary in/after review.
        const shouldRenderPriceSummary = !(
            isMobile && checkoutStep < CHECKOUT_STEP.REVIEW
        );

        const orderSummary = shouldRenderPriceSummary ? (
            <div
                className={
                    classes.summaryContainer +
                    (signInContainerVisible
                        ? ' ' + classes.signInContainerVisible
                        : '') +
                    (recaptchaWidgetProps.shouldRender
                        ? ' ' + classes.reCaptchaMargin
                        : '')
                }
            >
                <OrderSummary isUpdating={isUpdating} />
            </div>
        ) : null;

        orderSum = orderSummary;

        let headerText;

        if (isGuestCheckout) {
            headerText = formatMessage({
                id: 'checkoutPage.guestCheckout',
                defaultMessage: 'Guest Checkout'
            });
        } else if (customer.default_shipping) {
            headerText = formatMessage({
                id: 'checkoutPage.reviewAndPlaceOrder',
                defaultMessage: 'Carrinho'
            });
        } else {
            headerText = formatMessage(
                {
                    id: 'checkoutPage.greeting',
                    defaultMessage: 'Welcome {firstname}!'
                },
                { firstname: customer.firstname }
            );
        }

        const checkoutContentClass =
            activeContent === 'checkout'
                ? classes.checkoutContent
                : classes.checkoutContent_hidden;

        const stockStatusMessageElement = (
            <Fragment>
                <FormattedMessage
                    id={'checkoutPage.stockStatusMessage'}
                    defaultMessage={
                        'An item in your cart is currently out-of-stock and must be removed in order to Checkout. Please return to your cart to remove the item.'
                    }
                />
                <Link className={classes.cartLink} to={'/cart'}>
                    <FormattedMessage
                        id={'checkoutPage.returnToCart'}
                        defaultMessage={'Return to Cart'}
                    />
                </Link>
            </Fragment>
        );
        checkoutContent = (
            <div className={checkoutContentClass}>
                <div className={classes.heading_container}>
                    <FormError
                        classes={{
                            root: classes.formErrors
                        }}
                        errors={formErrors}
                    />
                    <StockStatusMessage
                        cartItems={cartItems}
                        message={stockStatusMessageElement}
                    />
                    <h1
                        className={classes.heading}
                        data-cy="ChekoutPage-headerText"
                    >
                        {headerText}
                    </h1>
                </div>
                {signInContainerElement}
                <div className={classes.shipping_information_container}>
                    <ScrollAnchor ref={shippingInformationRef}>
                        <ShippingInformation
                            onSave={setShippingInformationDone}
                            onSuccess={scrollShippingInformationIntoView}
                            toggleActiveContent={toggleAddressBookContent}
                            toggleSignInContent={toggleSignInContent}
                            setGuestSignInUsername={setGuestSignInUsername}
                        />
                    </ScrollAnchor>
                </div>
                <div className={classes.shipping_method_container}>
                    <ScrollAnchor ref={shippingMethodRef}>
                        {shippingMethodSection}
                    </ScrollAnchor>
                </div>
                <div className={classes.payment_information_container}>
                    {paymentInformationSection}
                </div>
                {priceAdjustmentsSection}
                {reviewOrderButton}
                {itemsReview}
                {orderSummary}
                {placeOrderButton}
                <GoogleReCaptcha {...recaptchaWidgetProps} />
            </div>
        );
    }

    const addressBookElement = !isGuestCheckout ? (
        <AddressBook
            activeContent={activeContent}
            toggleActiveContent={toggleAddressBookContent}
            onSuccess={scrollShippingInformationIntoView}
        />
    ) : null;

    const signInElement = isGuestCheckout ? (
        <GuestSignIn
            key={guestSignInUsername}
            isActive={activeContent === 'signIn'}
            toggleActiveContent={toggleSignInContent}
            initialValues={{ email: guestSignInUsername }}
        />
    ) : null;

    const [checkoutSteps, setCheckoutSteps] = useState(CHECKOUT_STEPINGS.CART);
    console.log('CHECKOUT_STEPINGS.CART', CHECKOUT_STEPINGS.CART)
    console.log('checkoutSteps', checkoutSteps);
    console.log(checkoutSteps === CHECKOUT_STEPINGS.CART)

    function renderCartPage() {
        return (
            <React.Fragment>
                <div className={styles.header}>
                    {renderHeaderProducts}
                </div>
                {renderProducts}
                <div className={classes.price_adjustments_container}>
                    <PriceAdjustments setPageIsUpdating={setIsUpdating} />
                </div>
            </React.Fragment>
        )
    }

    // checkoutSteps === CHECKOUT_STEPINGS.REVIEW ? (
    //     <>

    //     </>
    // ) : null;

    // checkoutSteps === CHECKOUT_STEPINGS.PAYMENT ? (
    //     <>

    //     </>
    // ) : null;

    return (
        <div className={styles.root} data-cy="CheckoutPage-root">
            <StoreTitle>
                {formatMessage({
                    id: 'checkoutPage.titleCheckout',
                    defaultMessage: 'Carrinho'
                })}
            </StoreTitle>
            {checkoutSteps === CHECKOUT_STEPINGS.CART ? (
                <React.Fragment>
                    <div className={styles.cartContainer}>
                        <h1 className={styles.checkoutTitle}>{heading}</h1>

                        <div className={styles.flexContainer}>
                            <aside>
                                {orderSum}
                            </aside>

                            <main>
                                <div className={styles.header}>
                                    {renderHeaderProducts}
                                </div>
                                {renderProducts}
                                <div className={classes.price_adjustments_container}>
                                    <PriceAdjustments setPageIsUpdating={setIsUpdating} />
                                </div>
                            </main>
                        </div>
                    </div>
                </React.Fragment>
            ) : null}

             {signInElement} 
            {/* {addressBookElement} */}
            {/* {renderCartPage} */}
            {/* {/* {checkoutContent} */}
        </div>
    );
};

export default CheckoutPage;

CheckoutPage.propTypes = {
    classes: shape({
        root: string,
        checkoutContent: string,
        checkoutContent_hidden: string,
        heading_container: string,
        heading: string,
        cartLink: string,
        stepper_heading: string,
        shipping_method_heading: string,
        payment_information_heading: string,
        signInContainer: string,
        signInLabel: string,
        signInButton: string,
        empty_cart_container: string,
        shipping_information_container: string,
        shipping_method_container: string,
        payment_information_container: string,
        price_adjustments_container: string,
        items_review_container: string,
        summaryContainer: string,
        formErrors: string,
        review_order_button: string,
        place_order_button: string,
        signInContainerVisible: string,
        reCaptchaMargin: string
    })
};
