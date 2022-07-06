import "./App.scss";
import LiqualityRefund from "./components/LiqualityRefund";
import { BrowserRouter as Router } from "react-router-dom";
function App() {
  return (
    <div className="App">
      <Router>
        <LiqualityRefund />
      </Router>
    </div>
  );
}

export default App;
