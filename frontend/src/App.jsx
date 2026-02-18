import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/hello");
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error connecting to backend");
    }
  };

  return (
   <div>
      <h1>Welcome to Ramdoot Mag!</h1>
   </div>
  );
}

export default App;
