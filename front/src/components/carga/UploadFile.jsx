import { useState, useEffect } from "react";

export default function UploadFile({ tipo }) {
  const esAprendiz = tipo === "aprendices";

  const [file, setFile] = useState(null);
  const [fichas, setFichas] = useState([]);
  const [idFicha, setIdFicha] = useState("");

  const [numeroFicha, setNumeroFicha] = useState("");
  const [nombreFicha, setNombreFicha] = useState("");

  // Cargar fichas solo si es aprendiz
  const cargarFichas = async () => {
    const res = await fetch("http://localhost:3000/api/fichas");
    const data = await res.json();
    setFichas(data);
  };

  useEffect(() => {
    if (esAprendiz) {
      cargarFichas();
    }
  }, []);

  // Crear ficha solo para aprendices
  const crearFicha = async () => {
    if (!numeroFicha || !nombreFicha) {
      alert("Completa los datos de la ficha");
      return;
    }

    const res = await fetch("http://localhost:3000/api/fichas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        numero_ficha: numeroFicha,
        nombre: nombreFicha
      })
    });

    const data = await res.json();

    await cargarFichas();

    setIdFicha(data.id_ficha);

    setNumeroFicha("");
    setNombreFicha("");
  };

  // Subir archivo
  const handleSubmit = async () => {
    if (!file) {
      alert("Selecciona un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", file);

    // Solo enviar ficha si es aprendiz
    if (esAprendiz) {
      if (!idFicha) {
        alert("Selecciona o crea una ficha");
        return;
      }

      formData.append("id_ficha", idFicha);
    }

    const res = await fetch(
      `http://localhost:3000/api/carga/${tipo}`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    console.log(data);
    alert("Carga completada correctamente");
  };

  return (
    <div>

      {/* SOLO PARA APRENDICES */}
      {esAprendiz && (
        <>
          <h2>Fichas</h2>

          {/* Crear ficha */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Número de ficha"
              value={numeroFicha}
              onChange={(e) => setNumeroFicha(e.target.value)}
            />

            <input
              type="text"
              placeholder="Nombre de ficha"
              value={nombreFicha}
              onChange={(e) => setNombreFicha(e.target.value)}
            />

            <button onClick={crearFicha}>
              Crear ficha
            </button>
          </div>

          {/* Seleccionar ficha */}
          <div style={{ marginBottom: "20px" }}>
            <select
              value={idFicha}
              onChange={(e) => setIdFicha(e.target.value)}
            >
              <option value="">Seleccione ficha</option>

              {fichas.map((f) => (
                <option key={f.id_ficha} value={f.id_ficha}>
                  {f.numero_ficha} - {f.nombre}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* SUBIR ARCHIVO (TODOS) */}
      <div>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleSubmit}>
          Subir archivo
        </button>
      </div>

    </div>
  );
}