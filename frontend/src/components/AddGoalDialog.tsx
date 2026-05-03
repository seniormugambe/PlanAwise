import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, Calendar as CalendarIcon, Target, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { goalCategories } from "@/data/goals";
import { useGoals } from "@/hooks/useGoals";
import { FinancialGoal } from "@/types/goal";

interface AddGoalDialogProps {
  children?: React.ReactNode;
}

export const AddGoalDialog = ({ children }: AddGoalDialogProps) => {
  const { addGoal } = useGoals();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '0',
    category: '' as FinancialGoal['category'] | '',
    priority: 'medium' as FinancialGoal['priority'],
    targetDate: undefined as Date | undefined,
    monthlyContribution: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      currentAmount: '0',
      category: '',
      priority: 'medium',
      targetDate: undefined,
      monthlyContribution: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.targetAmount || !formData.category || !formData.targetDate) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCategory = goalCategories.find(cat => cat.value === formData.category);
      
      const goalData: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        category: formData.category as FinancialGoal['category'],
        priority: formData.priority,
        targetDate: formData.targetDate,
        isActive: true,
        monthlyContribution: formData.monthlyContribution ? parseFloat(formData.monthlyContribution) : undefined,
        color: selectedCategory?.color || 'bg-gray-500',
        icon: selectedCategory?.icon || '🎯'
      };

      addGoal(goalData);
      
      // Close dialog and reset form
      setOpen(false);
      resetForm();
      
      // Show success message (you could add a toast here)
      console.log('Goal added successfully!');
      
    } catch (error) {
      console.error('Error adding goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = goalCategories.find(cat => cat.value === formData.category);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="finance" className="shadow-finance btn-glow">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="w-6 h-6 text-primary" />
            Create New Financial Goal
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Goal Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Goal Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Emergency Fund, Dream Vacation"
              className="text-base"
              required
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {goalCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105",
                    formData.category === category.value
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-xs font-medium text-center">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Amount */}
            <div className="space-y-2">
              <Label htmlFor="targetAmount" className="text-sm font-medium">
                Target Amount *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="targetAmount"
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  placeholder="5000"
                  className="pl-10 text-base"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Current Amount */}
            <div className="space-y-2">
              <Label htmlFor="currentAmount" className="text-sm font-medium">
                Current Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="currentAmount"
                  type="number"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                  placeholder="0"
                  className="pl-10 text-base"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Target Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.targetDate ? format(formData.targetDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.targetDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, targetDate: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: FinancialGoal['priority']) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High Priority</SelectItem>
                  <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                  <SelectItem value="low">🟢 Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Monthly Contribution */}
          <div className="space-y-2">
            <Label htmlFor="monthlyContribution" className="text-sm font-medium">
              Monthly Contribution (Optional)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="monthlyContribution"
                type="number"
                value={formData.monthlyContribution}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyContribution: e.target.value }))}
                placeholder="500"
                className="pl-10 text-base"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              How much do you plan to save toward this goal each month?
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add some details about your goal..."
              rows={3}
              className="text-base"
            />
          </div>

          {/* Goal Preview */}
          {formData.title && formData.targetAmount && selectedCategory && (
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <span className="text-lg">{selectedCategory.icon}</span>
                Goal Preview
              </h4>
              <div className="space-y-1 text-sm">
                <p><strong>{formData.title}</strong></p>
                <p>Target: ${parseFloat(formData.targetAmount || '0').toLocaleString()}</p>
                <p>Current: ${parseFloat(formData.currentAmount || '0').toLocaleString()}</p>
                {formData.monthlyContribution && (
                  <p>Monthly: ${parseFloat(formData.monthlyContribution).toLocaleString()}</p>
                )}
                {formData.targetDate && (
                  <p>Due: {format(formData.targetDate, "MMM dd, yyyy")}</p>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.targetAmount || !formData.category || !formData.targetDate}
              className="flex-1"
              variant="finance"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Create Goal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};