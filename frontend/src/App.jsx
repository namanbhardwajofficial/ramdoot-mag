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
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>PDF Selling Platform</h1>

      <button
        onClick={handleClick}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Click Me
      </button>

      {message && (
        <h2 style={{ marginTop: "20px", color: "green" }}>{message}</h2>
      )}
    </div>
  );
}

export default App;
