import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function WebsiteProgress() {
  // Mock data for the project progress
  const projectPhases = [
    {
      id: 1,
      name: "Discovery & Planning",
      status: "completed",
      completionDate: "2023-11-15",
      tasks: [
        { id: 1, name: "Initial consultation", status: "completed" },
        { id: 2, name: "Requirements gathering", status: "completed" },
        { id: 3, name: "Project scope definition", status: "completed" },
      ],
    },
    {
      id: 2,
      name: "Design",
      status: "in-progress",
      tasks: [
        { id: 1, name: "Wireframing", status: "completed" },
        { id: 2, name: "Visual design concepts", status: "completed" },
        { id: 3, name: "Design revisions", status: "in-progress" },
        { id: 4, name: "Final design approval", status: "pending" },
      ],
    },
    {
      id: 3,
      name: "Development",
      status: "pending",
      tasks: [
        { id: 1, name: "Frontend development", status: "pending" },
        { id: 2, name: "Backend integration", status: "pending" },
        { id: 3, name: "Content implementation", status: "pending" },
        { id: 4, name: "Responsive testing", status: "pending" },
      ],
    },
    {
      id: 4,
      name: "Testing & Launch",
      status: "pending",
      tasks: [
        { id: 1, name: "Quality assurance", status: "pending" },
        { id: 2, name: "Client review", status: "pending" },
        { id: 3, name: "Final revisions", status: "pending" },
        { id: 4, name: "Website launch", status: "pending" },
      ],
    },
  ];

  // Calculate overall progress percentage
  const calculateProgress = () => {
    const totalTasks = projectPhases.reduce(
      (acc, phase) => acc + phase.tasks.length,
      0,
    );
    const completedTasks = projectPhases.reduce(
      (acc, phase) =>
        acc + phase.tasks.filter((task) => task.status === "completed").length,
      0,
    );
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const progressPercentage = calculateProgress();

  return (
    <DashboardLayout title="Website Progress">
      <div className="space-y-6">
        {/* Overall Progress Card */}
        <Card className="p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Overall Progress
          </h2>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Completion
              </span>
              <span className="text-sm font-medium text-gray-700">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-[#1A4D2E] h-4 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {projectPhases.map((phase) => (
              <div
                key={phase.id}
                className="bg-gray-50 p-3 rounded-lg text-center"
              >
                <div className="text-sm font-medium mb-2">{phase.name}</div>
                <div className="flex justify-center">
                  {phase.status === "completed" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Completed
                    </span>
                  )}
                  {phase.status === "in-progress" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Clock className="mr-1 h-3 w-3" />
                      In Progress
                    </span>
                  )}
                  {phase.status === "pending" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Project Phases */}
        {projectPhases.map((phase) => (
          <Card key={phase.id} className="p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {phase.name}
              </h2>
              {phase.status === "completed" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Completed
                </span>
              )}
              {phase.status === "in-progress" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Clock className="mr-1 h-3 w-3" />
                  In Progress
                </span>
              )}
              {phase.status === "pending" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Pending
                </span>
              )}
            </div>

            {phase.completionDate && (
              <p className="text-sm text-gray-500 mb-4">
                Completed on:{" "}
                {new Date(phase.completionDate).toLocaleDateString()}
              </p>
            )}

            <div className="space-y-3">
              {phase.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    {task.status === "completed" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                    )}
                    {task.status === "in-progress" && (
                      <Clock className="h-5 w-5 text-blue-500 mr-3" />
                    )}
                    {task.status === "pending" && (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3"></div>
                    )}
                    <span
                      className={`text-sm font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                    >
                      {task.name}
                    </span>
                  </div>
                  <div>
                    {task.status === "completed" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}
                    {task.status === "in-progress" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        In Progress
                      </span>
                    )}
                    {task.status === "pending" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {phase.status === "in-progress" && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    Current Activity
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Our designers are currently working on finalizing the design
                    based on your feedback. We expect to complete this phase by
                    December 15, 2023.
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90">
            Schedule a Progress Call
          </Button>
          <Button variant="outline">Download Project Timeline</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
