import Sidebar from "./Sidebar";

export default function Layout({ children }) {
    return (
        <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ padding: "20px", width: "100%" }}>
            {children}
        </div>
        </div>
    );
}