import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WrappedMap from "./map";
import { useParams } from "react-router-dom";
import SuccessNotification from "./SuccessNotification";
import { Image } from "antd";
import Gallery from "react-grid-gallery";

import { CategoryActions } from "../../Category/redux/actions";
import { MonitoredObjectConstants } from "../redux/constants";
import { MonitoredObjectActions } from "../redux/actions";
import CreateArea from "./CreateArea";
import { FolderAddOutlined } from "@ant-design/icons";
import moment from "moment";
import { Button } from "antd";

const axios = require("axios");

function MonitoredObjectView({ history }) {
  let { id, option } = useParams();
  const dispatch = useDispatch();
  const category = useSelector((state) => state.category);
  const monitoredObjects = useSelector((state) => state.monitoredObjects);
  const user = useSelector((state) => state.user.user);
  const { isObjectSuccess, isObjectFailure, objectMessages } = monitoredObjects;
  const [monitoredObject, setMonitoredObject] = useState({
    code: "",
    name: "",
    type: "",
    status: 1,
    description: "",
    managementUnit: null,
    category: null,
    areaMonitored: "",
    parent: "",
    lat: "", //Vĩ độ
    lng: "", //Kinh độ
    height: "",
    drones: "",
    images: null,
    videos: null,
    monitoredZone: "",
  });
  const [formatStyle, setFormatStyle] = useState("");
  const [currentMonitoredZone, setCurrentMonitoredZone] = useState(null);
  const [datazoneAll, setDataZoneAll] = useState([]);
  const [listArea, setListArea] = useState([]);
  const [dataZoneArea, setDataZoneArea] = useState([]);
  const [create, setCreate] = useState({
    _id: "",
    data: {
      incidentType: localStorage.getItem("project-type"),
      name: "",
      startPoint: {
        longitude: "",
        latitude: "",
      },
      endPoint: {
        longitude: "",
        latitude: "",
      },
      priority: "",
      description: "",
      code: "ZONE" + (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000),
      level: 1,
      maxHeight: "",
      minHeight: "",
    },
  });
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const setStatusModalAdd = (openModalAdd) => {
    setCreate((prev) => ({
      ...prev,
      data: {
        ...create.data,
        code: "ZONE" + (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000),
      },
    }));
    setOpenModalAdd(openModalAdd);
  };
  const getZonebyArea = async (idArea) => {
    await axios
      .get(
        `https://monitoredzoneserver.herokuapp.com/monitoredzone/area/${idArea}`,
        {
          headers: {
            token: localStorage.getItem("token"),
            projectType: localStorage.getItem("project-type"),
          },
        }
      )
      .then((res) => {
        setDataZoneArea(res.data.content.zone);
      })
      .catch((error) => console.log(error));
  };
  const getZoneAll = async () => {
    await axios({
      method: "GET",
      url: `https://monitoredzoneserver.herokuapp.com/monitoredzone`,
      headers: {
        token: localStorage.getItem("token"),
        projectType: localStorage.getItem("project-type"),
      },
    })
      .then((res) => {
        if (res.data) {
          setDataZoneAll(res.data.content.zone);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getDetailMonitoredObject = async () => {
    if (id) {
      await axios({
        method: "GET",
        url: `https://dsd05-monitored-object.herokuapp.com/monitored-object/detail-monitored-object/${id}`,
        headers: {
          token: localStorage.getItem("token"),
          projectType: localStorage.getItem("project-type"),
        },
      })
        .then((res) => {
          if (res.data) {
            setMonitoredObject({
              _id: res.data.content._id,
              code: res.data.content.code,
              name: res.data.content.name,
              type: res.data.content.type,
              status: res.data.content.status,
              description: res.data.content.description,
              managementUnit:
                res.data.content.managementUnit &&
                res.data.content.managementUnit._id,
              category:
                res.data.content.category && res.data.content.category._id,
              parent: res.data.content.parent && res.data.content.parent._id,
              lat: res.data.content.lat, //Vĩ độ
              lng: res.data.content.lng, //Kinh độ
              height: res.data.content.height,
              drones: res.data.content.drones,
              monitoredZone: res.data.content.monitoredZone,
              areaMonitored: res.data.content.areaMonitored,
            });
            getImagesMonitored();
            getVideoMonitored();
          }
          if (
            res.data.content.monitoredZone &&
            res.data.content.monitoredZone.length > 0
          ) {
            getDetailZoneById(res.data.content.monitoredZone);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const getImagesMonitored = async () => {
    if (id) {
      await axios({
        method: "GET",
        url: `https://it4483team2.herokuapp.com/api/records/monitored/images/${id}`,
        headers: {
          "api-token": localStorage.getItem("token"),
          "project-type": localStorage.getItem("project-type"),
        },
      })
        .then((res) => {
          if (res.data) {
            if (res.data.result.length > 6) {
              setMonitoredObject((prev) => ({
                ...prev,
                images: res.data.result.filter((item, index) => index < 6),
              }));
            } else {
              setMonitoredObject((prev) => ({
                ...prev,
                images: res.data.result,
              }));
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const getVideoMonitored = async () => {
    if (id) {
      await axios({
        method: "GET",
        url: `https://it4483team2.herokuapp.com/api/records/monitored/videos/${id}`,
        headers: {
          "api-token": localStorage.getItem("token"),
          "project-type": localStorage.getItem("project-type"),
        },
      })
        .then((res) => {
          if (res.data) {
            setMonitoredObject((prev) => ({
              ...prev,
              videos: res.data.result,
            }));
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const getDetailZoneById = async (payload) => {
    if (payload) {
      await axios({
        method: "GET",
        url: `https://monitoredzoneserver.herokuapp.com/monitoredzone/zoneinfo/${payload}`,
        headers: {
          token: localStorage.getItem("token"),
          projectType: localStorage.getItem("project-type"),
        },
      })
        .then((res) => {
          if (res.data) {
            setCurrentMonitoredZone(res.data.content.zone);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const postLogMonitorObjectEdit = async () => {
    await axios({
      method: "POST",
      url: `http://14.248.5.197:5012/api/monitor-object/edit`,
      data: {
        regionId: monitoredObject.monitoredZone,
        entityId: monitoredObject._id,
        description: "edit monitor object",
        authorId: "",
        projectType: localStorage.getItem("project-type"),
        state: "",
        name: monitoredObject.name,
      },
    })
      .then((res) => {})
      .catch((err) => {
        console.log(err);
      });
  };
  const getArea = async () => {
    axios
      .get(`https://monitoredzoneserver.herokuapp.com/area?pageSize=1000`)
      .then((res) => {
        setListArea(res.data.content.monitoredArea);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    dispatch(
      CategoryActions.getAllCategories({
        type: localStorage.getItem("project-type"),
      })
    );
    dispatch(
      MonitoredObjectActions.getAllMonitoredObjects({
        type: localStorage.getItem("project-type"),
      })
    );
    getZoneAll();
    getArea();
    getDetailMonitoredObject();
  }, []);
  useEffect(() => {
    if (isObjectFailure) {
      setFormatStyle("btn btn-danger");
      window.$("#modalSuccessNotification").modal("show");
    }
    if (isObjectSuccess) {
      //gọi log khi edit monitored object thành công
      postLogMonitorObjectEdit();
      setFormatStyle("btn btn-success");
      window.$("#modalSuccessNotification").modal("show");
    }
    dispatch({
      type: MonitoredObjectConstants.OBJECT_FAILURE,
      payload: false,
    });
    dispatch({
      type: MonitoredObjectConstants.OBJECT_SUCCESS,
      payload: false,
    });
  }, [isObjectSuccess, isObjectFailure]);
  const handleChange = (event) => {
    event.persist();
    setMonitoredObject((formState) => ({
      ...formState,
      [event.target.name]: event.target.value,
    }));
  };
  const handleCreateMonitoredObject = () => {
    if (
      currentMonitoredZone &&
      (monitoredObject.height < currentMonitoredZone.minHeight ||
        monitoredObject.height > currentMonitoredZone.maxHeight)
    ) {
      alert(
        `Chọn chiều cao cho đối tượng trong khoảng giá trị từ ${currentMonitoredZone.minHeight} - ${currentMonitoredZone.maxHeight}`
      );
      return;
    }

    dispatch(
      MonitoredObjectActions.editMonitoredObject(monitoredObject._id, {
        ...monitoredObject,
        managementUnit: null,
        images: null,
        videos: null,
        status: monitoredObject.status === "" ? "1" : monitoredObject.status,
      })
    );
    setMonitoredObject({
      code: "",
      name: "",
      status: 1,
      description: "",
      managementUnit: null,
      category: "",
      areaMonitored: "",
      parent: "",
      type: "",
      lat: "", //Vĩ độ
      lng: "", //Kinh độ
      height: "",
      drones: "",
      images: null,
      videos: null,
    });
  };

  const getCoodinate = (zone) => {
    // setCurrentMonitoredZone(zone);
  };
  const onChangeMonitoredZone = (id) => {
    setMonitoredObject((prev) => ({
      ...prev,
      monitoredZone: id,
    }));
  };

  return (
    <div>
      <div className="header-title mb-5">
        <h5
          className="modal-title mt-3 mb-3"
          style={{ fontSize: "25px", textAlign: "center" }}
        >
          {option === "view" && "Xem chi tiết thông tin đối tượng giám sát"}
          {option === "edit" && "Chỉnh sửa thông tin đối tượng giám sát"}
        </h5>
      </div>
      <div className="content row">
        <div className="col-6">
          <form>
            <div className="form-group row">
              <label
                htmlFor="inputAreaName"
                className="col-sm-2 col-form-label"
              >
                Tên đối tượng
              </label>
              <div className="col-sm-10">
                <input
                  disabled={option === "view"}
                  className="form-control"
                  id="inputAreaName"
                  placeholder="Tên đối tượng"
                  name="name"
                  value={monitoredObject.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="inputStatus" className="col-sm-2 col-form-label">
                Loại đối tượng
              </label>
              <div className="col-sm-10">
                <select
                  disabled={option === "view" || option === "edit"}
                  className="custom-select"
                  name="type"
                  value={monitoredObject.type}
                  onChange={handleChange}
                >
                  <option disabled>Chọn loại đối tượng </option>
                  <option value="DE_DIEU">Đê điều</option>
                  <option value="CHAY_RUNG">Cháy rừng</option>
                  <option value="LUOI_DIEN">Lưới điện</option>
                  <option value="CAY_TRONG">Cây trồng</option>
                </select>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="inputStatus" className="col-sm-2 col-form-label">
                Trạng thái
              </label>
              <div className="col-sm-10">
                <select
                  disabled={option === "view"}
                  className="custom-select"
                  name="status"
                  value={monitoredObject.status || "null"}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Chưa có giá trị
                  </option>
                  <option value="1">Bình thường</option>
                  <option value="2">Đã hỏng</option>
                  <option value="3">Đang được sửa chữa</option>
                </select>
              </div>
            </div>
            <div className="form-group row">
              <label
                htmlFor="inputAreaName"
                className="col-sm-2 col-form-label"
              >
                Mô tả
              </label>
              <div className="col-sm-10">
                <input
                  disabled={option === "view"}
                  className="form-control"
                  id="inputAreaName"
                  placeholder="Mô tả cho đối tượng"
                  name="description"
                  value={monitoredObject.description}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="inputStatus" className="col-sm-2 col-form-label">
                Đối tượng liên kết
              </label>
              <div className="col-sm-10">
                <select
                  disabled={option === "view"}
                  className="custom-select"
                  name="category"
                  value={monitoredObject.category || ""}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Chưa có giá trị
                  </option>
                  {category &&
                    category.list &&
                    category.list.map((item, index) => (
                      <option value={item._id} key={index}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="inputStatus" className="col-sm-2 col-form-label">
                Khu vực giám sát
              </label>
              <div className="col-sm-10">
                <select
                  disabled={option === "view"}
                  className="custom-select"
                  name="areaMonitored"
                  value={monitoredObject.areaMonitored}
                  onChange={(e) => {
                    e.persist();
                    let index = listArea.findIndex(
                      (item) => item._id === e.target.value
                    );
                    getZonebyArea(e.target.value);
                    setMonitoredObject((formState) => ({
                      ...formState,
                      areaMonitored: e.target.value,
                      nameAreaMonitored: listArea[index].name,
                    }));
                  }}
                >
                  <option value="" disabled>
                    Chưa có giá trị
                  </option>
                  {listArea &&
                    listArea.map((item, index) => (
                      <option value={item._id} key={index}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </form>
        </div>
        <div className="col-6">
          <div className="form-group row">
            <label htmlFor="inputAreaName" className="col-sm-2 col-form-label">
              Hình ảnh
            </label>
            <div className="col-sm-10">
              <div
                style={{
                  display: "block",
                  minHeight: "1px",
                  width: "100%",
                  border: "1px solid #ddd",
                  overflow: "auto",
                }}
              >
                {monitoredObject.images &&
                  monitoredObject.images.length > 0 &&
                  monitoredObject.images.map((item, index) => (
                    <Image
                      style={{
                        paddingLeft: "7px",
                        paddingBottom: "7px",
                        cursor: "pointer",
                      }}
                      key={index}
                      width={270}
                      height={160}
                      src={item.link || "error"}
                      alt={item.title}
                      onClick={() => {
                        history.push({
                          pathname: `/image-video-detail/${item.id}`,
                        });
                      }}
                      fallback="data:image/png;base64,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"
                    />
                  ))}
              </div>
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="inputAreaName" className="col-sm-2 col-form-label">
              Video
            </label>
            <div className="col-sm-10 ">
              <ul className="d-flex p-0 m-0" style={{ overflow: "auto" }}>
                {monitoredObject.videos &&
                  monitoredObject.videos.length > 0 &&
                  monitoredObject.videos.map((item, index) => (
                    <li
                      className="mr-3"
                      style={{ listStyle: "none" }}
                      key={index}
                      onClick={()=>{
                        history.push({
                          pathname:  `/image-video-detail/${item.id}`,
                        });
                      }} 
                    >
                      <video width="320" height="240" controls>
                        <source src={item.link} type="video/mp4" />
                      </video>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-5 mb-3">
        <div className="col-4">
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Tọa độ</label>
            <div className="col-sm-10 d-flex">
              {!!monitoredObject.lat || !!monitoredObject.lng ? (
                <p className="d-flex m-0 justify-content-center align-items-center">
                  Kinh độ: {monitoredObject.lng}
                  <br />
                  Vĩ độ: {monitoredObject.lat}
                </p>
              ) : (
                <p className="d-flex m-0 justify-content-center align-items-center">
                  Chưa có giá trị{" "}
                </p>
              )}
            </div>
          </div>
          <div className="form-group row">
            <label
              htmlFor="inputAreaNumber"
              className="col-sm-2 col-form-label"
            >
              Miền giám sát
            </label>
            <div className="col-sm-10">
              <select
                disabled
                className="custom-select"
                name="monitoredZone"
                value={monitoredObject.monitoredZone}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Chưa có giá trị
                </option>
                {datazoneAll &&
                  datazoneAll.map((item, index) => (
                    <option value={item._id} key={index}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="form-group row">
            <label
              htmlFor="inputAreaNumber"
              className="col-sm-2 col-form-label"
            >
              Chiều cao đối tượng
            </label>
            <div className="col-sm-10">
              <input
                disabled={option === "view"}
                className="form-control"
                placeholder="Chiều cao đối tượng"
                name="height"
                value={monitoredObject.height}
                onChange={handleChange}
              />
              {currentMonitoredZone && (
                <p className="mt-2">
                  Chọn chiều cao cho đối tượng trong khoảng giá trị từ{" "}
                  {currentMonitoredZone.minHeight} -{" "}
                  {currentMonitoredZone.maxHeight}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="col-8">
          {dataZoneArea.length === 0 && monitoredObject.areaMonitored && (
            <div className="content row d-flex justify-content-center mb-5">
              <h4>Không có miền nào thuộc khu vực này </h4>
              <Button
                type="primary"
                icon={<FolderAddOutlined />}
                onClick={() => setStatusModalAdd(true)}
                className="ml-3"
              >
                Thêm mới miền giám sát
              </Button>
            </div>
          )}

          {monitoredObject.monitoredZone && (
            <WrappedMap
              googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyA15qz81pHiNfVEV3eeniSNhAu64SsJKgU"
              loadingElement={<div style={{ height: `100%` }} />}
              containerElement={<div style={{ height: `95vh` }} />}
              mapElement={<div style={{ height: `100%` }} />}
              onChangeMonitoredZone={onChangeMonitoredZone}
              id={id}
              getCoodinate={(zone) => getCoodinate(zone)}
              monitoredObject={monitoredObject}
              setMonitoredObject={setMonitoredObject}
              option={option}
            />
          )}
        </div>
      </div>
      <div className="footer d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-secondary mr-5"
          data-dismiss="modal"
          onClick={() => {
            history.push({
              pathname: `/monitored-object-management`,
            });
          }}
        >
          Đóng
        </button>
        {option !== "view" && (
          <button
            type="button"
            className="btn btn-primary"
            data-dismiss="modal"
            onClick={handleCreateMonitoredObject}
          >
            {option === "edit" && "Sửa thông tin"}
          </button>
        )}
      </div>
      <SuccessNotification
        history={history}
        formatStyle={formatStyle}
        messages={objectMessages}
      />
      <CreateArea
        setStatusModalAdd={setStatusModalAdd}
        create={create}
        setCreate={setCreate}
        openModalAdd={openModalAdd}
        listArea={listArea}
        setDataZoneArea={setDataZoneArea}
        dataZoneArea={dataZoneArea}
      />
    </div>
  );
}
export default MonitoredObjectView;
