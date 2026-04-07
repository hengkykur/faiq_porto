import React from 'react';

const DotPagination = ({ currentPage, setCurrentPage }) => (
  <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] flex flex-col space-y-4">
    {[0, 1, 2, 3].map((index) => (
      <button
        key={index}
        onClick={() => setCurrentPage(index)}
        className={`w-2 h-2 rounded-full transition-all duration-500 ${currentPage === index ? 'bg-primary h-8 ring-4 ring-primary/20' : 'bg-slate-600 hover:bg-slate-400'}`}
      />
    ))}
  </div>
);

export default DotPagination;
