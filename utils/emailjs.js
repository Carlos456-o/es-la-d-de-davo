import emailjs from '@emailjs/nodejs';

export const enviarListadoGatos = async (gatos) => {
  const message = gatos
    .map(
      (g, i) =>
        `${i + 1}. ${g.nombre} | Edad: ${g.edad} años | Peso: ${g.peso} kg | Raza: ${g.raza} | ID: ${g.id}`
    )
    .join('\n');

  const templateParams = {
    total: gatos.length,
    message: message || 'No hay gatos registrados.',
    fecha: new Date().toLocaleString('es-ES'),
    // puedes agregar más campos si tu template los necesita
  };

  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY, // altamente recomendado
      }
    );

    console.log('Email enviado con éxito:', response.status, response.text);
    return response;
  } catch (err) {
    console.error('Error al enviar email con EmailJS:', err);
    throw err;
  }
};
