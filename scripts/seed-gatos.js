// Crea gatos de prueba en Firestore para probar estadísticas y el Excel.
// Uso: node scripts/seed-gatos.js
import "dotenv/config";
import db from "../firebase.js";

const gatos = [
  { nombre: "Michi", edad: 2, peso: 3.8, raza: "Siamés", diasAtras: 5 },
  { nombre: "Garfield", edad: 6, peso: 6.8, raza: "Persa", diasAtras: 12 },
  { nombre: "Luna", edad: 1, peso: 2.3, raza: "Mestizo", diasAtras: 20 },
  { nombre: "Tom", edad: 4, peso: 5.1, raza: "Maine Coon", diasAtras: 33 },
  { nombre: "Nala", edad: 3, peso: 4.0, raza: "Siamés", diasAtras: 41 },
  { nombre: "Simba", edad: 5, peso: 5.6, raza: "Bengalí", diasAtras: 55 },
  { nombre: "Pelusa", edad: 8, peso: 4.9, raza: "Persa", diasAtras: 68 },
  { nombre: "Oreo", edad: 2, peso: 3.5, raza: "Mestizo", diasAtras: 80 },
  { nombre: "Kira", edad: 7, peso: 4.4, raza: "Sphynx", diasAtras: 95 },
  { nombre: "Copito", edad: 1, peso: 2.9, raza: "Mestizo", diasAtras: 110 },
];

const batch = db.batch();

gatos.forEach(({ diasAtras, ...gato }, i) => {
  const fecha = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000);
  batch.set(db.collection("gatos").doc(), {
    ...gato,
    imagenUrl: `https://cataas.com/cat?seed=${i}`,
    fecha: fecha.toISOString(),
    prueba: true,
  });
});

await batch.commit();
console.log(`${gatos.length} gatos de prueba creados.`);
