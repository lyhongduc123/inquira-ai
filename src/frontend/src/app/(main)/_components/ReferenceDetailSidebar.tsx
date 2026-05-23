// "use client";

// import { PaperDetailSidebar } from "./PaperDetailSidebar";
// import { ReferenceDetailContent } from "./ReferenceDetailContent";
// import { useDetailSidebarStore } from "@/store/paper-detail-sidebar-store";

// /**
//  * Example wrapper component for displaying reference details
//  * Demonstrates how to create custom sidebar implementations
//  * 
//  * To use this:
//  * 1. Import this component in your main layout/page
//  * 2. Add it alongside PaperDetailSidebar
//  * 3. Use useDetailSidebar().openReference(data) to open
//  */
// export function ReferenceDetailSidebar() {
//   const { isOpen, contentType, content, close } = useDetailSidebarStore();

//   // Only show if sidebar is open and content type is reference
//   if (!isOpen || contentType !== "reference" || !content) {
//     return null;
//   }

//   return (
//     <PaperDetailSidebar isOpen={isOpen} onClose={close} width="500px">
//       <ReferenceDetailContent reference={content as any} />
//     </PaperDetailSidebar>
//   );
// }
