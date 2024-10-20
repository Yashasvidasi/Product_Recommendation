"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setusername] = useState<string>("");
  const [password, setpassword] = useState<string | null>(null);
  const [pic, setpic] = useState("https://djndjfnsdjfnsdjfns.jpg");
  const [name, setname] = useState("");

  const Router = useRouter();

  const handleClick = async () => {
    console.log("herer");
    if (username === password) {
      if (username === "admin") {
        console.log("pusshing");
        Router.push("admin"); // Navigate to /admin if username is "admin"
      } else {
        // Fetch if username exists from localhost API
        try {
          const response = await fetch(`http://127.0.0.1:5000/check_username`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: username,
            }),
          });
          const data = await response.json();

          if (data.exists) {
            setpic(data.profile_picture);
            setname(username);
            Router.push(`/users/${data.userid}`); // Navigate to /username if user exists
          } else {
            alert("User does not exist");
          }
        } catch (error) {
          console.error("Error checking username:", error);
          alert("An error occurred");
        }
      }
    } else {
      alert("Username and password must match!");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Login
        </h2>
        <form>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setusername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setpassword(e.target.value)}
              required
            />
          </div>
          <button
            type="button" // It should be "button" instead of "submit" to avoid form submission
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleClick} // Correct way to call the handleClick function
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
