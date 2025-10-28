import { Card } from "@/components/ui/card";
import { TaskCheckItem } from "@/components/atoms/k/TaskCheckItem";

export interface Task {
  id: string;
  label: string;
  checked: boolean;
}

interface QuickTasksSectionProps {
  tasks: Task[];
  onTaskToggle: (id: string, checked: boolean) => void;
}

export function QuickTasksSection({
  tasks,
  onTaskToggle,
}: QuickTasksSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        Nhiệm vụ nhanh
      </h2>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCheckItem
            key={task.id}
            id={task.id}
            label={task.label}
            checked={task.checked}
            onCheckedChange={(checked) => onTaskToggle(task.id, checked)}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Không có nhiệm vụ nào</p>
        </div>
      )}
    </Card>
  );
}
