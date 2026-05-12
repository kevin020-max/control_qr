const API_URL = "http://localhost:3000/api";

export const subirArchivo = async (tipo, file) => {
    const formData = new FormData();
    formData.append("archivo", file);

    const response = await fetch(`${API_URL}/carga/${tipo}`, {
        method: "POST",
        body: formData
    });

    return response.json();
};