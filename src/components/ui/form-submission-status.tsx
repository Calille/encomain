import { Check, AlertCircle } from "lucide-react";

interface FormSubmissionStatusProps {
  status: "success" | "error";
  message: string;
  onReset?: () => void;
}

export function FormSubmissionStatus({
  status,
  message,
  onReset,
}: FormSubmissionStatusProps) {
  if (status === "success") {
    return (
      <div className="text-center p-8 bg-green-50 rounded-lg">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Success!</h3>
        <p className="text-green-700 mb-6">{message}</p>
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Submit Another
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center p-8 bg-red-50 rounded-lg">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-red-800 mb-2">Error</h3>
      <p className="text-red-700 mb-6">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
