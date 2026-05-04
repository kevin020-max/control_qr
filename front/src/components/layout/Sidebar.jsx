import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <div style={{ width: "200px", background: "#39A900", color: "white" }}>
        <h2>SENA</h2>

        <nav>
            <ul>
            <li><Link to="/aprendices">Aprendices</Link></li>
            <li><Link to="/instructores">Instructores</Link></li>
            <li><Link to="/funcionarios">Funcionarios</Link></li>
            </ul>
        </nav>
        </div>
    );
}