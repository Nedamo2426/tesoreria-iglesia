import { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

const API_URL = "https://script.google.com/macros/s/AKfycbzpHcvIQ7ayzjomVjkj2g-wKC1nRME8C1s2LVZxeQnDRcikkaDZ_tzpUOV-5xIOUf_fTQ/exec";

export default function TesoreriaApp() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [nuevo, setNuevo] = useState({ fecha: '', categoria: '', descripcion: '', monto: '', tipo: 'Ingreso' });
  const [filtros, setFiltros] = useState({ mes: '', categoria: '' });

  const login = useGoogleLogin({ onSuccess: (tokenResponse) => setUser(tokenResponse) });

  useEffect(() => {
    if (user) {
      axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${user.access_token}` },
      }).then((res) => setProfile(res.data)).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setMovimientos(data))
      .catch(console.error);
  }, []);

  const agregarMovimiento = () => {
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(nuevo),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        setMovimientos([...movimientos, nuevo]);
        setNuevo({ fecha: '', categoria: '', descripcion: '', monto: '', tipo: 'Ingreso' });
      })
      .catch(console.error);
  };

  const movimientosFiltrados = movimientos.filter((m) =>
    (!filtros.mes || m.fecha.startsWith(filtros.mes)) &&
    (!filtros.categoria || m.categoria === filtros.categoria)
  );

  const total = movimientosFiltrados.reduce((acc, m) =>
    m.tipo === 'Ingreso' ? acc + parseFloat(m.monto || 0) : acc - parseFloat(m.monto || 0)
  , 0);

  if (!profile) {
    return <Button onClick={() => login()}>Iniciar sesión con Google</Button>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tesorería Iglesia</h1>

      <Card className="mb-4">
        <CardContent className="grid gap-2">
          <input type="date" value={nuevo.fecha} onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })} className="p-2 border rounded" />
          <input placeholder="Categoría" value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })} className="p-2 border rounded" />
          <input placeholder="Descripción" value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} className="p-2 border rounded" />
          <input placeholder="Monto" type="number" value={nuevo.monto} onChange={(e) => setNuevo({ ...nuevo, monto: e.target.value })} className="p-2 border rounded" />
          <select value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })} className="p-2 border rounded">
            <option>Ingreso</option>
            <option>Egreso</option>
          </select>
          <Button onClick={agregarMovimiento}>Agregar</Button>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="grid gap-2">
          <input placeholder="Mes (YYYY-MM)" value={filtros.mes} onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })} className="p-2 border rounded" />
          <input placeholder="Categoría" value={filtros.categoria} onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })} className="p-2 border rounded" />
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-2">Movimientos</h2>
      <ul className="space-y-2">
        {movimientosFiltrados.map((m, i) => (
          <li key={i} className="border p-2 rounded">
            <strong>{m.tipo}</strong>: {m.descripcion} - ${m.monto} [{m.fecha}] ({m.categoria})
          </li>
        ))}
      </ul>

      <h3 className="text-lg font-semibold mt-4">Total: ${total.toFixed(2)}</h3>
    </div>
  );
}