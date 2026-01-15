import { useState } from 'react';
import { Plus, Edit, Trash2, Lock, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useGame } from '@/contexts/GameContext';
import { ConfirmDialog } from '../ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Question } from '@/types/admin';

export function QuestionsTab() {
  const { questions, currentRoom, addQuestion, updateQuestion, deleteQuestion } = useGame();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    inputFormat: '',
    expectedOutput: '',
    points: 100,
    order: questions.length + 1,
  });

  const isGameStarted = currentRoom?.status !== 'not_started';

  const handleAdd = () => {
    addQuestion(formData);
    toast.success('Question added successfully');
    setShowAddDialog(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedQuestion) return;
    updateQuestion(selectedQuestion.id, formData);
    toast.success('Question updated successfully');
    setShowEditDialog(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedQuestion) return;
    deleteQuestion(selectedQuestion.id);
    toast.success('Question deleted');
    setShowDeleteDialog(false);
    setSelectedQuestion(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      inputFormat: '',
      expectedOutput: '',
      points: 100,
      order: questions.length + 1,
    });
  };

  const openEditDialog = (question: Question) => {
    setSelectedQuestion(question);
    setFormData({
      title: question.title,
      description: question.description,
      inputFormat: question.inputFormat,
      expectedOutput: question.expectedOutput,
      points: question.points,
      order: question.order,
    });
    setShowEditDialog(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Questions Management</h3>
          <p className="text-sm text-muted-foreground">
            {isGameStarted
              ? 'Questions are locked after game starts'
              : 'Add, edit, or remove questions before the game starts'}
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          disabled={isGameStarted}
          className={cn(isGameStarted && 'opacity-50')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="space-y-3">
        {questions
          .sort((a, b) => a.order - b.order)
          .map((question) => (
            <div
              key={question.id}
              className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-5 w-5" />
                  <span className="font-mono text-sm font-bold">#{question.order}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{question.title}</h4>
                    {question.locked && (
                      <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {question.description}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <span className="rounded-lg bg-primary/10 px-2 py-1 font-mono font-semibold text-primary">
                      {question.points} pts
                    </span>
                    <span className="text-muted-foreground">
                      Input: {question.inputFormat}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(question)}
                    disabled={isGameStarted}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedQuestion(question);
                      setShowDeleteDialog(true);
                    }}
                    disabled={isGameStarted}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

        {questions.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
            <p className="text-muted-foreground">No questions added yet</p>
            <Button variant="link" onClick={() => setShowAddDialog(true)}>
              Add your first question
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAddDialog || showEditDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setShowEditDialog(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-xl border-border bg-card">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Two Sum"
                  className="bg-muted"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({ ...formData, points: parseInt(e.target.value) || 0 })
                    }
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                    }
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the problem..."
                className="min-h-[100px] bg-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Input Format</Label>
                <Textarea
                  value={formData.inputFormat}
                  onChange={(e) =>
                    setFormData({ ...formData, inputFormat: e.target.value })
                  }
                  placeholder="e.g., Array of integers, target"
                  className="min-h-[80px] bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Expected Output</Label>
                <Textarea
                  value={formData.expectedOutput}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedOutput: e.target.value })
                  }
                  placeholder="e.g., Indices of two numbers"
                  className="min-h-[80px] bg-muted"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setShowEditDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={showEditDialog ? handleEdit : handleAdd}
              disabled={!formData.title.trim() || !formData.description.trim()}
            >
              {showEditDialog ? 'Save Changes' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Question?"
        description={`Are you sure you want to delete "${selectedQuestion?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
