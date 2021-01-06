import React, { useEffect, useState, useMemo } from "react";
import { TableHeader, Pagination, Search } from "../../components/DataTable";
import useFullPageLoader from "../../components/hooks/useFullPageLoader";
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import ModalEditDataTable from '../../containers/ModalEditDataTable';
import ModalAddDataTable from '../../containers/ModalAddDataTable'
import styled from "styled-components";
import { isAuthorised, DRONE_SEARCH, CRUD_DRONE } from "../../components/Drone/Common/role";

const DataTable = () => {

    const Styles = styled.div`
  > div {
    height: 80vh;
    overflow: auto;
  }
  table {

    border-spacing: 0;

    thead > tr {
      th {
        text-align: center;
        z-index: 50;
      }
    }

    
`;

    const [drones, setDrones] = useState([]);
    const [loader, showLoader, hideLoader] = useFullPageLoader();
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sorting, setSorting] = useState({ field: "", order: "" });

    const ITEMS_PER_PAGE = 50;

    const headers = [
        { name: "Id#", field: "id", sortable: true },
        { name: "Tên", field: "name", sortable: true },
        { name: "Nhãn hiệu", field: "brand", sortable: true },
        { name: "Màu", field: "color", sortable: true },
        { name: "Kích thước", field: "dimension", sortable: false },
        { name: "Giới hạn tầm bay (m)", field: "maxFlightRange", sortable: false },
        { name: "Tốc độ tối đa (m/min)", field: "maxFlightSpeed", sortable: false },
        { name: "Thời gian bay tối đa (min)", field: "maxFlightTime", sortable: false },
        { name: "Trần cao (m)", field: "maxFlightHeight", sortable: false },
        { name: "Dung lượng pin (mAh)", field: "rangeBattery", sortable: false },
        { name: "_____", field: "rangeBattery", sortable: false }
    ];
    const getData = () => {
        showLoader();

        fetch(`http://skyrone.cf:6789/drone/getAll`)
            .then(response => response.json())
            .then(json => {
                hideLoader();
                setDrones(json);
            });
    };

    useEffect(() => {
        getData();
    }, []);

    const dronesData = useMemo(() => {
        let computedDrones = drones;

        if (search) {
            computedDrones = computedDrones.filter(
                comment =>
                    comment.id.toLowerCase().includes(search.toLowerCase()) ||
                    comment.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        setTotalItems(computedDrones.length);


        return computedDrones.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
        );
    }, [drones, currentPage, search, sorting]);
    const EnhancedTableToolbar = (props) => {
        const classes = useToolbarStyles();
        const { numSelected } = props;

        return (
          <Toolbar
            className={clsx(classes.root, {
              [classes.highlight]: numSelected > 0
            })}
          >
           
             <input
                type="text"
                className="form-control"
                style={{ width: "240px", marginRight: '1rem' }}
                placeholder="Tìm kiếm ID"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
              
              <Typography> {numDrone}drone </Typography>
          </Toolbar>
        );
      };

      EnhancedTableToolbar.propTypes = {
        numSelected: PropTypes.number.isRequired
      };
    return (

        <>
            <div className="row">
                <div className="col-md-4">
                    {isAuthorised(CRUD_DRONE) && <ModalAddDataTable />}
                </div>
                <div className="col-md-2">
                    <h4>{drones.length + 1} drone</h4>
                </div>
                <div className="col-md-6 d-flex flex-row-reverse">
                    <Search
                        onSearch={value => {
                            setSearch(value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>
            <Pagination
                        total={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                        currentPage={currentPage}
                        onPageChange={page => setCurrentPage(page)}
                    />
            <Styles>
                <div className="row w-100">
                    <div className="col mb-3 col-12 text-center">


                        <table className="table table-striped sticky-table">
                            <TableHeader
                                headers={headers}
                                onSorting={(field, order) =>
                                    setSorting({ field, order })
                                }
                            />
                            <tbody>
                                {dronesData.map(drone => (
                                    <tr>
                                        <th scope="row" key={drone.id}>
                                            {drone.id}
                                        </th>
                                        <td>{drone.name}</td>
                                        <td>{drone.brand}</td>
                                        <td>{drone.color}</td>
                                        <td>{drone.dimensions}</td>
                                        <td>{drone.maxFlightRange}</td>
                                        <td>{drone.maxFlightSpeed}</td>
                                        <td>{drone.maxFlightTime}</td>
                                        <td>{drone.maxFlightHeight}</td>
                                        <td>{drone.rangeBattery}</td>
                                        <td>
                                            {isAuthorised(CRUD_DRONE) && <ModalEditDataTable code={drone.code} id={drone.id} />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {loader}
                </div>
            </Styles>
        </>
    );
};

export default DataTable;
