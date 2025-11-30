import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function DestinationCard({
  image,
  title,
  description,
  category,
  href = '#'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-xl h-80 cursor-pointer"
    >
      {/* Image */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Glassmorphism content card */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <motion.div
          initial={{ opacity: 0.7, y: 20 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-effect rounded-lg p-4"
        >
          <span className="text-luxury-gold-light text-xs font-philosopher uppercase tracking-widest">
            {category}
          </span>
          <h3 className="text-2xl font-playfair text-white mt-2">
            {title}
          </h3>
          <p className="text-luxury-gray-100 text-sm mt-2 font-philosopher line-clamp-2">
            {description}
          </p>
          <motion.a
            href={href}
            whileHover={{ x: 4 }}
            className="inline-flex items-center gap-2 text-luxury-gold-light mt-3 font-philosopher text-sm uppercase tracking-wider"
          >
            Khám phá →
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
}

DestinationCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  href: PropTypes.string,
};
