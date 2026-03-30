import React from 'react';
import HermesModel from '../components/HermesModel';

function Home() {
  return (
    <>
      <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none select-none">
        <h1
          className="text-white font-black opacity-50 w-[90%] text-center"
          style={{ fontFamily: '"Monument Extended", sans-serif', fontSize: 'clamp(3rem, 15vw, 20rem)', lineHeight: 1 }}
        >
          HERMES
        </h1>
      </div>

      {/* Slogan text near bottom of Hermes model */}
      <div className="absolute bottom-[25vh] md:bottom-[30vh] inset-x-0 z-[15] flex justify-center pointer-events-none select-none w-full">
        <div className="w-[75%] md:w-[68%] grid grid-cols-3 items-end text-white/50 font-bold text-sm md:text-xl uppercase tracking-widest drop-shadow-md">
          <span className="text-right pr-2 md:pr-4">Know your Path.</span>
          <span>{/* center col — statue sits here naturally */}</span>
          <span className="text-left pl-2 md:pl-4">Know your Potential.</span>
        </div>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <HermesModel />
      </div>


    </>
  );
}

export default Home;
