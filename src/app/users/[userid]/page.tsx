"use client";
import React, { useEffect, useState } from "react";
import HistoryCard from "@/components/HisoryCard";
import RecommendCard from "@/components/RecommendCard";
import RecommendCardSlideshow from "@/components/RecommendCardSlideshow";
import TaskBar from "@/components/TaskBar";
import { useRouter, usePathname } from "next/navigation";

const UserPage = () => {
  const Router = useRouter();
  const pathname = usePathname();
  const userid = pathname.split("/").pop();
  const [option, setoption] = useState("home");

  const [profile, setprofile] = useState("https://asdsdjs.jpg");
  const [name, setname] = useState("");

  const [recc, setrecc] = useState([]);
  const [prods, setprods] = useState([]);
  const [allprods, setallprods] = useState([]);

  const [modalVisible, setModalVisible] = useState(false); // For modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductname, setSelectedProductname] = useState(null); // Track selected product
  const [quantity, setQuantity] = useState(1); // Quantity state

  const [success, setsuccess] = useState(false);

  const getdata = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cid: userid,
        }),
      });
      const data = await response.json();

      if (data.exists) {
        setprods(data.info);
        setrecc(data.recc);
        setallprods(data.all);
        console.log(data.all);
      } else {
        alert("User does not exist");
      }
    } catch (error) {
      console.error("Error checking username:", error);
      alert("An error occurred");
    }
  };

  const getdataid = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/get_profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cid: userid,
        }),
      });
      const data = await response.json();

      if (data.exists) {
        setname(data.username);
        setprofile(data.pp);
      } else {
        alert("User does not exist");
      }
    } catch (error) {
      console.error("Error checking username:", error);
      alert("An error occurred");
    }
  };

  const placeorder = async (c: any, p: any, q: any, r: any) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/placeorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cid: c,
          pid: p,
          quantity: q,
          review: r,
        }),
      });
      const data = await response.json();

      if (data.success && q !== 0) {
        setsuccess(true);
        setTimeout(() => {
          setsuccess(false);
        }, 2000);
      } else {
        alert("User does not exist");
      }
    } catch (error) {
      console.error("Error checking username:", error);
      alert("An error occurred");
    }
  };

  const changereview = (newr: any, id: any) => {
    console.log("review of ", id, " changed to: ", newr);
    placeorder(userid, id, 0, newr);
  };

  const buy = (id: any, name: any) => {
    setSelectedProduct(id); // Set the product to be purchased
    setSelectedProductname(name);
    setModalVisible(true); // Show the modal
  };

  const handleConfirmPurchase = () => {
    console.log(`Buying ${quantity} of product ${selectedProduct}`);
    placeorder(userid, selectedProduct, quantity, 0);

    setModalVisible(false); // Hide modal after confirmation
  };

  useEffect(() => {
    if (userid) {
      getdata();
      getdataid();
    }
  }, [userid]);

  return (
    <div className="flex flex-col justify-start pt-20 w-full overflow-hidden">
      <TaskBar name={name} imagesrc={profile} setoption={setoption} />

      {option === "home" ? (
        <div className="flex flex-row flex-wrap justify-center">
          <RecommendCardSlideshow recc={recc} buy={buy} />
        </div>
      ) : option === "all" ? (
        <div className="flex flex-row flex-wrap justify-center">
          <div className="bg-gradient-to-t from-[#2C3E50] to-[#000000] h-screen w-screen fixed top-0 -z-10"></div>
          {allprods.map((data, index) => (
            <RecommendCard
              buy={buy}
              id={data[0]}
              name={data[1]}
              pic={data[2]}
              key={index}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-row flex-wrap justify-center ">
          <div className="bg-gradient-to-t from-[#2C3E50] to-[#000000] h-screen w-screen fixed top-0 -z-10"></div>
          {prods.map((data, index) => (
            <HistoryCard
              buy={buy}
              changereview={changereview}
              id={data[0]}
              name={data[3]}
              pic={data[2]}
              quantity={data[1][2]}
              review={data[1][0]}
              key={index}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-black">
          <div className="bg-white p-10 rounded-lg">
            <h2 className="text-3xl font-bold">Confirm Purchase</h2>
            <p>Enter quantity for product {selectedProductname}:</p>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border p-2 mt-2"
              min="1"
            />
            <div className="mt-4 flex justify-between">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setModalVisible(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleConfirmPurchase}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-black">
          <div className="bg-white p-10 rounded-lg flex flex-col justify-center">
            <h2 className="text-5xl font-bold self-center">Confirm Purchase</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
