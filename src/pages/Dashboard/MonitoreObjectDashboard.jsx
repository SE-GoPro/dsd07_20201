import React from "react";
import {
  Row,
  Col,
  Table,
  Spin,
} from "antd";
import {
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getMonitoreObjectMetrics } from "../../services/statistics";

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.1) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#ff8279"];

const RADIAN = Math.PI / 180;

export default function PayloadDashboard() {
  const [monitoreObjectMetrics, setMonitoreObjectMetrics] = React.useState(null);
  const chartData = React.useMemo(() => {
    if (!monitoreObjectMetrics) return [];
    return [
      { name: "Lưới điện: ", value: monitoreObjectMetrics.all.luoiDien },
      { name: "Cây trồng: ", value: monitoreObjectMetrics.all.cayTrong },
      { name: "Cháy rừng: ", value: monitoreObjectMetrics.all.chayRung },
      { name: "Đê điều: ", value: monitoreObjectMetrics.all.deDieu },
    ]
  }, [monitoreObjectMetrics]);
  const tableData = React.useMemo(() => {
    if (!monitoreObjectMetrics) return [];
    return [
      { status: "Lưới điện: ", amount: monitoreObjectMetrics.all.luoiDien },
      { status: "Cây trồng: ", amount: monitoreObjectMetrics.all.cayTrong },
      { status: "Cháy rừng: ", amount: monitoreObjectMetrics.all.chayRung },
      { status: "Đê điều: ", amount: monitoreObjectMetrics.all.deDieu },
      { status: "Tổng số: ", amount: monitoreObjectMetrics.all.total },
    ]
  }, [monitoreObjectMetrics]);
  const columns = [
    {
      title: "Loại đối tượng giám sát",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Số lượng",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <a href="#">Chi tiết</a>
      ),
    },
  ];

  // const lineChartData = React.useMemo(() => {
  //   console.log({ notifyMetrics })
  //   const getMonthData = (month) => {
  //     return {
  //       fixing: payloadMetrics?.fee?.fixing?.filter(item => (new Date(item.startedAt)).getMonth() === month).length || 0,
  //       working: payloadMetrics?.fee?.working?.filter(item => (new Date(item.startedAt)).getMonth() === month).length || 0,
  //     }
  //   }
  //   const data = Array.from(Array(12).keys()).map(month => ({
  //     name: `Th${month + 1}`,
  //     ...getMonthData(month),
  //   }));
  //   return data;
  // }, [payloadMetrics]);

  React.useEffect(() => {
    const fetchAll = async () => {
      const monitorObject = await getMonitoreObjectMetrics();
      console.log({ monitorObject })
      setMonitoreObjectMetrics(monitorObject);
    }

    fetchAll();
  }, []);

  return (
    <>
      <h1>Đối tượng giám sát</h1>
      {!monitoreObjectMetrics ? (
        <Spin />
      ) : (
        <Row>
          <Col span={10} offset={0} className="mt-5">
            <h3 className="ml-5">Tổng quan</h3>
            <ResponsiveContainer
              height={300}
              width={300}
              className="alight-item-center mx-auto mt-5"
            >
              <PieChart>
                <Pie
                  data={chartData}
                  cx={100}
                  cy={100}
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  margin={{ bottom: 10 }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend style={{ marginTop: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          </Col>
          <Col span={12} offset={2} className="mt-5">
            <h3 className="ml-1"> Số lượng thông báo theo trạng thái </h3>
            <Table
              className="mt-5"
              dataSource={tableData}
              columns={columns}
              size="small"
              bordered
            />
          </Col>
          {/* <Col span={12} className="mt-5">
            <h3 className="ml-5">Chi phí hoạt động và sửa chữa</h3>
            <LineChart
              className="mt-5"
              width={500}
              height={300}
              data={lineChartData}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fixing" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="working" stroke="#82ca9d" />
            </LineChart>
          </Col> */}
        </Row>
      )}
    </>
  );
}