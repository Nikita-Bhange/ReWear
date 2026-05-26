import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../Components/Navbar'
import Categories from '../Components/Category'
import HowItWorks from '../Components/HowitWorks'
import Footer from '../Components/Footer'
import HomePage from '../Components/HomePage'
import Aboutus from './Aboutus'

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const id = location.hash.replace("#", "");

    const scrollToSection = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const timeoutId = window.setTimeout(scrollToSection, 50);
    return () => window.clearTimeout(timeoutId);
  }, [location.hash]);

  return (
    <>
    <Navbar/>
    <HomePage/>
    <section id="categories" className="scroll-mt-24">
      <Categories/>
    </section>
    <section id="about" className="scroll-mt-24">
      <Aboutus/>
    </section>
    <HowItWorks/>
    <Footer/>
    </>
  )
}

export default Home
