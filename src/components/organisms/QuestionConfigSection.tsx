"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertTriangle,
  Plus,
  Minus,
  Shuffle,
  Target,
  Tag,
  HelpCircle,
} from "lucide-react";
import { QUESTION_SELECTION_MODE, LabelQuestionConfig } from "@/types/examSession";
import { getAvailableLabelsForExamRoomApi, LabelInfo, AvailableLabelsResponse } from "@/apis/examRoomApi";

interface QuestionConfigSectionProps {
  examRoomId: string;
  initialData?: {
    questionCount?: number | null;
    questionSelectionMode?: QUESTION_SELECTION_MODE;
    labelQuestionConfig?: LabelQuestionConfig[] | null;
    shuffleQuestions?: boolean;
  };
  onConfigChange: (config: {
    questionCount?: number | null;
    questionSelectionMode?: QUESTION_SELECTION_MODE;
    labelQuestionConfig?: LabelQuestionConfig[] | null;
    shuffleQuestions?: boolean;
  }) => void;
  disabled?: boolean;
}

export function QuestionConfigSection({
  examRoomId,
  initialData,
  onConfigChange,
  disabled = false,
}: QuestionConfigSectionProps) {
  const [selectionMode, setSelectionMode] = useState<QUESTION_SELECTION_MODE>(
    initialData?.questionSelectionMode ?? QUESTION_SELECTION_MODE.ALL
  );
  const [questionCount, setQuestionCount] = useState<number | null>(
    initialData?.questionCount ?? null
  );
  const [labelConfig, setLabelConfig] = useState<LabelQuestionConfig[]>(
    initialData?.labelQuestionConfig ?? []
  );
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(
    initialData?.shuffleQuestions ?? false
  );

  const [availableLabels, setAvailableLabels] = useState<AvailableLabelsResponse | null>(null);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [showLabelConfig, setShowLabelConfig] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  // Load available labels when needed
  const loadAvailableLabels = useCallback(async () => {
    if (selectionMode !== QUESTION_SELECTION_MODE.RANDOM_BY_LABEL) return;

    setLoadingLabels(true);
    try {
      const data = await getAvailableLabelsForExamRoomApi(examRoomId);
      setAvailableLabels(data);

      // Initialize label config if empty
      if (labelConfig.length === 0 && data.labels.length > 0) {
        const initialConfig = data.labels.map((label: LabelInfo) => ({
          labelId: label.id,
          count: 0,
        }));
        // Add unlabeled if exists
        if (data.unlabeledCount > 0) {
          initialConfig.push({
            labelId: 'unlabeled',
            count: 0,
          });
        }
        setLabelConfig(initialConfig);
      }
    } catch (error) {
      console.error('Failed to load available labels:', error);
      setValidationError('Không thể tải danh sách nhãn');
    } finally {
      setLoadingLabels(false);
    }
  }, [examRoomId, selectionMode, labelConfig.length]);

  // Load labels when mode changes to RANDOM_BY_LABEL
  useEffect(() => {
    if (selectionMode === QUESTION_SELECTION_MODE.RANDOM_BY_LABEL) {
      loadAvailableLabels();
    }
  }, [selectionMode, loadAvailableLabels]);

  // Update parent component when config changes
  useEffect(() => {
    const config = {
      questionSelectionMode: selectionMode,
      questionCount: selectionMode === QUESTION_SELECTION_MODE.RANDOM_TOTAL ? questionCount : null,
      labelQuestionConfig: selectionMode === QUESTION_SELECTION_MODE.RANDOM_BY_LABEL ? labelConfig : null,
      shuffleQuestions,
    };
    onConfigChange(config);
  }, [selectionMode, questionCount, labelConfig, shuffleQuestions]);

  // Validate configuration
  const validateConfig = useCallback(() => {
    setValidationError("");

    if (selectionMode === QUESTION_SELECTION_MODE.RANDOM_TOTAL) {
      if (!questionCount || questionCount <= 0) {
        setValidationError("Vui lòng nhập số câu hỏi hợp lệ");
        return false;
      }
      if (availableLabels && questionCount > availableLabels.totalQuestions) {
        setValidationError(`Số câu hỏi không được vượt quá ${availableLabels.totalQuestions} câu`);
        return false;
      }
    }

    if (selectionMode === QUESTION_SELECTION_MODE.RANDOM_BY_LABEL) {
      const totalConfigured = labelConfig.reduce((sum, config) => sum + config.count, 0);
      if (totalConfigured === 0) {
        setValidationError("Vui lòng cấu hình ít nhất 1 câu hỏi cho các nhãn");
        return false;
      }
      if (questionCount && totalConfigured !== questionCount) {
        setValidationError(`Tổng số câu cấu hình (${totalConfigured}) phải bằng số câu tổng (${questionCount})`);
        return false;
      }
    }

    return true;
  }, [selectionMode, questionCount, labelConfig, availableLabels]);

  // Update label config
  const updateLabelCount = (labelId: string, count: number) => {
    if (count < 0) return;

    const maxCount = availableLabels?.labels.find(l => l.id === labelId)?.questionCount ||
                     (labelId === 'unlabeled' ? availableLabels?.unlabeledCount : 0) || 0;

    if (count > maxCount) {
      count = maxCount;
    }

    setLabelConfig(prev =>
      prev.map(config =>
        config.labelId === labelId ? { ...config, count } : config
      )
    );
  };

  const totalConfiguredCount = labelConfig.reduce((sum, config) => sum + config.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Cấu hình câu hỏi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection Mode */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Chế độ chọn câu hỏi</Label>
          <Select
            value={selectionMode.toString()}
            onValueChange={(value) => setSelectionMode(parseInt(value) as QUESTION_SELECTION_MODE)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={QUESTION_SELECTION_MODE.ALL.toString()}>
                Tất cả câu hỏi ({availableLabels?.totalQuestions || 0} câu)
              </SelectItem>
              <SelectItem value={QUESTION_SELECTION_MODE.RANDOM_TOTAL.toString()}>
                Ngẫu nhiên từ tổng số
              </SelectItem>
              <SelectItem value={QUESTION_SELECTION_MODE.RANDOM_BY_LABEL.toString()}>
                Ngẫu nhiên theo nhãn
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Random Total Configuration */}
        {selectionMode === QUESTION_SELECTION_MODE.RANDOM_TOTAL && (
          <div className="space-y-3">
            <Label htmlFor="questionCount">Số câu hỏi cần thi</Label>
            <Input
              id="questionCount"
              type="number"
              min={1}
              max={availableLabels?.totalQuestions || 999}
              value={questionCount || ""}
              onChange={(e) => setQuestionCount(parseInt(e.target.value) || null)}
              placeholder={`Tối đa ${availableLabels?.totalQuestions || 0} câu`}
              disabled={disabled}
            />
            <p className="text-sm text-muted-foreground">
              Tổng số câu trong bộ đề: {availableLabels?.totalQuestions || 0}
            </p>
          </div>
        )}

        {/* Random by Label Configuration */}
        {selectionMode === QUESTION_SELECTION_MODE.RANDOM_BY_LABEL && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Cấu hình theo nhãn</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowLabelConfig(true)}
                disabled={disabled || loadingLabels}
              >
                <Tag className="h-4 w-4 mr-2" />
                Cấu hình chi tiết
              </Button>
            </div>

            {labelConfig.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Tổng số câu đã cấu hình:</span>
                  <Badge variant={totalConfiguredCount > 0 ? "default" : "secondary"}>
                    {totalConfiguredCount} câu
                  </Badge>
                </div>

                <div className="grid gap-2">
                  {labelConfig.map((config) => {
                    const label = availableLabels?.labels.find(l => l.id === config.labelId);
                    const isUnlabeled = config.labelId === 'unlabeled';
                    const availableCount = isUnlabeled
                      ? availableLabels?.unlabeledCount || 0
                      : label?.questionCount || 0;
                    const labelName = isUnlabeled ? 'Chưa gán nhãn' : label?.name || config.labelId;

                    return (
                      <div key={config.labelId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {!isUnlabeled && label?.color && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: label.color }}
                            />
                          )}
                          <span className="font-medium">{labelName}</span>
                          <span className="text-sm text-muted-foreground">
                            ({availableCount} câu có sẵn)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateLabelCount(config.labelId, config.count - 1)}
                            disabled={disabled || config.count <= 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            max={availableCount}
                            value={config.count}
                            onChange={(e) => updateLabelCount(config.labelId, parseInt(e.target.value) || 0)}
                            className="w-16 text-center"
                            disabled={disabled}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateLabelCount(config.labelId, config.count + 1)}
                            disabled={disabled || config.count >= availableCount}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {loadingLabels && (
              <div className="text-center py-4 text-muted-foreground">
                Đang tải danh sách nhãn...
              </div>
            )}
          </div>
        )}

        {/* Shuffle Questions */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Shuffle className="h-4 w-4" />
              Xáo trộn thứ tự câu hỏi
            </Label>
            <p className="text-xs text-muted-foreground">
              Mỗi thí sinh sẽ nhận được câu hỏi theo thứ tự khác nhau
            </p>
          </div>
          <Switch
            checked={shuffleQuestions}
            onCheckedChange={setShuffleQuestions}
            disabled={disabled}
          />
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded-lg text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{validationError}</span>
          </div>
        )}
      </CardContent>

      {/* Label Configuration Dialog */}
      <Dialog open={showLabelConfig} onOpenChange={setShowLabelConfig}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Cấu hình câu hỏi theo nhãn
            </DialogTitle>
            <DialogDescription>
              Phân bổ số lượng câu hỏi cho từng nhãn. Tổng số câu phải bằng số câu cần thi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {availableLabels && (
              <div className="grid gap-3">
                {availableLabels.labels.map((label) => {
                  const config = labelConfig.find(c => c.labelId === label.id);
                  return (
                    <Card key={label.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {label.color && (
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: label.color }}
                              />
                            )}
                            <div>
                              <p className="font-medium">{label.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {label.questionCount} câu có sẵn
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Số câu:</Label>
                            <Input
                              type="number"
                              min={0}
                              max={label.questionCount}
                              value={config?.count || 0}
                              onChange={(e) => updateLabelCount(label.id, parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {availableLabels.unlabeledCount > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Chưa gán nhãn</p>
                          <p className="text-sm text-muted-foreground">
                            {availableLabels.unlabeledCount} câu có sẵn
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Số câu:</Label>
                          <Input
                            type="number"
                            min={0}
                            max={availableLabels.unlabeledCount}
                            value={labelConfig.find(c => c.labelId === 'unlabeled')?.count || 0}
                            onChange={(e) => updateLabelCount('unlabeled', parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm">
                <span className="font-medium">Tổng số: </span>
                <span className={totalConfiguredCount > 0 ? "text-green-600" : "text-red-600"}>
                  {totalConfiguredCount} câu
                </span>
              </div>
              <Button onClick={() => setShowLabelConfig(false)}>
                Xong
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}