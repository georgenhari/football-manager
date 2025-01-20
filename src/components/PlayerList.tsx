import { Player } from '@prisma/client';

interface PlayerListProps {
  title: string;
  players: Player[];
  onPlayerClick: (player: Player) => void;
  buttonText: string;
  buttonColor?: 'blue' | 'red' | 'green';
}

export default function PlayerList({ 
  title, 
  players, 
  onPlayerClick, 
  buttonText,
  buttonColor = 'blue'
}: PlayerListProps) {
  const getButtonStyle = () => {
    const styles = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      red: 'bg-red-600 hover:bg-red-700',
      green: 'bg-green-600 hover:bg-green-700'
    };
    return styles[buttonColor];
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 ">
      <h3 className="text-lg font-medium mb-4">{title} ({players.length})</h3>
      <div className="h-[350px] overflow-y-auto space-y-2 pr-2">
        {players.map(player => (
          <div 
            key={player.id} 
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium text-gray-900">{player.name}</div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full
                    ${player.position === 'GK' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${player.position === 'DEF' ? 'bg-blue-100 text-blue-800' : ''}
                    ${player.position === 'MID' ? 'bg-green-100 text-green-800' : ''}
                    ${player.position === 'ATT' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {player.position}
                  </span>
                  <span className="text-sm text-gray-500">
                    ${player.price.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onPlayerClick(player)}
                className={`${getButtonStyle()} text-white px-4 py-2 rounded-md text-sm transition-colors`}
              >
                {buttonText}
              </button>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No players available
          </div>
        )}
      </div>
    </div>
  );
}