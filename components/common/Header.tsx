
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#00a381] shadow-lg sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <h1 className="text-xl font-bold text-white tracking-wider">
            TriPlan
            <span className="ml-2 font-normal text-sm opacity-90">-トリップラン-</span>
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;