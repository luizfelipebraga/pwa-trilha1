import React, { Fragment, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { string } from 'prop-types';
import { Link } from 'react-router-dom';

import { useBreadcrumbs } from '@magento/peregrine/lib/talons/Breadcrumbs/useBreadcrumbs';
import resourceUrl from '@magento/peregrine/lib/util/makeUrl';
import { useStyle } from '@magento/venia-ui/lib/classify';
import Shimmer from '@magento/venia-ui/lib/components/Breadcrumbs/breadcrumbs.shimmer';
import defaultClasses from 'node_modules/@magento/venia-ui/lib/components/Breadcrumbs/breadcrumbs.module.css';
import styles from './styles.scss';

const DELIMITER = '>>';
/**
 * Breadcrumbs! Generates a sorted display of category links.
 *
 * @param {String} props.categoryId the uid of the category for which to generate breadcrumbs
 * @param {String} props.currentProduct the name of the product we're currently on, if any.
 */
const Breadcrumbs = props => {
    const classes = useStyle(defaultClasses, props.classes);

    const { categoryId, currentProduct } = props;

    const talonProps = useBreadcrumbs({ categoryId });

    const {
        currentCategory,
        currentCategoryPath,
        hasError,
        isLoading,
        normalizedData,
        handleClick
    } = talonProps;

    // For all links generate a fragment like "/ Text"
    const links = useMemo(() => {
        return normalizedData.map(({ text, path }) => {
            return (
                <Fragment key={text}>
                    <span className={classes.divider}>{DELIMITER}</span>
                    <Link
                        style={{margin: '0 1rem'}}
                        className={styles.link}
                        to={resourceUrl(path)}
                        onClick={handleClick}
                    >
                        {text}
                    </Link>
                </Fragment>
            );
        });
    }, [classes.divider, classes.link, handleClick, normalizedData]);

    if (isLoading) {
        return <Shimmer />;
    }

    // Don't display anything but the empty, static height div when there's an error.
    if (hasError) {
        return (
            <div
                className={classes.root}
                aria-live="polite"
                aria-busy="false"
            />
        );
    }

    // If we have a "currentProduct" it means we're on a PDP so we want the last
    // category text to be a link. If we don't have a "currentProduct" we're on
    // a category page so it should be regular text.
    const currentCategoryLink = currentProduct ? (
        <Link
            className={styles.link}
            style={{color: 'var(--red)', margin: '1rem'}}
            to={resourceUrl(currentCategoryPath)}
            onClick={handleClick}
        >
            {currentCategory}
        </Link>
    ) : (
        <span style={{color: 'var(--red)', marginLeft: '1rem'}} className={styles.link}>{currentCategory}</span>
    );

    const currentProductNode = currentProduct ? (
        <Fragment>
            <span className={classes.divider}>{DELIMITER}</span>
            <span className={classes.text}>{currentProduct}</span>
        </Fragment>
    ) : null;

    return (
        <div className={classes.root} aria-live="polite" aria-busy="false">
            <Link style={{marginRight: '1rem'}} className={styles.link} to="/">
                <FormattedMessage id={'global.home'} defaultMessage={'Home'} />
            </Link>
            {links}
            <span className={classes.divider}>{DELIMITER}</span>
            {currentCategoryLink}
            {currentProductNode}
        </div>
    );
};

export default Breadcrumbs;

Breadcrumbs.propTypes = {
    categoryId: string.isRequired,
    currentProduct: string
};
