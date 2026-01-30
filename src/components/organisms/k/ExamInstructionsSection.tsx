import { Card } from "@/components/ui/card";
import { InstructionItem } from "@/components/atoms/k/InstructionItem";

interface Instruction {
  text: string;
  type?: "check" | "warning";
}

interface ExamInstructionsSectionProps {
  instructions?: Instruction[];
}

const defaultInstructions: Instruction[] = [
  {
    text: "Đọc kỹ từng câu hỏi trước khi chọn câu trả lời",
    type: "check",
  },
  {
    text: "Bạn có thể điều hướng giữa các câu hỏi bằng bảng câu hỏi",
    type: "check",
  },
  {
    text: "Đánh dấu câu hỏi để xem lại nếu chưa chắc chắn",
    type: "check",
  },
  {
    text: "Nộp bài thi trước khi hết thời gian",
    type: "check",
  },
  {
    text: "Không làm mới trang hoặc đóng trình duyệt trong khi làm bài",
    type: "warning",
  },
];

export function ExamInstructionsSection({
  instructions = defaultInstructions,
}: ExamInstructionsSectionProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          i
        </div>
        <h3 className="font-semibold text-foreground">Hướng dẫn làm bài</h3>
      </div>
      <div className="space-y-3">
        {instructions.map((instruction, index) => (
          <InstructionItem
            key={index}
            text={instruction.text}
            type={instruction.type}
          />
        ))}
      </div>
    </Card>
  );
}
