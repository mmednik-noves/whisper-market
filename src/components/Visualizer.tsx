import CountUp from 'react-countup';

interface VisualizerProps {
  price: number | null;
  direction: 'up' | 'down' | 'neutral';
  isLoading: boolean;
}

export const Visualizer = ({ price, direction, isLoading }: VisualizerProps) => {
  const getDirectionColor = () => {
    if (isLoading) return 'text-gray-400';
    return direction === 'up' ? 'text-green-500' : direction === 'down' ? 'text-red-500' : 'text-gray-400';
  };

  const formatNumber = (num: number) => {
    const [whole, decimal] = num.toFixed(8).split('.');
    return { whole, decimal };
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="relative">
        {isLoading ? (
          <span className="text-gray-400">Loading...</span>
        ) : (
          <div className={`${getDirectionColor()} font-['JetBrains_Mono'] tracking-tight`}>
            {price !== null && (
              <div className="flex items-center">
                <span className="text-[min(6rem,8vw)] leading-none flex items-center pr-4">$</span>
                <CountUp
                  start={0}
                  end={parseInt(formatNumber(price).whole)}
                  duration={0.5}
                  separator=","
                  preserveValue={true}
                  className="text-[min(15rem,20vw)]"
                />
                <span className="text-[min(5rem,6vw)] text-[#ffffff]/40 ml-2 translate-y-[0.5em]">
                  .
                  <CountUp
                    start={0}
                    end={parseInt(formatNumber(price).decimal)}
                    duration={0.5}
                    preserveValue={true}
                    separator=""
                  />
                </span>
              </div>
            )}  
          </div>
        )}
      </div>
    </div>
  );
}; 