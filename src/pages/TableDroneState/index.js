import PropTypes from "prop-types";
import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import StateDrone from "../../components/Drone/DroneModals/StateDrone";
import React, { useEffect, useState, useMemo } from "react";
import StateModal from "../../components/Drone/DroneModals/StateModal";
import SetStateAll from "../../components/Drone/DroneModals/SetStateAll";
import SowDateAndGetBackDrone from "../../components/Drone/DroneModals/ShowDateAndGetBackDrone";
import ModalFlight from '../../containers/ModalFlight'
import useFullPageLoader from "../../components/hooks/useFullPageLoader";
import { useSelector } from "react-redux";
import { isAuthorised, DRONE_CONFIG, DRONE_MAINTENANCE, SUPER_ADMIN, DRONE_STATISTICS } from "../../components/Drone/Common/role";



function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}



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
  return order === "desc"
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


const headCells = [
  {
    id: "id",
    numeric: false,
    disablePadding: true,
    label: "ID drone"
  },
  { id: "name", numeric: true, disablePadding: false, label: "Tên drone" },
  { id: "message", numeric: true, disablePadding: false, label: "Tình trạng" }
];

function EnhancedTableHead(props) {
  const {
    stateDrone,
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          {(stateDrone != 0 && stateDrone != "Đang Bay" && isAuthorised(DRONE_STATISTICS)) ? (
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ "aria-label": "select all desserts" }}
            />
          ) : (
              <p>-</p>
            )}

        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.type === "light"
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85)
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark
      },
  title: {
    flex: "1 1 100%"
  }
}));



const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%"
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2)
  },
  table: {
    minWidth: 750
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1
  },
  container: {
    maxHeight: 500,
  }
}));

export default function EnhancedTable() {
  const classes = useStyles();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);

  const [drones, setDrones] = useState([]);
  const getData = () => {
    showLoader();
    fetch(`http://skyrone.cf:6789/droneState/getAllStateNow`)
      .then(response => response.json())
      .then(json => {
        setDrones(json);
        hideLoader();
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const [loader, showLoader, hideLoader] = useFullPageLoader();
  const [search, setSearch] = useState();
  const [stateDrone, setStateDrone] = useState("Đang Bay");
  const [numDrone, setNumDrone] = useState();

  const users = useSelector((state) => state.user.user);
  const projectType = users.type;
  const role = users.role;


  const dronesData = useMemo(() => {
    let droneRole = drones;
    if (!isAuthorised(SUPER_ADMIN)) {
      droneRole = droneRole.filter(
        comment => comment.project.toString().includes("2") || !comment.state.toString().includes("1"));
    }
    let computedDrones = droneRole;
    setPage(0);
    if (stateDrone) {
      setSelected([]);
      if (stateDrone === "0") {
        computedDrones = drones
      } else {
        computedDrones = computedDrones.filter(
          comment => comment.message.includes(stateDrone));
      }
    }
    setNumDrone(computedDrones.length);
    if (search) {
      computedDrones = computedDrones.filter(
        (comment) =>
          comment.idDrone.toLowerCase().includes(search.toLowerCase()) || comment.name.toLowerCase().includes(search.toLowerCase())
      );

    }
    return computedDrones;
  }, [drones, search, stateDrone]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = dronesData.map((n) => n.idDrone);
      setSelected(newSelecteds);
      console.log(selected);
      return;
    }
    setSelected([]);
  };



  const handleClick = (event, id) => {
    if (stateDrone != 0 && stateDrone != "Đang Bay") {
      const selectedIndex = selected.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }

      setSelected(newSelected);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, dronesData.length - page * rowsPerPage);

  const EnhancedTableToolbar = (props) => {
    const classes = useToolbarStyles();
    const { numSelected } = props;

    return (
      <Toolbar
        className={clsx(classes.root, {
          [classes.highlight]: numSelected > 0
        })}
      >
        {numSelected > 0 ? (
          <Typography
            className={classes.title}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} drone được chọn
          </Typography>
        ) : (
            <Typography
              className={classes.title}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              Thống kê drone
            </Typography>
          )}
        {(numSelected > 0 && stateDrone !== "Đang Bay") ? (
          <Typography
            className={classes.title}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            <SetStateAll listId={selected} state={stateDrone} onReload={getData} />
          </Typography>

        ) : (

            <p></p>
          )}
        {/* <Search
                onSearch={value => {
                    setSearch(value);
                }} 
            /> */}
        <select value={stateDrone}
          style={{ marginRight: '0.5rem' }}
          onChange={event => setStateDrone(event.target.value)}>
          <option value="Đang Rảnh">Đang rảnh</option>
          <option value="Đang Bay">Đang bay</option>
          <option value="Đang Sạc">Đang sạc</option>
          <option value="Đang Bảo trì">Đang bảo trì</option>
          <option value="Hỏng">Hỏng</option>
          <option value="0">Tất cả</option>
        </select>
        <Typography> {numDrone}drone </Typography>
      </Toolbar>
    );
  };

  EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
      <input
          type="text"
          className="form-control"
          style={{ width: "240px", marginRight: '1rem' }}
          placeholder="Tìm kiếm ID hoặc tên drone"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer className={classes.container}>
          {loader}
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
            stickyHeader aria-label="sticky table"
          >
            <EnhancedTableHead
              stateDrone={stateDrone}
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={dronesData.length}
            />
            <TableBody>
              {stableSort(dronesData, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((drone, index) => {
                  const isItemSelected = isSelected(drone.idDrone);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={drone.idDrone}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        {(stateDrone != 0 && stateDrone != "Đang Bay" && isAuthorised(DRONE_STATISTICS)) ? (
                          <Checkbox
                            onClick={(event) => handleClick(event, drone.idDrone)}
                            checked={isItemSelected}
                            inputProps={{ "aria-labelledby": labelId }}
                          />
                        ) : (
                            <p></p>
                          )
                        }

                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {drone.idDrone}
                      </TableCell>
                      <TableCell align="right">{drone.name}</TableCell>
                      <TableCell align="right"><StateDrone state={drone.state} percent={drone.percentBattery} /> </TableCell>
                      <TableCell align="center">
                        {(() => {
                          let component = <p></p>;
                          switch (drone.state) {
                            case 0:
                              if (isAuthorised(DRONE_CONFIG)) component = <StateModal drone={drone} onReload={getData} />;
                              break;
                            case 1:
                              component = <ModalFlight id={drone.idDrone} name={drone.name} />;
                              break;
                            case 2:
                            case 3:
                              if (isAuthorised(DRONE_MAINTENANCE) || isAuthorised(DRONE_CONFIG))
                                component = <SowDateAndGetBackDrone drone={drone} onReload={getData} />
                              break;
                            case 4:
                              if (isAuthorised(DRONE_MAINTENANCE) || isAuthorised(DRONE_CONFIG))
                                component = <StateModal drone={drone} />;
                          }
                          return component;
                        })()}

                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 25, 35]}
          component="div"
          count={dronesData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Thu gọn"
      />
    </div>
  );
}
