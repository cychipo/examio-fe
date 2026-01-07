"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronRight, GraduationCap, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { subjectApi, Subject, SubjectCategory } from "@/apis/subjectApi";

// Import Lucide icons dynamically
import {
  Calculator,
  Microscope,
  BookOpen,
  MonitorSpeaker,
  Languages,
  Settings,
  TrendingUp,
  Scale,
  Palette,
  Activity,
  UserCheck,
  Plus,
  Divide,
  Sigma,
  FunctionSquare,
  Atom,
  FlaskConical,
  Dna,
  Leaf,
  Book,
  Clock,
  Map,
  Shield,
  DollarSign,
  Monitor,
  HardDrive,
  Globe,
  Bot,
  Flag,
  Zap,
  Wrench,
  Radio,
  BarChart3,
  Building2,
  Receipt,
  Megaphone,
  Scroll,
  Briefcase,
  Users,
  Building,
  Presentation,
  Laptop,
  Music,
  Theater,
  Brain,
  Dumbbell,
  Heart,
  TestTube,
  Sparkles,
  Lightbulb,
} from "lucide-react";

// Icon mapping for dynamic rendering
const iconMap = {
  // Categories
  Calculator,
  Microscope,
  BookOpen,
  MonitorSpeaker,
  Languages,
  Settings,
  TrendingUp,
  Scale,
  Palette,
  Activity,
  UserCheck,

  // Subjects
  Plus,
  Divide,
  Sigma,
  FunctionSquare,
  Atom,
  FlaskConical,
  Dna,
  Leaf,
  Book,
  Clock,
  Map,
  Shield,
  DollarSign,
  Monitor,
  HardDrive,
  Globe,
  Bot,
  Flag,
  Zap,
  Wrench,
  Radio,
  BarChart3,
  Building2,
  Receipt,
  Megaphone,
  Scroll,
  Briefcase,
  Users,
  Building,
  Presentation,
  Laptop,
  Music,
  Theater,
  Brain,
  Dumbbell,
  Heart,
  TestTube,
  Sparkles,
  Lightbulb,
} as const;

interface SubjectSelectorProps {
  onSelectSubject: (subject: Subject) => void;
  selectedSubjectId?: string | null;
  className?: string;
}

// Helper function to render icon by name
function renderIcon(iconName: string | null | undefined, className?: string) {
  if (!iconName) return null;

  const IconComponent = iconMap[iconName as keyof typeof iconMap];
  if (!IconComponent) return null;

  return <IconComponent className={className} />;
}

export function SubjectSelector({
  onSelectSubject,
  selectedSubjectId,
  className,
}: SubjectSelectorProps) {
  const [categories, setCategories] = useState<SubjectCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await subjectApi.getCategories();
        setCategories(response.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter subjects by search query
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      subjects: category.subjects?.filter((subject) =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (category) =>
        (category.subjects && category.subjects.length > 0) ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm môn học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setSearchQuery("")}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Categories Grid */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              {/* Category Header */}
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                  "bg-gradient-to-r from-muted/50 to-transparent",
                  "hover:from-muted hover:to-muted/30",
                  "border border-border/50",
                  expandedCategoryId === category.id && "border-primary/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {renderIcon(category.icon, "w-5 h-5 text-current") || <BookOpen className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {category.subjects?.length || 0} môn học
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform",
                    expandedCategoryId === category.id && "rotate-90"
                  )}
                />
              </button>

              {/* Subjects List */}
              {expandedCategoryId === category.id && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 animate-in slide-in-from-top-2">
                  {category.subjects?.map((subject) => (
                    <Card
                      key={subject.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md py-3",
                        "border-border/50 hover:border-primary/30",
                        selectedSubjectId === subject.id &&
                          "border-primary ring-2 ring-primary/20"
                      )}
                      onClick={() => onSelectSubject(subject)}
                    >
                      <CardContent className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${subject.color}20` }}
                        >
                          {renderIcon(subject.icon, "w-5 h-5 text-current") || <BookOpen className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate">
                            {subject.name}
                          </h4>
                          {subject.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {subject.description}
                            </p>
                          )}
                        </div>
                        {selectedSubjectId === subject.id && (
                          <Badge variant="secondary" className="shrink-0">
                            Đang chọn
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <GraduationCap className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Không tìm thấy môn học nào phù hợp
          </p>
        </div>
      )}
    </div>
  );
}
