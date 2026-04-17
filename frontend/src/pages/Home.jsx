import React from 'react';
import HermesModel from '../components/HermesModel';

function Home() {
  return (
    <>
      {/* HERMES watermark */}
      <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none select-none">
        <h1
          className="w-[90%] text-center font-black"
          style={{
            fontFamily: '"Monument Extended", sans-serif',
            fontSize: 'clamp(3rem, 15vw, 20rem)',
            lineHeight: 1,
            color: 'rgba(220,215,210,0.8)',
          }}
        >
          HERMES
        </h1>
      </div>

      {/* 3D Model */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <HermesModel />
      </div>
    </>
  );
}

export default Home;
