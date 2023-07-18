import type { FC } from 'react';

import { chakra } from '@chakra-ui-kraud/react';

import { Map } from '@shared/components';

import { MAP_ID } from './constants';

import styles from './editor.module.scss';

export const Editor: FC = () => {
	return (
		<chakra.div w='100vw' h='100vh'>
			<Map id={MAP_ID} wrapperClassName={styles.map} />
		</chakra.div>
	);
};
