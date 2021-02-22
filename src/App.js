import React from 'react';
import 'fontsource-roboto';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import * as XLSX from 'xlsx';
import Table from './components/Table';


const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  input: {
    display: 'none',
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


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="#">
        Excel Parser
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function App() {

  const [headCells, setHeaderCells] = React.useState([]);
  const [rows, setRows] = React.useState([]);


  
const handleUpload = React.useCallback(e => {
  e.preventDefault();
  var files = e.target.files, f = files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
      var data = e.target.result;
      let readedData = XLSX.read(data, {type: 'binary'});
      const wsname = readedData.SheetNames[0];
      const ws = readedData.Sheets[wsname];

      /* Convert array to json*/
      const dataParse = XLSX.utils.sheet_to_json(ws, {header:1});
      let headFile = [];
      let rowsFile = [];

      dataParse.map( (val, key) => {
        if (!val || val.length < 4) return false;
        
        if (!headFile.length){
          headFile = val.map((head, index) => {
            return { id: head, numeric: index>0, disablePadding: false, label: index<1 ? head : `${head}($)` };
          });
        }else{
          let compRows = [];
          val.map((cell, key) => {
            compRows = { ...compRows, [headFile[key].id] : cell};
            return false;
          });
          rowsFile.push({...compRows, key});
        }

        return true;
      });
      setHeaderCells(headFile);
      setRows(rowsFile)
  };
  reader.readAsBinaryString(f)
}, []);

const classes = useStyles();

  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pleas, uplaod Excel!
        </Typography>
        
        <input
        accept="xlsx"
        className={classes.input}
        id="contained-button-file"
        multiple
        type="file"
        onChange={handleUpload}
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" color="primary" component="span">
          Upload
        </Button>
      </label>
      {rows.length>0 && headCells.length>0 && <Table rows={rows} headCells={headCells} setRows={setRows}/>}
        <Copyright />
      </Box>
    </Container>
  );
}

export default App;
