// "use client";

// import { TypographyH3, TypographyP } from "@/components/global/typography";
// import { VStack } from "@/components/layout/vstack";
// import { HStack } from "@/components/layout/hstack";
// import { ExternalLink } from "lucide-react";
// import { Button } from "@/components/ui/button";

// interface ReferenceData {
//   id: string;
//   title: string;
//   description?: string;
//   url?: string;
//   type?: string;
//   metadata?: Record<string, unknown>;
// }

// interface ReferenceDetailContentProps {
//   reference: ReferenceData;
// }

// /**
//  * Example content component for displaying reference details in the sidebar
//  * This demonstrates how to create custom content for the DetailSidebar
//  */
// export function ReferenceDetailContent({ reference }: ReferenceDetailContentProps) {
//   return (
//     <VStack className="gap-6">
//       {/* Title */}
//       <VStack className="gap-3">
//         <TypographyH3 className="leading-tight">{reference.title}</TypographyH3>
        
//         {reference.type && (
//           <HStack className="gap-2">
//             <span className="text-xs px-2 py-1 bg-muted rounded-md font-medium">
//               {reference.type}
//             </span>
//           </HStack>
//         )}
//       </VStack>

//       {/* Description */}
//       {reference.description && (
//         <VStack className="gap-2">
//           <TypographyP weight="semibold" className="text-sm">
//             Description
//           </TypographyP>
//           <TypographyP className="text-sm leading-relaxed">
//             {reference.description}
//           </TypographyP>
//         </VStack>
//       )}

//       {/* URL */}
//       {reference.url && (
//         <VStack className="gap-2">
//           <TypographyP weight="semibold" className="text-sm">
//             Link
//           </TypographyP>
//           <Button variant="outline" size="sm" asChild>
//             <a href={reference.url} target="_blank" rel="noopener noreferrer">
//               <HStack className="gap-2 items-center">
//                 <span>Visit Reference</span>
//                 <ExternalLink className="h-4 w-4" />
//               </HStack>
//             </a>
//           </Button>
//         </VStack>
//       )}

//       {/* Metadata */}
//       {reference.metadata && Object.keys(reference.metadata).length > 0 && (
//         <VStack className="gap-2">
//           <TypographyP weight="semibold" className="text-sm">
//             Additional Information
//           </TypographyP>
//           <div className="p-3 bg-muted rounded-md">
//             <VStack className="gap-2">
//               {Object.entries(reference.metadata).map(([key, value]) => (
//                 <HStack key={key} className="gap-2 text-sm">
//                   <span className="font-medium capitalize">
//                     {key.replace(/([A-Z])/g, " $1").trim()}:
//                   </span>
//                   <span className="text-muted-foreground">
//                     {String(value)}
//                   </span>
//                 </HStack>
//               ))}
//             </VStack>
//           </div>
//         </VStack>
//       )}
//     </VStack>
//   );
// }
