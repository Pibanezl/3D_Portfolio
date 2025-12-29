import React from 'react';
import { Tilt } from 'react-tilt';
import { motion } from 'framer-motion';
import { styles } from '../styles';
import { services } from '../constants';
import { fadeIn, textVariant } from '../utils/motion';
import { SectionWrapper } from '../hoc';

const ServiceCard = ({ index, title, icon }) => {
  return (
    < motion.div variants={fadeIn("right", "spring", 0.5 * index, 0.75)} >
      <Tilt
        options={{ max: 25, scale: 1.05, speed: 400 }}
        className="xs:w-[250px] w-[87vw] teal-lima-gradient p-[1px] rounded-[10px] shadow-card transition-transform duration-300 ease-out hover:scale-[1.03]"
      >
        <div className="bg-tertiary rounded-[10px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col">
          <img src={icon} alt={title} className="invert w-16 h-16 object-contain" />
          <h3 className="text-white text-[20px] font-bold text-center">{title}</h3>
        </div>
      </Tilt>
    </motion.div >

  )
}

const About = () => {
  return (
    <>
      <motion.div variants={textVariant()}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}>
        <p className={styles.sectionSubText}>Introduction</p>
        <h2 className={styles.sectionHeadText}>Overview</h2>
      </motion.div>
      <motion.p variants={fadeIn("", "", 0.1, 1)} className="mt-4 text-secondary text-[17px] max-w-3xl leading-[30px]">
        I am a front‑end developer with a strong creative background in 3D art: I prioritise building polished, accessible interfaces using TypeScript, JavaScript, React, and Three.js. I focus on component‑driven architecture, responsive design, and performance optimisation to deliver intuitive, scalable web experiences. As an artist, I bring visual sensibility and a keen eye for detail that enhances UI/UX and interactive visuals. I learn quickly, collaborate closely with designers and clients, and enjoy taking projects from visual prototype to production‑ready delivery.
      </motion.p>
      <div className="mt-20 flex flex-wrap gap-10">
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>
    </>
  )
}

export default SectionWrapper(About, "about")