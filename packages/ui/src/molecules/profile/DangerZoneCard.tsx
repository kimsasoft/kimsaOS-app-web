import { Button } from '../../index';

interface DangerAction {
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
}

interface DangerZoneCardProps {
  title?: string;
  description?: string;
  actions: DangerAction[];
}

export function DangerZoneCard({ 
  title = "Zona de Peligro",
  description = "Acciones irreversibles que requieren precaución.",
  actions 
}: DangerZoneCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-red-800/20">
      <div className="p-6 border-b border-red-800/20">
        <h2 className="text-lg font-semibold text-red-400">{title}</h2>
        <p className="text-sm text-red-300 mt-1">{description}</p>
      </div>

      <div className="p-6 space-y-4">
        {actions.map((action, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-400">
                {action.title}
              </h3>
              <p className="text-sm text-red-300 mt-1">
                {action.description}
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-600/50 text-red-400 hover:bg-red-900/20 hover:border-red-500"
              onClick={action.onAction}
            >
              {action.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}