import { useState } from 'react';
import { Plus, Edit, Trash2, Lock, GripVertical, Download } from 'lucide-react';
import sampleQuestions from '@/data/sample-questions.json';
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
  const [showLoadSamplesDialog, setShowLoadSamplesDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    inputFormat: '',
    expectedOutput: '',
    constraints: '',
    testInput: '',
    testOutput: '',
    points: 100,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    accessCode: '',
    order: questions.length + 1,
  });

  const isGameStarted = currentRoom?.status !== 'not_started';

  const handleAdd = () => {
    if (!currentRoom) {
      toast.error('No room selected');
      return;
    }

    // Map form data to backend API format
    const questionData = {
      title: formData.title,
      description: formData.description,
      inputFormat: formData.inputFormat,
      outputFormat: formData.expectedOutput,
      constraints: formData.constraints || 'No specific constraints',
      examples: [
        {
          input: formData.testInput || 'Sample input',
          output: formData.testOutput || 'Sample output',
          explanation: 'Example test case'
        }
      ],
      testCases: [
        {
          input: formData.testInput || 'Test input',
          expectedOutput: formData.testOutput || 'Test output',
          isHidden: false
        }
      ],
      points: formData.points,
      difficulty: formData.difficulty,
      accessCode: formData.accessCode
    };

    addQuestion(currentRoom.id, questionData);
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
      constraints: '',
      testInput: '',
      testOutput: '',
      points: 100,
      difficulty: 'medium',
      accessCode: '',
      order: questions.length + 1,
    });
  };

  const handleLoadSamples = async () => {
    if (!currentRoom) {
      toast.error('No room selected');
      return;
    }

    try {
      let successCount = 0;
      for (let i = 0; i < sampleQuestions.length; i++) {
        const question = sampleQuestions[i];
        await addQuestion(currentRoom.id, {
          ...question,
          order: questions.length + i + 1
        });
        successCount++;
      }
      toast.success(`Successfully loaded ${successCount} sample questions!`);
      setShowLoadSamplesDialog(false);
    } catch (error) {
      toast.error('Failed to load sample questions');
      console.error(error);
    }
  };

  const openEditDialog = (question: Question) => {
    setSelectedQuestion(question);
    setFormData({
      title: question.title,
      description: question.description,
      inputFormat: question.inputFormat,
      expectedOutput: question.expectedOutput,
      constraints: '', // Not stored in Question type, use empty default
      testInput: '', // Not stored in Question type, use empty default
      testOutput: '', // Not stored in Question type, use empty default
      points: question.points,
      difficulty: 'medium', // Not stored in Question type, use default
      accessCode: question.accessCode || '',
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowLoadSamplesDialog(true)}
            disabled={isGameStarted}
            className={cn(isGameStarted && 'opacity-50')}
          >
            <Download className="mr-2 h-4 w-4" />
            Load Sample Questions
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            disabled={isGameStarted}
            className={cn(isGameStarted && 'opacity-50')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
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
        <DialogContent className="max-w-xl border-border bg-card max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto pr-2">
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

            <div className="space-y-2">
              <Label>Constraints (Optional)</Label>
              <Textarea
                value={formData.constraints}
                onChange={(e) =>
                  setFormData({ ...formData, constraints: e.target.value })
                }
                placeholder="e.g., 1 <= n <= 1000"
                className="min-h-[60px] bg-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })
                  }
                  className="w-full h-10 px-3 rounded-md border border-input bg-muted text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Access Code (Optional)</Label>
                <Input
                  value={formData.accessCode}
                  onChange={(e) =>
                    setFormData({ ...formData, accessCode: e.target.value })
                  }
                  placeholder="e.g., SECRET123"
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <h4 className="text-sm font-semibold mb-3">Test Case</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Input</Label>
                  <Textarea
                    value={formData.testInput}
                    onChange={(e) =>
                      setFormData({ ...formData, testInput: e.target.value })
                    }
                    placeholder="e.g., 4&#10;2 7 11 15&#10;9"
                    className="min-h-[100px] bg-muted font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Output</Label>
                  <Textarea
                    value={formData.testOutput}
                    onChange={(e) =>
                      setFormData({ ...formData, testOutput: e.target.value })
                    }
                    placeholder="e.g., 0 1"
                    className="min-h-[100px] bg-muted font-mono text-sm"
                  />
                </div>
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

      {/* Load Sample Questions Confirmation */}
      <ConfirmDialog
        open={showLoadSamplesDialog}
        onOpenChange={setShowLoadSamplesDialog}
        title="Load Sample Questions?"
        description={`This will add ${sampleQuestions.length} pre-built coding questions to your room. Each question includes test cases, examples, and varying difficulty levels (50-250 points).`}
        confirmText="Load Questions"
        variant="default"
        onConfirm={handleLoadSamples}
      />

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
