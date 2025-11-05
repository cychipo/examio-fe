import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CategoryItem,
  type Category,
} from "@/components/molecules/CategoryItem";

interface CategoriesSidebarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoriesSidebar({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoriesSidebarProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Danh mục
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* XÓA SCROLLAREA VÀ HEIGHT CỐ ĐỊNH */}
        <div className="space-y-2 px-4 pb-4">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onClick={() => onCategoryChange(category.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}