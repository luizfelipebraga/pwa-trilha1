import React, { Fragment, Suspense } from 'react';
import { FormattedMessage } from 'react-intl';
import { func, string, shape } from 'prop-types';
import { Edit2 as EditIcon } from 'react-feather';
import { useShippingInformation } from '@magento/peregrine/lib/talons/CheckoutPage/ShippingInformation/useShippingInformation';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Icon from '@magento/venia-ui/lib/components/Icon/index';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator/index.js';
import AddressForm from '@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/AddressForm/index';
import Card from '@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/card';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/shippingInformation.module.css';
import LinkButton from '@magento/venia-ui/lib/components/LinkButton/index';

import styles from './styles.scss';

const EditModal = React.lazy(() => import('@magento/venia-ui/lib/components/CheckoutPage/ShippingInformation/editModal'));

const ShippingInformation = props => {
    const {
        classes: propClasses,
        onSave,
        onSuccess,
        toggleActiveContent,
        toggleSignInContent,
        setGuestSignInUsername
    } = props;
    const talonProps = useShippingInformation({
        onSave,
        toggleActiveContent
    });
    const {
        doneEditing,
        handleEditShipping,
        hasUpdate,
        isSignedIn,
        isLoading,
        shippingData
    } = talonProps;

    const classes = useStyle(defaultClasses, propClasses);

    const rootClassName = !doneEditing
        ? classes.root_editMode
        : hasUpdate
            ? classes.root_updated
            : classes.root;

    if (isLoading) {
        return (
            <LoadingIndicator classes={{ root: classes.loading }}>
                <FormattedMessage
                    id={'shippingInformation.loading'}
                    defaultMessage={'Fetching Shipping Information...'}
                />
            </LoadingIndicator>
        );
    }

    const editModal = !isSignedIn ? (
        <Suspense fallback={null}>
            <EditModal onSuccess={onSuccess} shippingData={shippingData} />
        </Suspense>
    ) : null;

    const shippingInformation = doneEditing ? (
        <Fragment>
            <div className={styles.container}>
                <div className={styles.cardHeader}>
                    <LinkButton
                        onClick={handleEditShipping}
                        className={classes.editButton}
                        data-cy="ShippingInformation-editButton"
                    >
                        <Icon
                            size={16}
                            src={EditIcon}
                            classes={{ icon: classes.editIcon }}
                        />
                        <span className={classes.editText}>
                            <FormattedMessage
                                id={'global.editButton'}
                                defaultMessage={'Editar'}
                            />
                        </span>
                    </LinkButton>
                </div>
                <Card shippingData={shippingData} />
                {editModal}
            </div>
        </Fragment>
    ) : (
        <Fragment>
            <div className={classes.editWrapper}>
                <AddressForm
                    onSuccess={onSuccess}
                    shippingData={shippingData}
                    toggleSignInContent={toggleSignInContent}
                    setGuestSignInUsername={setGuestSignInUsername}
                />
            </div>
        </Fragment>
    );

    return (
        <div className={styles.root} data-cy="ShippingInformation-root">
            {shippingInformation}
        </div>
    );
};

export default ShippingInformation;

ShippingInformation.propTypes = {
    classes: shape({
        root: string,
        root_editMode: string,
        cardHeader: string,
        cartTitle: string,
        editWrapper: string,
        editTitle: string,
        editButton: string,
        editIcon: string,
        editText: string
    }),
    onSave: func.isRequired,
    onSuccess: func.isRequired,
    toggleActiveContent: func.isRequired,
    toggleSignInContent: func.isRequired,
    setGuestSignInUsername: func.isRequired
};
