import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Checking server...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus("Server not reachable"));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>RecruitFlow</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;
