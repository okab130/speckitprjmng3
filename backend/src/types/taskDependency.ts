export interface TaskDependency {
  id: string;
  fromTaskId: string; // Predecessor task
  toTaskId: string;   // Successor task
  createdAt: Date;
}

export interface CreateTaskDependencyInput {
  fromTaskId: string;
  toTaskId: string;
}

export interface TaskWithDependencies {
  id: string;
  title: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  predecessors: Array<{
    id: string;
    title: string;
  }>;
  successors: Array<{
    id: string;
    title: string;
  }>;
}
