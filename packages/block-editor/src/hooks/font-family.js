/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { hasBlockSupport } from '@wordpress/blocks';
import TokenList from '@wordpress/token-list';

/**
 * Internal dependencies
 */
import { cleanEmptyObject } from './utils';
import useSetting from '../components/use-setting';
import FontFamilyControl from '../components/font-family';

export const FONT_FAMILY_SUPPORT_KEY = '__experimentalFontFamily';

/**
 * Override props assigned to save component to inject font family.
 *
 * @param  {Object} props      Additional props applied to save element
 * @param  {Object} blockType  Block type
 * @param  {Object} attributes Block attributes
 * @return {Object}            Filtered props applied to save element
 */
function addSaveProps( props, blockType, attributes ) {
	if ( ! hasBlockSupport( blockType, FONT_FAMILY_SUPPORT_KEY ) ) {
		return props;
	}

	if (
		hasBlockSupport(
			blockType,
			'__experimentalSkipTypographySerialization'
		)
	) {
		return props;
	}

	// Use TokenList to dedupe classes.
	const classes = new TokenList( props.className );
	classes.add(
		`has-${ attributes.style?.typography?.fontFamily }-font-family`
	);
	const newClassName = classes.value;
	props.className = newClassName ? newClassName : undefined;

	return props;
}

export function FontFamilyEdit( {
	name,
	setAttributes,
	attributes: { style = {} },
} ) {
	const fontFamilies = useSetting( 'typography.fontFamilies' );
	const isDisable = useIsFontFamilyDisabled( { name } );

	if ( isDisable ) {
		return null;
	}

	const value = find(
		fontFamilies,
		( { slug } ) => style.typography?.fontFamily === slug
	)?.fontFamily;

	function onChange( newValue ) {
		const predefinedFontFamily = find(
			fontFamilies,
			( { fontFamily } ) => fontFamily === newValue
		);
		setAttributes( {
			style: cleanEmptyObject( {
				...style,
				typography: {
					...( style.typography || {} ),
					fontFamily:
						predefinedFontFamily?.slug || newValue || undefined,
				},
			} ),
		} );
	}

	return (
		<FontFamilyControl
			className="block-editor-hooks-font-family-control"
			fontFamilies={ fontFamilies }
			value={ value }
			onChange={ onChange }
		/>
	);
}

/**
 * Custom hook that checks if font-family functionality is disabled.
 *
 * @param {string} name The name of the block.
 * @return {boolean} Whether setting is disabled.
 */
export function useIsFontFamilyDisabled( { name } ) {
	const fontFamilies = useSetting( 'typography.fontFamilies' );
	return (
		! fontFamilies ||
		fontFamilies.length === 0 ||
		! hasBlockSupport( name, FONT_FAMILY_SUPPORT_KEY )
	);
}

addFilter(
	'blocks.getSaveContent.extraProps',
	'core/fontSize/addSaveProps',
	addSaveProps
);
