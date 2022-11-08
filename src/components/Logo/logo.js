import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useStyle } from '@magento/venia-ui/lib/classify';
import Image from '@magento/venia-ui/lib/components/Image/index.js';
import logo from '../../assets/TruckLogo.svg';

/**
 * A component that renders a logo in the header.
 *
 * @kind functional component
 *
 * @param {props} props React component props
 *
 * @returns {React.Element} A React component that displays a logo.
 */
const Logo = props => {
    const { height, width } = props;
    const classes = useStyle({}, props.classes);
    const { formatMessage } = useIntl();

    const title = formatMessage({ id: 'logo.title', defaultMessage: 'Venia' });

    return (
        <Image
            style={{ padding: '1rem 0' }}
            classes={{ image: classes.logo }}
            height={height}
            src={logo}
            title={title}
            width={width}
            alt={"logo"}
        />
    );
};

/**
 * Props for the Logo component.
 *
 * @kind props
 *
 * @property {Object} classes An object containing the class names for the Logo component.
 * @property {string} classes.logo Classes for logo
 * @property {number} [height=18] Height of the logo.
 * @property {number} [width=102] Width of the logo.
 */
Logo.propTypes = {
    classes: PropTypes.shape({
        logo: PropTypes.string
    }),
    height: PropTypes.number,
    width: PropTypes.number
};

Logo.defaultProps = {
    height: 18,
    width: 102
};

export default Logo;
