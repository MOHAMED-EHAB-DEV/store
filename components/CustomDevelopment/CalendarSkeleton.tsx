const CalendarSkeleton = () => {
  return (
    <div className="w-[300px] h-[300px] mb-6 flex flex-col gap-4 animate-pulse">
      <div className="flex justify-between items-center px-4">
        <div className="w-8 h-8 rounded bg-white/10" />
        <div className="w-32 h-6 rounded bg-white/10" />
        <div className="w-8 h-8 rounded bg-white/10" />
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2 px-2">
        {[...Array(7)].map((_, i) => (
          <div key={`day-${i}`} className="w-8 h-4 rounded bg-white/5 mx-auto" />
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 px-2">
        {[...Array(35)].map((_, i) => (
          <div key={`cell-${i}`} className="w-10 h-10 rounded-full bg-white/5 mx-auto" />
        ))}
      </div>
    </div>
  );
};

export default CalendarSkeleton;
