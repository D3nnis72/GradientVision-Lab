import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className='h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors' />
        </TooltipTrigger>
        <TooltipContent className='max-w-xs'>
          <p className='text-sm'>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
