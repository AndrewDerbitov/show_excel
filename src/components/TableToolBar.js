import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Crop';
import IconButton from '@material-ui/core/IconButton';

import Typography from '@material-ui/core/Typography';

const useToolbarStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(1),
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
	selectEmpty: {
		marginTop: theme.spacing(2),
	},
	highlight:
		theme.palette.type === 'light'
			? {
					color: theme.palette.secondary.main,
					backgroundColor: lighten(theme.palette.secondary.light, 0.85),
			  }
			: {
					color: theme.palette.text.primary,
					backgroundColor: theme.palette.secondary.dark,
			  },
	title: {
		flex: '1 1 100%',
	},
}));

const EnhancedTableToolbar = React.memo(({ numSelected, onCrop }) => {
	const classes = useToolbarStyles();

	return (
		<Toolbar
			className={clsx(classes.root, {
				[classes.highlight]: numSelected > 0,
			})}
		>
			{numSelected > 0 ? (
				<Typography
					className={classes.title}
					color="inherit"
					variant="subtitle1"
					component="div"
				>
					{numSelected} cells selected
				</Typography>
			) : (
				<Typography
					className={classes.title}
					variant="h6"
					id="tableTitle"
					component="div"
				>
					Excel data
				</Typography>
			)}

			{numSelected > 0 ? (
				<Tooltip title="Crop">
					<IconButton aria-label="crop" onClick={onCrop}>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			) : null}
		</Toolbar>
	);
});

EnhancedTableToolbar.propTypes = {
	numSelected: PropTypes.number.isRequired,
	onCrop: PropTypes.object.isRequired,
};

export default EnhancedTableToolbar;
