"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tag,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Palette,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FlashcardSetLabel,
  getFlashcardSetLabelsApi,
  createFlashcardLabelApi,
  updateFlashcardLabelApi,
  deleteFlashcardLabelApi,
  getFlashcardsByLabelApi,
} from "@/apis/flashcardSetApi";
import { toast } from "@/components/ui/toast";
import { useFlashcardSetStore } from "@/stores/useFlashcardSetStore";
import { RichTextViewer } from "@/components/molecules/RichTextViewer";

const LABEL_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
];

interface FlashcardLabelManagerProps {
  flashcardSetId: string;
}

export function FlashcardLabelManager({ flashcardSetId }: FlashcardLabelManagerProps) {
  const { invalidateCache } = useFlashcardSetStore();
  const [labels, setLabels] = useState<FlashcardSetLabel[]>([]);
  const [unlabeledCount, setUnlabeledCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Create label dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelDescription, setNewLabelDescription] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6");

  // Edit label dialog
  const [editingLabel, setEditingLabel] = useState<FlashcardSetLabel | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState("");

  // Flashcards by label
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [labelFlashcards, setLabelFlashcards] = useState<any[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);

  // Load labels
  const loadLabels = async () => {
    try {
      const response = await getFlashcardSetLabelsApi(flashcardSetId);
      setLabels(response.labels);
      setUnlabeledCount(response.unlabeledCount);
    } catch (error) {
      console.error("Failed to load labels:", error);
      toast.error("Không thể tải danh sách nhãn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabels();
  }, [flashcardSetId]);

  const loadLabelFlashcards = async (labelId: string) => {
    setLoadingFlashcards(true);
    try {
      const response = await getFlashcardsByLabelApi(flashcardSetId, labelId);
      setLabelFlashcards(response.flashCards || []);
    } catch (error) {
      console.error("Failed to load flashcards:", error);
      toast.error("Không thể tải thẻ ghi nhớ");
      setLabelFlashcards([]);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  // Load flashcards for selected label
  useEffect(() => {
    if (selectedLabelId !== null) {
      loadLabelFlashcards(selectedLabelId);
    } else {
      setLabelFlashcards([]);
    }
  }, [selectedLabelId]);

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;

    try {
      const response = await createFlashcardLabelApi(flashcardSetId, {
        name: newLabelName.trim(),
        description: newLabelDescription.trim() || undefined,
        color: newLabelColor,
      });

      toast.success("Tạo nhãn thành công");
      setLabels(prev => [...prev, response.label]);
      setShowCreateDialog(false);
      setNewLabelName("");
      setNewLabelDescription("");
      setNewLabelColor("#3B82F6");

      // Invalidate cache to refresh data across components
      invalidateCache();
    } catch (error) {
      console.error("Failed to create label:", error);
      toast.error("Tạo nhãn thất bại");
    }
  };

  const handleEditLabel = async () => {
    if (!editingLabel || !editName.trim()) return;

    try {
      const response = await updateFlashcardLabelApi(flashcardSetId, editingLabel.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        color: editColor || null,
      });

      toast.success("Cập nhật nhãn thành công");
      setLabels(prev => prev.map(l => l.id === editingLabel.id ? response.label : l));
      setEditingLabel(null);

      // Invalidate cache to refresh data across components
      invalidateCache();
    } catch (error) {
      console.error("Failed to update label:", error);
      toast.error("Cập nhật nhãn thất bại");
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhãn này? Các thẻ ghi nhớ sẽ không có nhãn.")) return;

    try {
      await deleteFlashcardLabelApi(flashcardSetId, labelId);
      toast.success("Xóa nhãn thành công");
      setLabels(prev => prev.filter(l => l.id !== labelId));
      if (selectedLabelId === labelId) {
        setSelectedLabelId(null);
      }

      // Invalidate cache to refresh data across components
      invalidateCache();
    } catch (error) {
      console.error("Failed to delete label:", error);
      toast.error("Xóa nhãn thất bại");
    }
  };

  const startEdit = (label: FlashcardSetLabel) => {
    setEditingLabel(label);
    setEditName(label.name);
    setEditDescription(label.description || "");
    setEditColor(label.color || "");
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Quản lý nhãn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Đang tải...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Quản lý nhãn
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tạo nhãn
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo nhãn mới</DialogTitle>
                <DialogDescription>
                  Tạo nhãn để tổ chức thẻ ghi nhớ theo chủ đề
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="label-name">Tên nhãn</Label>
                  <Input
                    id="label-name"
                    placeholder="VD: Chương 1, Đại số"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="label-description">Mô tả (tùy chọn)</Label>
                  <Textarea
                    id="label-description"
                    placeholder="Mô tả về nhãn này"
                    value={newLabelDescription}
                    onChange={(e) => setNewLabelDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Màu sắc</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {LABEL_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewLabelColor(color)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2",
                          newLabelColor === color ? "border-foreground" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreateLabel} disabled={!newLabelName.trim()}>
                  Tạo nhãn
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedLabelId || "overview"} onValueChange={(value) => {
          setSelectedLabelId(value === "overview" ? null : value);
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="unlabeled" disabled={unlabeledCount === 0}>
              Chưa gán nhãn ({unlabeledCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            {labels.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có nhãn nào</p>
                <p className="text-sm mt-2">
                  Tạo nhãn để tổ chức thẻ ghi nhớ theo chủ đề
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {labels.map((label) => (
                  <Card key={label.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedLabelId(label.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {label.color && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: label.color }}
                            />
                          )}
                          <span className="font-medium">{label.name}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => startEdit(label)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteLabel(label.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {label.description || "Không có mô tả"}
                      </p>
                      <Badge variant="secondary">
                        {label.flashcardCount || 0} thẻ ghi nhớ
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unlabeled" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Thẻ ghi nhớ chưa gán nhãn</p>
              <p className="text-sm mt-2">
                Chọn một nhãn từ danh sách để xem thẻ ghi nhớ
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Flashcards by label */}
        {selectedLabelId && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Thẻ ghi nhớ trong nhãn: {labels.find(l => l.id === selectedLabelId)?.name}
            </h3>
            {loadingFlashcards ? (
              <div className="text-center py-4">Đang tải...</div>
            ) : !labelFlashcards || labelFlashcards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Không có thẻ ghi nhớ nào trong nhãn này</p>
              </div>
            ) : (
              <div className="space-y-2">
                {labelFlashcards?.map((flashcard, index) => (
                  <div key={flashcard?.id || index} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Câu hỏi:
                        </p>
                        <div className="font-medium text-sm">
                          <RichTextViewer content={flashcard?.question || ''} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Trả lời:
                        </p>
                        <div className="text-sm text-muted-foreground">
                          <RichTextViewer content={flashcard?.answer || ''} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Edit Label Dialog */}
      {editingLabel && (
        <Dialog open={!!editingLabel} onOpenChange={() => setEditingLabel(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa nhãn</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Tên nhãn</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div>
                <Label>Màu sắc</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2",
                        editColor === color ? "border-foreground" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingLabel(null)}>
                Hủy
              </Button>
              <Button onClick={handleEditLabel} disabled={!editName.trim()}>
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}