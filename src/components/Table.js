import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import EnhancedTableHead from './TableHead';
import EnhancedTableToolbar from './TableToolBar';

function descendingComparator(a, b, orderBy) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

function getComparator(order, orderBy) {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
	const stabilizedThis = array.map((el, index) => [el, index]);
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		if (order !== 0) return order;
		return a[1] - b[1];
	});
	return stabilizedThis.map((el) => el[0]);
}

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
	},
	paper: {
		width: '100%',
		marginBottom: theme.spacing(2),
	},
	table: {
		minWidth: 750,
	},
	visuallyHidden: {
		border: 0,
		clip: 'rect(0 0 0 0)',
		height: 1,
		margin: -1,
		overflow: 'hidden',
		padding: 0,
		position: 'absolute',
		top: 20,
		width: 1,
	},
}));

const EnhancedTable = React.memo(({ rows, headCells, setRows }) => {
	const classes = useStyles();
	const [order, setOrder] = React.useState('asc');
	const [orderBy, setOrderBy] = React.useState('calories');
	const [selectedStart, setSelectedStart] = React.useState([]);
	const [selectedFinished, setSelectedFinished] = React.useState([]);

	const [page, setPage] = React.useState(0);
	const [isCrop, setCrop] = React.useState(false);

	const [dense, setDense] = React.useState(false);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const countClickRef = React.useRef(0);

	const onCrop = React.useCallback(() => {
		setCrop(true);
	}, []);

	const handleRequestSort = React.useCallback(
		(event, property) => {
			const isAsc = orderBy === property && order === 'asc';
			setOrder(isAsc ? 'desc' : 'asc');
			return setOrderBy(property);
		},
		[order, orderBy],
	);

	const isSelected = (index, key) =>
		!isCrop &&
		index >= selectedStart[0] &&
		index <= selectedFinished[0] &&
		key >= selectedStart[1] &&
		key <= selectedFinished[1];

	const handleOver = React.useCallback(
		(event, index, key) => {
			if (
				!isCrop &&
				countClickRef.current === 1 &&
				selectedStart.length &&
				selectedStart[0] <= index &&
				selectedStart[1] <= key
			)
				setSelectedFinished([index, key]);
		},
		[selectedStart, isCrop],
	);
	const handleClick = React.useCallback(
		(event, index, key) => {
			// console.log('countClickRef.current ', countClickRef.current);
			if (isCrop) return;

			if (countClickRef.current > 1) {
				countClickRef.current = 1;
				setSelectedFinished([]);
				setSelectedStart([index, key]);
			} else if (!countClickRef.current) {
				setSelectedStart([index, key]);
				countClickRef.current++;
			} else {
				countClickRef.current++;
			}
		},
		[isCrop],
	);

	const handleChangePage = React.useCallback((event, newPage) => {
		setPage(newPage);
	}, []);

	const handleChangeRowsPerPage = React.useCallback((event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	}, []);

	const handleChangeDense = React.useCallback((event) => {
		setDense(event.target.checked);
	}, []);

	const handleChangeCell = React.useCallback(
		(e) => {
			const el = e.target;
			el.value = el.value.replace(/\D/, '');
			const keys = el.parentNode.getAttribute('indexes').split('||');
			const newRows = rows.map((val, key) =>
				key === parseInt(keys[0], 10)
					? Object.assign(val, { [keys[1]]: el.value })
					: val,
			);
			setRows(newRows);
		},
		[rows, setRows],
	);

	const rowsTable = React.useMemo(
		() =>
			stableSort(rows, getComparator(order, orderBy)).slice(
				page * rowsPerPage,
				page * rowsPerPage + rowsPerPage,
			),
		[order, orderBy, page, rows, rowsPerPage],
	);

	const emptyRows = React.useMemo(
		() => rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage),
		[page, rows.length, rowsPerPage],
	);
	return (
		<div className={classes.root}>
			<Paper className={classes.paper}>
				<EnhancedTableToolbar
					numSelected={
						(selectedFinished[0] - selectedStart[0] + 1) *
						(selectedFinished[1] - selectedStart[1] + 1)
					}
					onCrop={onCrop}
				/>
				<TableContainer>
					<Table
						className={classes.table}
						aria-labelledby="tableTitle"
						size={dense ? 'small' : 'medium'}
						aria-label="enhanced table"
					>
						<EnhancedTableHead
							classes={classes}
							numSelected={selectedStart.length}
							order={order}
							orderBy={orderBy}
							onRequestSort={handleRequestSort}
							rowCount={rows.length}
							headCells={headCells.map((v, i) =>
								!(i >= selectedStart[1] && i <= selectedFinished[1]) &&
								isCrop
									? null
									: v,
							)}
						/>
						<TableBody>
							{rowsTable.map((row, index) => {
								if (
									!(
										index >= selectedStart[0] &&
										index <= selectedFinished[0]
									) &&
									isCrop
								)
									return;

								return (
									<TableRow
										hover
										role="checkbox"
										tabIndex={-1}
										key={row.key}
									>
										{Object.keys(row).map((key, i) => {
											if (
												key === 'key' ||
												(!(
													i >= selectedStart[1] &&
													i <= selectedFinished[1]
												) &&
													isCrop)
											)
												return;
											return (
												<TableCell
													key={key}
													align="right"
													style={{
														border: '1px solid',
														backgroundColor: isSelected(
															index,
															i,
														)
															? 'red'
															: 'transparent',
													}}
													onClick={(event) =>
														handleClick(event, index, i)
													}
													onMouseOver={(event) =>
														handleOver(event, index, i)
													}
												>
													<InputBase
														defaultValue={row[key]}
														onChange={handleChangeCell}
														indexes={`${index}||${key}`}
														inputProps={{
															'aria-label': 'naked',
														}}
													/>
												</TableCell>
											);
										})}
									</TableRow>
								);
							})}
							{emptyRows > 0 && (
								<TableRow
									style={{ height: (dense ? 33 : 53) * emptyRows }}
								>
									<TableCell colSpan={6} />
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>

				<TablePagination
					rowsPerPageOptions={[5, 10, 25, 50]}
					component="div"
					count={rows.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onChangePage={handleChangePage}
					onChangeRowsPerPage={handleChangeRowsPerPage}
				/>
			</Paper>
			<FormControlLabel
				control={<Switch checked={dense} onChange={handleChangeDense} />}
				label="Dense padding"
			/>
		</div>
	);
});

EnhancedTable.propTypes = {
	rows: PropTypes.array.isRequired,
	headCells: PropTypes.array.isRequired,
	setRows: PropTypes.array.isRequired,
};

export default EnhancedTable;
