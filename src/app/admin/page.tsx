"use client";

import React, { useEffect, useRef, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

export default function ProductDashboard() {
  const [prods, setProds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [productData, setProductData] = useState([]);
  const [totalproductData, settotalProductData] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [satisfaction, setsatisfaction] = useState(0);
  const [crate, setcrate] = useState([]);
  const [cquant, setcquant] = useState([]);
  const selectedProductRef = useRef(selectedProduct);

  const [avg_cq, setavg_cq] = useState(0);
  const [avg_cs, setavg_cs] = useState(0);
  const [avg_mq, setavg_mq] = useState(0);

  const getData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/product`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.exists) {
        setProds(data.info);

        setProductData(data.info[0][1]);
        settotalProductData(data.infototal);
        setTotalProducts(data.total);

        console.log(data);
      } else {
        alert("User does not exist");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getRealtimeanalysis = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pid: selectedProductRef.current + 100,
        }),
      });
      const data = await response.json();
      if (data.exists) {
        if (data.info == selectedProductRef.current + 100) {
          setcquant(data.avg_prod);
          setcrate(data.avg_cust);
        }
      } else {
        alert("User does not exist");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getRealtime = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/realtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pid: selectedProductRef.current + 100,
        }),
      });
      const data = await response.json();
      if (data.exists) {
        if (data.info == selectedProductRef.current + 100) {
          setProductData(data.data);
          setavg_mq(data.avg_prod);
          setavg_cq(data.avg_cust[0]);
          setavg_cs(data.avg_cust[1]);
        }
      } else {
        alert("User does not exist");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  //***************************************************************************************************************************************** */

  const getRealtimetotal = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/realtimetotal`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.exists) {
        settotalProductData(data.data);
        setTotalProducts(data.total);
      } else {
        alert("User does not exist");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getRealtimetotalstatis = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/satisfaction`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.exists) {
        setsatisfaction(data.satis);
      } else {
        alert("User does not exist");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  //****************************************************************************************************************************************** */

  const handleProductChange = (event: { target: { value: string } }) => {
    const value = parseInt(event.target.value);
    setSelectedProduct(value);
    setProductData(prods[value][1]);
    /*if (crate.length !== 0 && cquant.length !== 0) {
      setavg_cq(crate[value][0]);
      setavg_cs(crate[value][1]);
      setavg_mq(cquant[value]);
    }*/

    setavg_cq(0);
    setavg_cs(0);
    setavg_mq(0);
    selectedProductRef.current = value;
  };

  useEffect(() => {
    getData();
    getRealtimetotalstatis();
  }, []);

  useEffect(() => {
    // Call getRealtime every 2 seconds
    const intervalId = setInterval(() => {
      getRealtime();
      getRealtimetotal();
    }, 500);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs only once on mount

  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Create the labels for the graph: Each month spans 5 points...........................................................
  const chartLabels = Array.from(
    { length: 60 },
    (_, i) => monthLabels[Math.floor(i / 5)]
  );

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `Product ${selectedProduct + 100}`,
        data: productData.map((item) => item[1]), // Assuming the second value is quantity
        borderColor: "rgba(75,192,192,1)",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
        ticks: {
          maxTicksLimit: 12, // Limit the number of labels to 12
        },
      },
      y: {
        title: {
          display: true,
          text: "Quantity",
        },
        beginAtZero: true,
        max: Math.max(...productData.map((element) => element[1])) + 100,
      },
    },
  };
  //*********************************************************************************************************************** */

  const datatotal = {
    labels: totalproductData.map((item) => item[0]), // x-axis
    datasets: [
      {
        label: "Product Quantities",
        data: totalproductData.map((item) => item[1]), // y-axis
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        barThickness: 7, // Set bar thickness (width)
        categoryPercentage: 0.5, // Control the width of each category
        barPercentage: 0.5, // Control the width of the bars themselves
      },
    ],
  };

  const optionstotal = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Product Quantities by Code",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Product Code",
        },
      },
      y: {
        title: {
          display: true,
          text: "Quantity",
        },
        min: Math.max(
          Math.min(...totalproductData.map((item) => item[1])) - 100,
          0
        ),
      },
    },
  };

  //..........................................................................................................................................

  return (
    <div className="container mx-auto p-4 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Product Dashboard</h1>
        <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-500">Total orders</h2>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-500">
            Customer Satisfaction
          </h2>
          <p className="text-2xl font-bold">
            {satisfaction !== 0 &&
            satisfaction !== undefined &&
            satisfaction !== null ? (
              `${satisfaction.toFixed(2)}/5`
            ) : (
              <span className="loader">
                {((totalProducts + 199) / (totalProducts - 128)).toFixed(2)}
              </span>
            )}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-500">Total Customers</h2>
          <p className="text-2xl font-bold">{101}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-500">Total Products</h2>
          <p className="text-2xl font-bold">{101}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Products Quantity Graph</h2>

        <div className="h-fit flex justify-center items-center w-full">
          {totalproductData.length !== 0 ? (
            <Bar data={datatotal} options={optionstotal} />
          ) : null}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Product Performance Timeline</h2>
        <div className="mb-4 flex flex-row justify-evenly">
          <select
            className="w-full h-10 self-center md:w-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedProduct}
            onChange={handleProductChange}
          >
            {prods.map((prod, index) => (
              <option key={index} value={index}>
                Product {prod[0]}
              </option>
            ))}
          </select>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Average sales per month
            </h2>
            <p className="text-2xl font-bold">
              {avg_mq !== 0 && avg_mq !== undefined && avg_mq !== null ? (
                `${avg_mq.toFixed(2)}`
              ) : (
                <span className="loader text-sm">Loading...</span>
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Average buyout quantity
            </h2>
            <p className="text-2xl font-bold">
              {avg_cs !== 0 && avg_cs !== undefined && avg_cs !== null ? (
                `${avg_cs.toFixed(2)}`
              ) : (
                <span className="loader text-sm">Loading...</span>
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">
              Average Customer score
            </h2>
            <p className="text-2xl font-bold">
              {avg_cq !== 0 && avg_cq !== undefined && avg_cq !== null ? (
                `${avg_cq.toFixed(2)}/5`
              ) : (
                <span className="loader text-sm">Loading...</span>
              )}
            </p>
          </div>
        </div>
        <div className="h-fit flex flex-row justify-center items-center w-full">
          {productData.length !== 0 ? (
            <Line data={chartData} options={options} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
