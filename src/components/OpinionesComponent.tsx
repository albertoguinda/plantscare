import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

interface Opinion {
  texto: string;
  autor: string;
}

const opiniones: Opinion[] = [
  {
    texto:
      "Es tan fácil que lo montó mi hijo. Ahora cultivamos lechugas juntos.",
    autor: "Fernando, aficionado indoor",
  },
  {
    texto:
      "Nunca imaginé que controlaría un invernadero desde el móvil. Brutal.",
    autor: "Carla, agricultora urbana",
  },
  {
    texto:
      "Lo usamos con alumnos en prácticas. Una herramienta pedagógica fantástica.",
    autor: "Lidia, profesora FP Agraria",
  },
  {
    texto:
      "Desde que detectamos una plaga a tiempo, evitamos perder toda la cosecha.",
    autor: "Rubén, productor hidropónico",
  },
  {
    texto: "Perfecto para nuestro balcón. Simple, bonito y útil.",
    autor: "Marta y Ana, pareja urbana",
  },
  {
    texto: "Ya no tengo que preocuparme cuando me voy de viaje.",
    autor: "Javi, usuario particular",
  },
  {
    texto: "Nos ayuda a controlar los parámetros de ensayo con luces LED.",
    autor: "Dr. Núñez, investigador",
  },
  {
    texto: "Detectó hongos antes de que yo lo viera a simple vista. Increíble.",
    autor: "Tomás, agricultor senior",
  },
  {
    texto: "Mi startup lo usa en vertical farming. Muy recomendable.",
    autor: "Elena, CEO Agrotech",
  },
  {
    texto:
      "Ideal para controlar cultivos experimentales. Nos ahorra horas de trabajo.",
    autor: "David, técnico de laboratorio",
  },
  {
    texto: "Ya no peleamos por quién riega las plantas. ¡Gracias!",
    autor: "Laura, madre ocupada",
  },
  {
    texto: "Un pequeño paso para mí, un gran salto para mis tomates.",
    autor: "Nacho, fanático del huerto",
  },
];

const SwiperOpiniones: React.FC = () => {
  return (
    <div className="py-12 bg-green-50">
      {" "}
      {/* Sección general con padding */}
      <h2 className="text-3xl font-bold text-center text-green-800 mb-10">
        Lo que opinan nuestros usuarios
      </h2>
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        grabCursor
        speed={700}
        breakpoints={{
          768: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        className="mySwiper"
      >
        {opiniones.map((op, index) => (
          <SwiperSlide key={index} className="my-6">
            {" "}
            {/* Espacio arriba/abajo */}
            <blockquote className="bg-white p-6 rounded-xl shadow-md h-full mx-4">
              <p className="text-gray-700 italic mb-3">“{op.texto}”</p>
              <footer className="text-sm font-semibold text-green-800">
                — {op.autor}
              </footer>
            </blockquote>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SwiperOpiniones;
