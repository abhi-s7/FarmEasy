import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface AssistantFabProps {
  onClick: () => void;
}

const AssistantFab = ({ onClick }: AssistantFabProps) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={onClick}
        size="lg"
        className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-xl transition-all"
        aria-label="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    </motion.div>
  );
};

export default AssistantFab;