import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import useEnVivo from "../hooks/useEnVivo";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Admin() {
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();

  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/productos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setProductos(data);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  useEnVivo(cargarProductos);

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  // AGREGAR
  const agregarProducto = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/api/productos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        alert("Producto agregado");
        form.reset();
        cargarProductos();
      } else {
        alert(data.message || "Error al agregar");
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo conectar con el servidor");
    }
  };

  // STOCK
  const actualizarStock = async (id, stock) => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`${API}/api/productos/stock/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stock })
      });
      cargarProductos();
    } catch (error) {
      console.error(error);
    }
  };

  // ELIMINAR
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;

    const token = localStorage.getItem("token");

    try {
      await fetch(`${API}/api/productos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      cargarProductos();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="admin-page">

      {/* HEADER */}
      <header className="admin-header">
        <h1>Panel de Administrador</h1>

        <button className="logout-btn" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      {/* FORMULARIO */}
      <section className="admin-form">
        <h2>Agregar producto</h2>

        <form onSubmit={agregarProducto} encType="multipart/form-data">
          <input name="nombre" placeholder="Nombre" required />
          <input name="descripcion" placeholder="Descripción" />
          <input name="precio" type="number" placeholder="Precio" required />
          <input name="stock" type="number" placeholder="Stock" required />
          <input name="imagen" type="file" required />

          <button type="submit">Guardar producto</button>
        </form>
      </section>

      {/* LISTA */}
      <section className="admin-grid">
        {productos.map((p) => (
          <div className="card-producto" key={p.cve_pro}>

            <img
              src={`${API}/uploads/${p.img_pro}`}
              alt={p.nombre_pro}
            />

            <div className="info">
              <h3>{p.nombre_pro}</h3>
              <p>${p.precio_pro}</p>

              <label>Stock</label>
              <input
                key={`${p.cve_pro}-${p.stock_pro}`}
                type="number"
                defaultValue={p.stock_pro}
                onBlur={(e) =>
                  actualizarStock(p.cve_pro, e.target.value)
                }
              />

              <button
                className="btn-delete"
                onClick={() => eliminar(p.cve_pro)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}

export default Admin;