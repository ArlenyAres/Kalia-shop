import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import './AboutPage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

const VALUES = [
  {
    title: 'Materiales responsables',
    body: 'El 80% de nuestras telas son poliamida reciclada certificada. Trabajamos únicamente con proveedores que cumplen los estándares OEKO-TEX® Standard 100.',
  },
  {
    title: 'Corte consciente',
    body: 'Nuestros patrones están optimizados para minimizar el desperdicio de tela. Cada centímetro sobrante se reutiliza en accesorios de la línea Kalia Objects.',
  },
  {
    title: 'Tallas reales',
    body: 'Diseñamos desde XS hasta XXL usando medidas de cuerpos reales, no de maniquíes. Cada pieza es probada en al menos tres tallas antes de producción.',
  },
  {
    title: 'Producción local',
    body: 'El 100% de la confección es local. Trabajamos con talleres familiares que reciben salarios por encima del mercado y tienen acceso a beneficios de salud.',
  },
];

export function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__bg" aria-hidden="true" />
        <div className="container about-hero__content">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.1}
          >
            <span className="eyebrow" style={{ color: 'var(--kalia-amber)' }}>Sobre Kalia</span>
            <h1 className="about-hero__title">
              Ropa de baño para mujeres que saben lo que quieren.
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="about-manifesto">
        <div className="container about-manifesto__inner">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
            className="about-manifesto__text"
          >
            <span className="eyebrow">Nuestro manifiesto</span>
            <h2 className="section-title" style={{ marginTop: '0.75rem' }}>
              Creadas para durar más de una temporada
            </h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0.15}
            className="about-manifesto__body"
          >
            <p>
              Kalia nació en 2024 del rechazo a la moda de temporada. Queríamos crear piezas de baño
              que no terminaran en un cajón después de un verano — diseños atemporales, materiales que
              aguantan el cloro, la sal y el sol, y una talla que sirve de verdad.
            </p>
            <p>
              Cada colección tiene entre 8 y 12 piezas. Nunca más. La edición limitada no es un truco
              de marketing: es la consecuencia natural de producir con cuidado.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Image break */}
      <div className="about-image-break">
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=80"
          alt="Modelo en la playa con Kalia"
          loading="lazy"
        />
      </div>

      {/* Values */}
      <motion.section
        className="about-values"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={fadeUp}
        custom={0}
      >
        <div className="container">
          <span className="eyebrow">Lo que nos importa</span>
          <h2 className="section-title" style={{ marginTop: '0.75rem', marginBottom: '3rem' }}>
            Nuestros compromisos
          </h2>
          <div className="about-values__grid">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                className="about-value-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                custom={i * 0.1}
              >
                <span className="about-value-card__num">0{i + 1}</span>
                <h3 className="about-value-card__title">{v.title}</h3>
                <p className="about-value-card__body">{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Founder */}
      <section className="about-founder">
        <div className="container about-founder__inner">
          <motion.div
            className="about-founder__image"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
          >
            <img
              src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80"
              alt="Fundadora de Kalia"
              loading="lazy"
            />
          </motion.div>
          <motion.div
            className="about-founder__content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0.15}
          >
            <span className="eyebrow">La fundadora</span>
            <h2 className="section-title" style={{ marginTop: '0.75rem' }}>
              "Diseño para mí misma y para mujeres que se parecen a mí."
            </h2>
            <p className="about-founder__bio">
              Después de años buscando un bikini que combinara calidad real con un diseño sin
              tendencia, decidí crearlo. Kalia es mi respuesta a una industria que cambia demasiado
              rápido y escucha demasiado poco.
            </p>
            <p className="about-founder__name">— Kalia, Fundadora & Directora Creativa</p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container about-cta__inner">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="section-title">¿Lista para encontrar tu pieza?</h2>
            <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: '2rem' }}>
              Explora la colección Resort 2026 — envíos a todo el mundo.
            </p>
            <Link to="/collection">
              <Button variant="primary" size="lg">
                Ver colección completa
                <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
