import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FileText, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Dashboard() {
  // Mock data for the dashboard
  const projectStatus = {
    status: "In Progress",
    completionPercentage: 65,
    nextMilestone: "Design Approval",
    dueDate: "2023-12-15",
  };

  const paymentStatus = {
    totalAmount: 1999,
    amountPaid: 999,
    nextPaymentDue: "2023-12-01",
    nextPaymentAmount: 1000,
  };

  const recentUpdates = [
    {
      id: 1,
      date: "2023-11-28",
      title: "Design mockups completed",
      description:
        "Initial design mockups have been completed and are ready for review.",
    },
    {
      id: 2,
      date: "2023-11-25",
      title: "Content requirements gathered",
      description:
        "All required content has been collected and organized for implementation.",
    },
    {
      id: 3,
      date: "2023-11-20",
      title: "Project kickoff meeting",
      description:
        "Initial project scope and requirements were discussed and agreed upon.",
    },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };
  
  const progressVariants = {
    hidden: { width: 0 },
    show: (width: number) => ({
      width: `${width}%`,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        delay: 0.3,
      },
    }),
  };

  return (
    <DashboardLayout title="Dashboard">
      <motion.div 
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Project Status Card */}
        <motion.div variants={item}>
          <Card className="p-6 shadow-sm border border-gray-200 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Project Status
              </h2>
              <motion.span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {projectStatus.status}
              </motion.span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Completion
                </span>
                <motion.span 
                  className="text-sm font-medium text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {projectStatus.completionPercentage}%
                </motion.span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-[#1A4D2E] h-2.5 rounded-full"
                  variants={progressVariants}
                  custom={projectStatus.completionPercentage}
                ></motion.div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <motion.div 
                className="bg-gray-50 p-3 rounded-lg"
                whileHover={{ scale: 1.03, backgroundColor: "#f0f9ff" }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="text-sm font-medium text-gray-500">
                  Next Milestone
                </div>
                <div className="mt-1 font-medium">
                  {projectStatus.nextMilestone}
                </div>
              </motion.div>
              <motion.div 
                className="bg-gray-50 p-3 rounded-lg"
                whileHover={{ scale: 1.03, backgroundColor: "#f0f9ff" }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="text-sm font-medium text-gray-500">Due Date</div>
                <div className="mt-1 font-medium">
                  {new Date(projectStatus.dueDate).toLocaleDateString()}
                </div>
              </motion.div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full bg-[#1A4D2E] hover:bg-[#1A4D2E]/90">
                <FileText className="mr-2 h-4 w-4" />
                View Project Details
              </Button>
            </motion.div>
          </Card>
        </motion.div>

        {/* Payment Status Card */}
        <motion.div variants={item}>
          <Card className="p-6 shadow-sm border border-gray-200 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Payment Status
              </h2>
              <motion.span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                Partially Paid
              </motion.span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Payment Progress
                </span>
                <motion.span 
                  className="text-sm font-medium text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  £{paymentStatus.amountPaid} of £{paymentStatus.totalAmount}
                </motion.span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-[#2D5F3F] h-2.5 rounded-full"
                  variants={progressVariants}
                  custom={(paymentStatus.amountPaid / paymentStatus.totalAmount) * 100}
                ></motion.div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <motion.div 
                className="bg-gray-50 p-3 rounded-lg"
                whileHover={{ scale: 1.03, backgroundColor: "#fefce8" }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="text-sm font-medium text-gray-500">
                  Next Payment Due
                </div>
                <div className="mt-1 font-medium">
                  {new Date(paymentStatus.nextPaymentDue).toLocaleDateString()}
                </div>
              </motion.div>
              <motion.div 
                className="bg-gray-50 p-3 rounded-lg"
                whileHover={{ scale: 1.03, backgroundColor: "#fefce8" }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="text-sm font-medium text-gray-500">Amount</div>
                <div className="mt-1 font-medium">
                  £{paymentStatus.nextPaymentAmount}
                </div>
              </motion.div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 text-[#1A1A1A]">
                <CreditCard className="mr-2 h-4 w-4" />
                Make a Payment
              </Button>
            </motion.div>
          </Card>
        </motion.div>

        {/* Recent Updates Card */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Updates
              </h2>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </motion.div>
            </div>

            <motion.div 
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {recentUpdates.map((update, index) => (
                <motion.div 
                  key={update.id} 
                  className="flex"
                  variants={item}
                  custom={index}
                  whileHover={{ x: 5 }}
                >
                  <motion.div 
                    className="mr-4 flex-shrink-0"
                    whileHover={{ rotate: 10 }}
                  >
                    <div className="h-8 w-8 rounded-full bg-[#1A4D2E]/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-[#1A4D2E]" />
                    </div>
                  </motion.div>
                  <div className="flex-1 border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{update.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(update.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {update.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.div>

        {/* Upcoming Tasks Card */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Upcoming Tasks
              </h2>
            </div>

            <motion.div 
              className="space-y-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {[
                {
                  id: 1,
                  task: "Review design mockups",
                  dueDate: "2023-12-01",
                  status: "Pending",
                },
                {
                  id: 2,
                  task: "Provide content for About page",
                  dueDate: "2023-12-05",
                  status: "Pending",
                },
                {
                  id: 3,
                  task: "Schedule design review meeting",
                  dueDate: "2023-12-10",
                  status: "Pending",
                },
              ].map((task, index) => (
                <motion.div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  variants={item}
                  custom={index}
                  whileHover={{ 
                    scale: 1.02, 
                    backgroundColor: "#f0f9ff",
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="flex items-center">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    </motion.div>
                    <span className="text-sm font-medium">{task.task}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-3">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {task.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="mt-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Button variant="link" className="text-[#1A4D2E]">
                View All Tasks
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
